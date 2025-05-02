import User from '../models/user.js';
import bcrypt from 'bcrypt';

export const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Faltan campos' });
    // Validar correo institucional, ej: termina en @tuuniversity.edu
    if (!/^\S+@unisabana\.edu$/.test(email)) {
      return res.status(400).json({ message: 'Correo institucional inválido' });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Usuario ya registrado' });

    const salt = await bcrypt.genSalt(12);
    const hashed = await bcrypt.hash(password, salt);
    const newUser = new User({ email, password: hashed });
    await newUser.save();
    res.status(201).json({ message: 'Usuario registrado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error interno' });
  }
};