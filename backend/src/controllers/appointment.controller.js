
const {
  appointmentSchema,
  appointmentStatusSchema,
} = require("../validators/appointment.validator");

const appointmentService = require("../services/appointment.service");

function isValidUUID(id) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

// Créer un rendez-vous
async function createAppointment(req, res) {
  const validation = appointmentSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      message: "Données du rendez-vous invalides.",
      errors: validation.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  try {
    const appointment = await appointmentService.createAppointment(
      validation.data,
      req.user.id
    );

    return res.status(201).json({
      message: "Rendez-vous créé avec succès.",
      appointment,
    });
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({ message: error.message });
    }

    console.error("Erreur création rendez-vous :", error.message);

    return res.status(500).json({
      message: "Erreur lors de la création du rendez-vous.",
    });
  }
}

// Lister et filtrer les rendez-vous avec pagination
async function getAppointments(req, res) {
  const { date, status } = req.query;

  // Valider la date
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({
      message: "La date doit être au format AAAA-MM-JJ.",
    });
  }

  if (
    date &&
    (!Number.isFinite(new Date(`${date}T00:00:00.000Z`).getTime()) ||
      new Date(`${date}T00:00:00.000Z`).toISOString().slice(0, 10) !== date)
  ) {
    return res.status(400).json({
      message: "Date invalide.",
    });
  }

  // Valider le statut
  if (
    status &&
    !["pending", "confirmed", "cancelled"].includes(status)
  ) {
    return res.status(400).json({
      message: "Statut invalide.",
    });
  }

  // Valider la pagination
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);

  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100
  ) {
    return res.status(400).json({
      message: "La page doit être positive et la limite doit être comprise entre 1 et 100.",
    });
  }

  try {
    const result = await appointmentService.getAppointments({
      date,
      status,
      page,
      limit,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Erreur récupération rendez-vous :", error.message);

    return res.status(500).json({
      message: "Erreur lors de la récupération des rendez-vous.",
    });
  }
}

// Modifier le statut d'un rendez-vous
async function updateAppointmentStatus(req, res) {
  if (!isValidUUID(req.params.id)) {
    return res.status(400).json({
      message: "Identifiant du rendez-vous invalide.",
    });
  }

  const validation = appointmentStatusSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      message: "Statut invalide.",
      errors: validation.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  try {
    const appointment = await appointmentService.updateAppointmentStatus(
      req.params.id,
      validation.data.status
    );

    return res.status(200).json({
      message: "Statut du rendez-vous modifié avec succès.",
      appointment,
    });
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({ message: error.message });
    }

    if (error.status === 409) {
      return res.status(409).json({ message: error.message });
    }

    console.error("Erreur modification rendez-vous :", error.message);

    return res.status(500).json({
      message: "Erreur lors de la modification du rendez-vous.",
    });
  }
}

module.exports = {
  createAppointment,
  getAppointments,
  updateAppointmentStatus,
};
