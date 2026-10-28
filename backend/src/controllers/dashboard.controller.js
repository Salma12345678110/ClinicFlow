
const pool = require("../config/db");

async function getDashboardStats(req, res) {
  try {
    const query = `
      SELECT
        (SELECT COUNT(*)
         FROM patients) AS "totalPatients",

        (SELECT COUNT(*)
         FROM appointments
         WHERE appointment_date >= CURRENT_DATE
           AND appointment_date < CURRENT_DATE + INTERVAL '1 day'
        ) AS "todayAppointments",

        (SELECT COUNT(*)
         FROM appointments
         WHERE status = 'pending'
        ) AS "pendingAppointments",

        (SELECT COUNT(*)
         FROM appointments
         WHERE status = 'confirmed'
        ) AS "confirmedAppointments";
    `;

    const result = await pool.query(query);
    const stats = result.rows[0];

    res.status(200).json({
      totalPatients: Number(stats.totalPatients),
      todayAppointments: Number(stats.todayAppointments),
      pendingAppointments: Number(stats.pendingAppointments),
      confirmedAppointments: Number(stats.confirmedAppointments),
    });
  } catch (error) {
    console.error("Erreur statistiques Dashboard :", error);

    res.status(500).json({
      message: "Erreur lors du chargement des statistiques.",
    });
  }
}

module.exports = { getDashboardStats };
