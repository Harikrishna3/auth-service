const prisma = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/hashPassword');
const { generateToken } = require('../config/jwt');
const { successResponse, errorResponse } = require('../utils/response');

const signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return errorResponse(res, 400, 'User already exists with this email');
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    const token = generateToken(user.id);

    return successResponse(res, 201, 'User registered successfully', {
      user,
      token,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return errorResponse(res, 500, 'Error creating user');
  }
};

const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return errorResponse(res, 401, 'Invalid credentials');
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return errorResponse(res, 401, 'Invalid credentials');
    }

    const token = generateToken(user.id);

    return successResponse(res, 200, 'Login successful', {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error('Signin error:', error);
    return errorResponse(res, 500, 'Error during login');
  }
};

const getProfile = async (req, res) => {
  try {
    return successResponse(res, 200, 'Profile retrieved successfully', {
      user: req.user,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return errorResponse(res, 500, 'Error retrieving profile');
  }
};

module.exports = { signup, signin, getProfile };
