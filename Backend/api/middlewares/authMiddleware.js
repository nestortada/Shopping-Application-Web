import jwt from 'jsonwebtoken';

export function authenticateToken(req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1];  // Obtener token del header Authorization

  if (!token) {
    return res.status(403).json({ message: 'Acceso denegado: Token no proporcionado' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido o expirado' });
    }

    req.user = user;  // Agregar información del usuario al request
    next();
  });
}
