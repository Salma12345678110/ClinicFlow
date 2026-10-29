
const { z } = require("zod");

const patientSchema = z.object({
  full_name: z.string().trim().min(1, "Le nom est obligatoire."),
  cin: z.string().trim().min(1, "La CIN est obligatoire."),
  phone: z.string().trim().min(1, "Le téléphone est obligatoire."),
  birth_date: z.string().refine((value) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

    const date = new Date(`${value}T00:00:00.000Z`);

    return (
      !Number.isNaN(date.getTime()) &&
      date.toISOString().slice(0, 10) === value
    );
  }, "La date de naissance doit être valide au format AAAA-MM-JJ."),
  address: z.string().nullable().optional(),
});

module.exports = { patientSchema };
