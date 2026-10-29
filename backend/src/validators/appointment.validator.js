const { z } = require("zod");

const appointmentSchema = z.object({
  patient_id: z.string().uuid("Identifiant du patient invalide."),
  appointment_date: z.string().datetime({
    message: "La date doit être au format ISO 8601.",
  }),
  reason: z.string().trim().min(1, "Le motif est obligatoire."),
  notes: z.string().nullable().optional(),
});

const appointmentStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "cancelled"], {
    message: "Statut invalide.",
  }),
});

module.exports = {
  appointmentSchema,
  appointmentStatusSchema,
};