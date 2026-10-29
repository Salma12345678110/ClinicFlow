const pool = require("../config/db");
const { patientSchema } = require("../validators/patient.validator");

// Vérifier si l'identifiant est un UUID valide
function isValidUUID(id) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

// Ajouter un patient
async function createPatient(req, res) {
  try {
    const validation = patientSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Données du patient invalides.",
        errors: validation.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const { full_name, cin, phone, birth_date, address } =
      validation.data;

    const result = await pool.query(
      `INSERT INTO patients (full_name, cin, phone, birth_date, address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [full_name, cin, phone, birth_date, address || null]
    );

    return res.status(201).json({
      message: "Patient ajouté avec succès.",
      patient: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Un patient avec cette CIN existe déjà.",
      });
    }

    console.error("Erreur création patient :", error.message);

    return res.status(500).json({
      message: "Erreur lors de la création du patient.",
    });
  }
}

// Afficher les patients avec recherche et pagination
async function getPatients(req, res) {
  try {
    const page = Math.max(
      1,
      Number.parseInt(req.query.page, 10) || 1
    );

    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 10)
    );

    const offset = (page - 1) * limit;
    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    const searchPattern = `%${search}%`;

    const result = await pool.query(
      `SELECT id, full_name, cin, phone, birth_date, address, created_at
       FROM patients
       WHERE full_name ILIKE $1 OR cin ILIKE $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [searchPattern, limit, offset]
    );

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total
       FROM patients
       WHERE full_name ILIKE $1 OR cin ILIKE $1`,
      [searchPattern]
    );

    const total = countResult.rows[0].total;

    return res.status(200).json({
      patients: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Erreur récupération patients :", error.message);

    return res.status(500).json({
      message: "Erreur lors de la récupération des patients.",
    });
  }
}

// Afficher un patient par son identifiant
async function getPatientById(req, res) {
  if (!isValidUUID(req.params.id)) {
    return res.status(400).json({
      message: "Identifiant du patient invalide.",
    });
  }

  try {
    const result = await pool.query(
      `SELECT id, full_name, cin, phone, birth_date, address, created_at
       FROM patients
       WHERE id = $1`,
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Patient introuvable.",
      });
    }

    return res.status(200).json({
      patient: result.rows[0],
    });
  } catch (error) {
    console.error("Erreur récupération patient :", error.message);

    return res.status(500).json({
      message: "Erreur lors de la récupération du patient.",
    });
  }
}

// Modifier un patient
async function updatePatient(req, res) {
  if (!isValidUUID(req.params.id)) {
    return res.status(400).json({
      message: "Identifiant du patient invalide.",
    });
  }

  try {
    const validation = patientSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Données du patient invalides.",
        errors: validation.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const { full_name, cin, phone, birth_date, address } =
      validation.data;

    const result = await pool.query(
      `UPDATE patients
       SET full_name = $1,
           cin = $2,
           phone = $3,
           birth_date = $4,
           address = $5
       WHERE id = $6
       RETURNING id, full_name, cin, phone, birth_date, address, created_at`,
      [
        full_name,
        cin,
        phone,
        birth_date,
        address || null,
        req.params.id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Patient introuvable.",
      });
    }

    return res.status(200).json({
      message: "Patient modifié avec succès.",
      patient: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Un patient avec cette CIN existe déjà.",
      });
    }

    console.error("Erreur modification patient :", error.message);

    return res.status(500).json({
      message: "Erreur lors de la modification du patient.",
    });
  }
}

// Supprimer un patient
async function deletePatient(req, res) {
  if (!isValidUUID(req.params.id)) {
    return res.status(400).json({
      message: "Identifiant du patient invalide.",
    });
  }

  try {
    const result = await pool.query(
      `DELETE FROM patients
       WHERE id = $1
       RETURNING id`,
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Patient introuvable.",
      });
    }

    return res.status(200).json({
      message: "Patient supprimé avec succès.",
    });
  } catch (error) {
    if (error.code === "23503") {
      return res.status(409).json({
        message:
          "Impossible de supprimer ce patient : il possède des rendez-vous.",
      });
    }

    console.error("Erreur suppression patient :", error.message);

    return res.status(500).json({
      message: "Erreur lors de la suppression du patient.",
    });
  }
}

module.exports = {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
};