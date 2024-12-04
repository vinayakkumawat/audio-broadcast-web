const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');

async function setup() {
  try {
    // Default admin credentials
    const defaultEmail = 'admin@example.com';
    const defaultPassword = 'admin123'; // This will be hashed
    const hashedPassword = bcrypt.hashSync(defaultPassword, 10);

    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), 'data');
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }

    // Create or overwrite database.csv with default credentials
    const csvPath = path.join(dataDir, 'database.csv');
    const csvContent = `email,password\n${defaultEmail},${hashedPassword}`;
    
    await fs.writeFile(csvPath, csvContent, 'utf-8');
    console.log('✅ Database file created successfully');
    console.log('Default credentials:');
    console.log(`Email: ${defaultEmail}`);
    console.log(`Password: ${defaultPassword}`);
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}

setup();