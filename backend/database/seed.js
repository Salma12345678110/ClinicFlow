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
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

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

      await client.query(
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
      await client.query(
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

    // 3. Récupérer les utilisateurs et les patients existants
    const usersResult = await client.query(
      `SELECT id, email FROM users
       WHERE email IN (
         'admin@clinicflow.com',
         'sara@clinicflow.com',
         'amine@clinicflow.com'
       )`
    );

    const patientsResult = await client.query(
      `SELECT id, cin FROM patients
       WHERE cin IN (
         'AB123456', 'CD234567', 'EF345678',
         'GH456789', 'IJ567890'
       )`
    );

    const users = Object.fromEntries(
      usersResult.rows.map((user) => [user.email, user.id])
    );

    const patientsByCin = Object.fromEntries(
      patientsResult.rows.map((patient) => [patient.cin, patient.id])
    );

    if (
      !users['admin@clinicflow.com'] ||
      !users['sara@clinicflow.com'] ||
      !users['amine@clinicflow.com'] ||
      Object.keys(patientsByCin).length !== 5
    ) {
      throw new Error('Impossible de récupérer tous les utilisateurs ou patients.');
    }

    // 4. Préparer les 10 rendez-vous avec des statuts mélangés
    const appointments = [
      {
        cin: 'AB123456',
        creator: 'admin@clinicflow.com',
        date: '2026-11-02T09:00:00Z',
        status: 'confirmed',
        reason: 'Consultation générale',
      },
      {
        cin: 'CD234567',
        creator: 'sara@clinicflow.com',
        date: '2026-11-02T10:00:00Z',
        status: 'confirmed',
        reason: 'Consultation de suivi',
      },
      {
        cin: 'EF345678',
        creator: 'amine@clinicflow.com',
        date: '2026-11-02T11:00:00Z',
        status: 'confirmed',
        reason: 'Consultation médicale',
      },
      {
        cin: 'GH456789',
        creator: 'sara@clinicflow.com',
        date: '2026-11-03T09:00:00Z',
        status: 'pending',
        reason: 'Contrôle de routine',
      },
      {
        cin: 'IJ567890',
        creator: 'admin@clinicflow.com',
        date: '2026-11-03T10:00:00Z',
        status: 'pending',
        reason: 'Consultation initiale',
      },
      {
        cin: 'AB123456',
        creator: 'amine@clinicflow.com',
        date: '2026-11-03T11:00:00Z',
        status: 'pending',
        reason: 'Suivi médical',
      },
      {
        cin: 'CD234567',
        creator: 'admin@clinicflow.com',
        date: '2026-11-04T09:00:00Z',
        status: 'pending',
        reason: 'Bilan de santé',
      },
      {
        cin: 'EF345678',
        creator: 'sara@clinicflow.com',
        date: '2026-11-04T10:00:00Z',
        status: 'cancelled',
        reason: 'Consultation annulée A',
      },
      {
        cin: 'GH456789',
        creator: 'amine@clinicflow.com',
        date: '2026-11-04T11:00:00Z',
        status: 'cancelled',
        reason: 'Consultation annulée B',
      },
      {
        cin: 'IJ567890',
        creator: 'admin@clinicflow.com',
        date: '2026-11-05T09:00:00Z',
        status: 'cancelled',
        reason: 'Consultation annulée C',
      },
    ];

    // 5. Insérer les rendez-vous sans dupliquer ceux du seed
    for (const appointment of appointments) {
      await client.query(
        `INSERT INTO appointments
          (patient_id, created_by, appointment_date, status, reason)
         SELECT $1, $2, $3, $4, $5
         WHERE NOT EXISTS (
           SELECT 1
           FROM appointments
           WHERE patient_id = $1
             AND appointment_date = $3::timestamptz
             AND reason = $5
         )`,
        [
          patientsByCin[appointment.cin],
          users[appointment.creator],
          appointment.date,
          appointment.status,
          appointment.reason,
        ]
      );
    }

    await client.query('COMMIT');

    // 6. Vérifier le nombre de rendez-vous créés par ce seed
    const result = await client.query(
      `SELECT status, COUNT(*)::int AS total
       FROM appointments
       WHERE reason IN (
         'Consultation générale',
         'Consultation de suivi',
         'Consultation médicale',
         'Contrôle de routine',
         'Consultation initiale',
         'Suivi médical',
         'Bilan de santé',
         'Consultation annulée A',
         'Consultation annulée B',
         'Consultation annulée C'
       )
       GROUP BY status
       ORDER BY status`
    );

    console.log('Rendez-vous du seed :', result.rows);
    console.log('Seed terminé avec succès.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erreur pendant le seed :', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();