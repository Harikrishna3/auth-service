const { verifyToken } = require('../config/jwt');
const prisma = require('../config/database');
const { errorResponse } = require('../utils/response');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, 401, 'Not authorized to access this route');
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return errorResponse(res, 401, 'Invalid or expired token');
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, 500, 'Server error during authentication');
  }
};

module.exports = { protect };
