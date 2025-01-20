import jwt from ('jsonwebtoken');
const { ACCESS_TOKEN_SECRET } = process.env;

const generateAccessToken = (user) => {
  return jwt.sign(user, ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
};

module.exports = { generateAccessToken };
