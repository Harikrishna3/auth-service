require('dotenv').config();
const prisma = require('../src/config/database');
const { hashPassword } = require('../src/utils/hashPassword');

async function createSecondUser() {
  try {
    console.log('🔄 Creating second user...');

    const email = 'user2@example.com';
    const password = 'password123';
    const name = 'User Two';

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('⚠️  User already exists:', email);
      console.log('User ID:', existingUser.id);
      console.log('Name:', existingUser.name);
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    console.log('✅ Second user created successfully!');
    console.log('-----------------------------------');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Name:', name);
    console.log('User ID:', user.id);
    console.log('-----------------------------------');
    console.log('You can now use these credentials to login');

  } catch (error) {
    console.error('❌ Error creating second user:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createSecondUser();
