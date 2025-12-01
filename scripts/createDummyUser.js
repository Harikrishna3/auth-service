require('dotenv').config();
const prisma = require('../src/config/database');
const { hashPassword } = require('../src/utils/hashPassword');

async function createDummyUser() {
  try {
    console.log('🔄 Creating dummy user...');

    const email = 'test@example.com';
    const password = 'password123';
    const name = 'Test User';

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

    console.log('✅ Dummy user created successfully!');
    console.log('-----------------------------------');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Name:', name);
    console.log('User ID:', user.id);
    console.log('-----------------------------------');
    console.log('You can now use these credentials to login');

  } catch (error) {
    console.error('❌ Error creating dummy user:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createDummyUser();
