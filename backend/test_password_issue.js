// Test if the User model's comparePassword works
const bcrypt = require('bcrypt');

// Simulate the User model's comparePassword method
async function comparePassword(candidatePassword, storedHash) {
  return bcrypt.compare(candidatePassword, storedHash);
}

async function test() {
  const password = 'Demo123!';
  const seedHash = '$2b$10$cuxtDMGAPnYN595um0PtauSaGMXy9SQIHIhMqAHrUYcwjAGEiPZXi';
  
  console.log('Testing User.comparePassword simulation...');
  const result = await comparePassword(password, seedHash);
  console.log('Result:', result);
  
  // Also check if the issue is with password field retrieval
  console.log('\nTesting with user object simulation...');
  const mockUser = {
    email: 'admin@hairdonerightson.com',
    password: seedHash,
    comparePassword: async function(candidatePassword) {
      return bcrypt.compare(candidatePassword, this.password);
    }
  };
  
  const userResult = await mockUser.comparePassword(password);
  console.log('User comparePassword result:', userResult);
}

test().catch(err => console.error('Error:', err));
