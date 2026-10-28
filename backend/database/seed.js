
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function seed() {
  try {
    const accounts = [
      {
        fullName: 'Administrateur ClinicFlow',
        email: 'admin@clinicflow.com',
        password: 'Admin1234!',
        role: 'admin',
      },
      {
        fullName: 'Sara Staff',
        email: 'sara@clinicflow.com',
        password: 'Staff1234!',
        role: 'staff',
      },
      {
        fullName: 'Amine Staff',
        email: 'amine@clinicflow.com',
        password: 'Staff5678!',
        role: 'staff',
      },
    ];

    for (const account of accounts) {
      const passwordHash = await bcrypt.hash(account.password, 10);

      await pool.query(
        `INSERT INTO users (full_name, email, password_hash, role)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO NOTHING`,
        [
          account.fullName,
          account.email,
          passwordHash,
          account.role,
        ]
      );
    }

    console.log('Comptes de test créés ou déjà présents.');
  } catch (error) {
    console.error('Erreur pendant le seed :', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seed();
