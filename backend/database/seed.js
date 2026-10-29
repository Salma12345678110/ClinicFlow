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
    // 1. Créer 1 administrateur et 2 membres du staff
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

    console.log('Comptes utilisateurs créés ou déjà présents.');

    // 2. Créer les 5 patients
    const patients = [
      {
        fullName: 'Salma Alaoui',
        cin: 'AB123456',
        phone: '0612345678',
        birthDate: '1998-05-12',
        address: 'Fès',
      },
      {
        fullName: 'Youssef Amrani',
        cin: 'CD234567',
        phone: '0623456789',
        birthDate: '1995-08-20',
        address: 'Meknès',
      },
      {
        fullName: 'Sara Bennani',
        cin: 'EF345678',
        phone: '0634567890',
        birthDate: '2000-02-15',
        address: 'Casablanca',
      },
      {
        fullName: 'Omar Idrissi',
        cin: 'GH456789',
        phone: '0645678901',
        birthDate: '1992-11-03',
        address: 'Rabat',
      },
      {
        fullName: 'Nadia Tazi',
        cin: 'IJ567890',
        phone: '0656789012',
        birthDate: '1988-07-25',
        address: 'Tanger',
      },
    ];

    for (const patient of patients) {
      await pool.query(
        `INSERT INTO patients
          (full_name, cin, phone, birth_date, address)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (cin) DO NOTHING`,
        [
          patient.fullName,
          patient.cin,
          patient.phone,
          patient.birthDate,
          patient.address,
        ]
      );
    }

    console.log('Les 5 patients ont été créés ou existaient déjà.');
    console.log('Seed terminé avec succès.');
  } catch (error) {
    console.error('Erreur pendant le seed :', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seed();