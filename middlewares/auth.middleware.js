import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res
      .status(403)
      .json({error: 'A token is required for authentication'});
  }

  try {
    const decoded = jwt.verify(token, 'secretKey');
    req.user = decoded;
  } catch (err) {
    return res.status(401).json({error: 'Invalid Token'});
  }

  return next();
};

export default verifyToken;
