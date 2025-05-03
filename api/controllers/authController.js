// api/controllers/authController.js
import bcrypt from 'bcrypt';

export async function registerUser(req, res, next, db) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Faltan campos' });
    }

    if (!email.endsWith('@unisabana.edu.co')) {
      return res.status(400).json({ message: 'Correo institucional inválido' });
    }

    const users = db.collection('users');
    const exists = await users.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: 'Usuario ya registrado' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashed = await bcrypt.hash(password, salt);

    await users.insertOne({ email, password: hashed, createdAt: new Date() });

    res.status(201).json({ message: 'Usuario registrado' });
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