
const pool = require("../config/db");

// Vérifier qu'un patient existe
async function patientExists(patientId) {
  const result = await pool.query(
    "SELECT id FROM patients WHERE id = $1",
    [patientId]
  );

  return result.rowCount > 0;
}

// Vérifier le conflit des rendez-vous confirmés.
// Deux rendez-vous du même patient doivent être espacés
// d'au moins 30 minutes.
async function hasConfirmedConflict(
  client,
  patientId,
  appointmentDate,
  excludeAppointmentId = null
) {
  const result = await client.query(
    `SELECT id
     FROM appointments
     WHERE patient_id = $1
       AND status = 'confirmed'
       AND ABS(
         EXTRACT(
           EPOCH FROM (appointment_date - $2::timestamptz)
         )
       ) < 1800
       AND ($3::uuid IS NULL OR id <> $3::uuid)
     LIMIT 1`,
    [patientId, appointmentDate, excludeAppointmentId]
  );

  return result.rowCount > 0;
}

// Créer un rendez-vous
async function createAppointment(data, userId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Sérialiser les vérifications pour un même patient
    await client.query(
      "SELECT pg_advisory_xact_lock(hashtext($1))",
      [data.patient_id]
    );

    const exists = await patientExists(data.patient_id);

    if (!exists) {
      const error = new Error("Patient introuvable.");
      error.status = 404;
      throw error;
    }

    // Un rendez-vous est créé en attente
    const result = await client.query(
      `INSERT INTO appointments
       (patient_id, created_by, appointment_date, status, reason, notes)
       VALUES ($1, $2, $3, 'pending', $4, $5)
       RETURNING *`,
      [
        data.patient_id,
        userId,
        data.appointment_date,
        data.reason,
        data.notes || null,
      ]
    );

    await client.query("COMMIT");

    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// Consulter les rendez-vous avec filtres et pagination
async function getAppointments({
  date,
  status,
  page = 1,
  limit = 10,
}) {
  const conditions = [];
  const values = [];

  if (date) {
    values.push(date);
    const index = values.length;

    conditions.push(
      `a.appointment_date >= $${index}::date
       AND a.appointment_date < ($${index}::date + INTERVAL '1 day')`
    );
  }

  if (status) {
    values.push(status);
    conditions.push(`a.status = $${values.length}`);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  // Compter uniquement les rendez-vous correspondant aux filtres
  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total
     FROM appointments a
     ${whereClause}`,
    values
  );

  const total = countResult.rows[0].total;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;

  // Récupérer uniquement les rendez-vous de la page demandée
  const queryValues = [...values, limit, offset];

  const result = await pool.query(
    `SELECT
       a.id,
       a.patient_id,
       a.created_by,
       a.appointment_date,
       a.status,
       a.reason,
       a.notes,
       a.created_at,
       p.full_name AS patient_name,
       p.cin AS patient_cin,
       u.full_name AS created_by_name
     FROM appointments a
     JOIN patients p ON p.id = a.patient_id
     JOIN users u ON u.id = a.created_by
     ${whereClause}
     ORDER BY a.appointment_date ASC, a.id ASC
     LIMIT $${queryValues.length - 1}
     OFFSET $${queryValues.length}`,
    queryValues
  );

  return {
    appointments: result.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

// Modifier le statut
async function updateAppointmentStatus(id, status) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const appointmentResult = await client.query(
      `SELECT id, patient_id, appointment_date, status
       FROM appointments
       WHERE id = $1
       FOR UPDATE`,
      [id]
    );

    if (appointmentResult.rowCount === 0) {
      const error = new Error("Rendez-vous introuvable.");
      error.status = 404;
      throw error;
    }

    const appointment = appointmentResult.rows[0];

    // Verrouiller le patient pour éviter deux confirmations simultanées
    await client.query(
      "SELECT pg_advisory_xact_lock(hashtext($1))",
      [appointment.patient_id]
    );

    if (status === "confirmed") {
      const conflict = await hasConfirmedConflict(
        client,
        appointment.patient_id,
        appointment.appointment_date,
        appointment.id
      );

      if (conflict) {
        const error = new Error(
          "Ce patient possède déjà un rendez-vous confirmé dans une fenêtre de 30 minutes."
        );
        error.status = 409;
        throw error;
      }
    }

    const result = await client.query(
      `UPDATE appointments
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    await client.query("COMMIT");

    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  createAppointment,
  getAppointments,
  updateAppointmentStatus,
};
