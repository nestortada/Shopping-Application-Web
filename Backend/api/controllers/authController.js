// backend/api/controllers/authController.js

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';  // ← Importamos ObjectId

/**
 * Registra un nuevo usuario asignándole rol según el dominio de su email.
 */
export async function registerUser(req, res, next, db) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Faltan campos' });
    }

    let role;
    if (email.endsWith('@unisabana.edu.co')) {
      role = 'Perfil Cliente';
    } else if (email.endsWith('@sabanapos.edu.co')) {
      role = 'Perfil POS';
    } else {
      return res.status(400).json({ message: 'Correo no válido para registro' });
    }

    const users = db.collection('users');
    const exists = await users.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: 'Usuario ya registrado' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashed = await bcrypt.hash(password, salt);
    await users.insertOne({ email, password: hashed, role, createdAt: new Date() });

    res.status(201).json({ message: 'Usuario registrado', role });
  } catch (err) {
    next(err);
  }
}

/**
 * Verifica si un email ya está registrado.
 */
export async function checkEmail(req, res, next, db) {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: 'Falta el email' });
    }
    const exists = await db.collection('users').findOne({ email });
    res.json({ exists: !!exists });
  } catch (err) {
    next(err);
  }
}

/**
 * Autentica al usuario y devuelve un JWT con id, email y rol.
 */
export async function loginUser(req, res, next, db) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Faltan campos' });
    }

    const users = db.collection('users');
    const user = await users.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ token, message: 'Inicio de sesión exitoso' });
  } catch (err) {
    next(err);
  }
}

/**
 * Devuelve el perfil (id, email, rol) del usuario autenticado.
 */
export async function getUserProfile(req, res) {
  const { id, email, role } = req.user;
  res.status(200).json({ id, email, role });
}

/**
 * Actualiza el rol de un usuario existente.
 */
export async function updateUserRole(req, res, next, db) {
  try {
    const { email, role } = req.body;
    if (!email || !role) {
      return res.status(400).json({ message: 'Faltan campos' });
    }
    if (!['Perfil POS', 'Perfil Cliente'].includes(role)) {
      return res.status(400).json({ message: 'Rol inválido' });
    }

    const users = db.collection('users');
    const result = await users.updateOne({ email }, { $set: { role } });
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json({ message: 'Rol actualizado correctamente' });
  } catch (err) {
    next(err);
  }
}

/**
 * Genera un resetToken, lo guarda en BD y devuelve el enlace.
 */
export async function forgotPassword(req, res, next, db) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'El correo electrónico es requerido' });
    }

    const users = db.collection('users');
    const user = await users.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No existe una cuenta con este correo electrónico' });
    }

    const resetToken = jwt.sign(
      { id: user._id.toString() },
      process.env.JWT_RESET_SECRET,
      { expiresIn: '1h' }
    );

    await users.updateOne(
      { _id: user._id },
      {
        $set: {
          resetToken,
          resetTokenExpires: new Date(Date.now() + 3600000)
        }
      }
    );

    // Determinar qué URL del frontend usar basado en el origen de la petición
    const frontendUrls = process.env.FRONTEND_URLS.split(',').map(url => url.trim());
    const origin = req.headers.origin;
    const baseUrl = frontendUrls.includes(origin) ? origin : frontendUrls[frontendUrls.length - 1]; // Usa la última URL (producción) como fallback
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

    return res.status(200).json({
      message: 'Token generado con éxito',
      resetLink
    });
  } catch (err) {
    console.error('Error en forgotPassword:', err);
    return res.status(500).json({ message: 'Error al procesar la solicitud' });
  }
}

/**
 * Verifica el token, actualiza la contraseña y limpia el resetToken.
 */
export async function resetPassword(req, res, next, db) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      console.log('Token o nueva contraseña faltante');
      return res.status(400).json({ message: 'Token y nueva contraseña son requeridos' });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_RESET_SECRET);
      console.log('Token verificado con éxito:', payload);
    } catch (err) {
      console.error('Error al verificar el token:', err.message);
      return res.status(400).json({ message: 'Token inválido o expirado' });
    }

    const users = db.collection('users');
    // ← Convertimos payload.id (string) a ObjectId para que coincida con el _id de Mongo
    const user = await users.findOne({ _id: new ObjectId(payload.id), resetToken: token });
    if (!user) {
      console.log('Usuario no encontrado o token no coincide');
      return res.status(400).json({ message: 'Token inválido o expirado' });
    }

    if (new Date() > new Date(user.resetTokenExpires)) {
      console.log('Token expirado:', user.resetTokenExpires);
      return res.status(400).json({ message: 'Token expirado' });
    }

    console.log('Actualizando contraseña para el usuario:', user._id);
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await users.updateOne(
      { _id: user._id },
      {
        $set: { password: hashedPassword },
        $unset: { resetToken: '', resetTokenExpires: '' },
      }
    );

    console.log('Contraseña actualizada exitosamente para el usuario:', user._id);
    return res.status(200).json({ message: 'Contraseña actualizada exitosamente' });
  } catch (err) {
    console.error('Error en resetPassword:', err);
    next(err);
  }
}
