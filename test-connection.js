const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  console.log('Testing Supabase PostgreSQL connection...\n');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 5000
  });

  try {
    console.log('Connection string:', process.env.DATABASE_URL.substring(0, 50) + '...');
    console.log('Attempting to connect...');
    
    await client.connect();
    console.log('✅ Connection successful!\n');

    // Test basic query
    const result = await client.query('SELECT version()');
    console.log('Database version:', result.rows[0].version);
    
    // Check tables
    const tableResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('\nExisting tables:');
    if (tableResult.rows.length === 0) {
      console.log('⚠️  No tables found! Need to run: npx prisma migrate deploy');
    } else {
      tableResult.rows.forEach(row => console.log('  -', row.table_name));
    }

    await client.end();
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    process.exit(1);
  }
}

testConnection();
