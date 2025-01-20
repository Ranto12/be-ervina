import jwt from 'jsonwebtoken';
const { ACCESS_TOKEN_SECRET } = process.env;

// Middleware untuk verifikasi token dan role
const authenticate = (req, res, next) => {
  const token = req.cookies.accessToken || req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Forbidden' });
  }
};

// Middleware untuk verifikasi hanya Admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Middleware untuk verifikasi hanya User
const isUser = (req, res, next) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({ message: 'User access required' });
  }
  next();
};

export { authenticate, isAdmin, isUser };
