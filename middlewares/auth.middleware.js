import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
  // const token = req.headers['authorization'];
  const token = req.headers['authorization']?.split(' ')[1]; // Token Bearer

  if (!token) {
    return res
      .status(403)
      .json({error: 'A token is required for authentication'});
  }

  try {
    const decoded = jwt.verify(token, 'secretKey');
    req.user = decoded;
  } catch (err) {
    return res.status(401).json({error: `Invalid Token: ${err.message}`});
  }

  return next();
};

export default verifyToken;
