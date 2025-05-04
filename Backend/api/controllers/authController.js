// api/controllers/authController.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function registerUser(req, res, next, db) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Faltan campos' });
    }

    // Determinar el rol según el dominio del correo
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

export async function checkEmail(req, res, next, db) {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Falta el email' });
    const exists = await db.collection('users').findOne({ email });
    return res.json({ exists: !!exists });
  } catch (err) {
    next(err);
  }
}

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

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

    // Generar el token JWT con el rol del usuario
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ token, message: 'Inicio de sesión exitoso' });
  } catch (err) {
    next(err);
  }
}

export async function getUserProfile(req, res) {
  const { id, email, role } = req.user;
  res.status(200).json({ id, email, role });
}

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