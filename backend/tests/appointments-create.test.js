
const request = require("supertest");
const app = require("../src/app");
const pool = require("../src/config/db");
const jwt = require("jsonwebtoken");

jest.mock("../src/config/db", () => ({
  query: jest.fn(),
  connect: jest.fn(),
  end: jest.fn(),
}));

const mockClient = {
  query: jest.fn(),
  release: jest.fn(),
};

const userId = "550e8400-e29b-41d4-a716-446655440000";
const patientId = "550e8400-e29b-41d4-a716-446655440001";

const token = jwt.sign(
  { id: userId, role: "admin" },
  process.env.JWT_SECRET
);

const validAppointment = {
  patient_id: patientId,
  appointment_date: "2026-11-15T10:00:00.000Z",
  reason: "Consultation générale",
  notes: "Première visite",
};

describe("POST /api/appointments - Création d'un rendez-vous", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    pool.connect.mockResolvedValue(mockClient);

    // patientExists() utilise pool.query()
    pool.query.mockResolvedValue({
      rowCount: 1,
      rows: [{ id: patientId }],
    });
  });

  test("Doit créer un rendez-vous avec des données valides", async () => {
    mockClient.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({}) // Verrou du patient
      .mockResolvedValueOnce({
        rows: [
          {
            id: "550e8400-e29b-41d4-a716-446655440002",
            ...validAppointment,
            created_by: userId,
            status: "pending",
          },
        ],
      }) // INSERT
      .mockResolvedValueOnce({}); // COMMIT

    const response = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${token}`)
      .send(validAppointment);

    expect(response.status).toBe(201);

    expect(response.body.message).toBe(
      "Rendez-vous créé avec succès."
    );

    expect(response.body.appointment.status).toBe("pending");

    expect(pool.query).toHaveBeenCalledWith(
      "SELECT id FROM patients WHERE id = $1",
      [patientId]
    );

    expect(mockClient.query).toHaveBeenCalledWith("BEGIN");
    expect(mockClient.query).toHaveBeenCalledWith("COMMIT");

    expect(mockClient.release).toHaveBeenCalled();
  });

  test("Doit refuser la création sans token JWT", async () => {
    const response = await request(app)
      .post("/api/appointments")
      .send(validAppointment);

    expect(response.status).toBe(401);
    expect(pool.connect).not.toHaveBeenCalled();
  });

  test("Doit refuser un patient_id invalide", async () => {
    const response = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        ...validAppointment,
        patient_id: "123",
      });

    expect(response.status).toBe(400);
    expect(pool.connect).not.toHaveBeenCalled();
  });

  test("Doit refuser une date invalide", async () => {
    const response = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        ...validAppointment,
        appointment_date: "15/11/2026",
      });

    expect(response.status).toBe(400);
    expect(pool.connect).not.toHaveBeenCalled();
  });

  test("Doit refuser un motif vide", async () => {
    const response = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        ...validAppointment,
        reason: "   ",
      });

    expect(response.status).toBe(400);
    expect(pool.connect).not.toHaveBeenCalled();
  });

  test("Doit retourner 404 si le patient n'existe pas", async () => {
    pool.query.mockResolvedValueOnce({
      rowCount: 0,
      rows: [],
    });

    mockClient.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({}) // Verrou du patient
      .mockResolvedValueOnce({}); // ROLLBACK

    const response = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${token}`)
      .send(validAppointment);

    expect(response.status).toBe(404);

    expect(response.body.message).toBe("Patient introuvable.");

    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    expect(mockClient.release).toHaveBeenCalled();
  });
});
