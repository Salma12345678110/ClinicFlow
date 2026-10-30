
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
const appointmentId = "550e8400-e29b-41d4-a716-446655440001";
const patientId = "550e8400-e29b-41d4-a716-446655440002";

const token = jwt.sign(
  { id: userId, role: "admin" },
  process.env.JWT_SECRET
);

const existingAppointment = {
  id: appointmentId,
  patient_id: patientId,
  appointment_date: "2026-11-15T10:00:00.000Z",
  status: "pending",
};

describe("PATCH /api/appointments/:id/status - Modification du statut", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pool.connect.mockResolvedValue(mockClient);
  });

  test("Doit confirmer un rendez-vous", async () => {
    mockClient.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [existingAppointment],
      }) // SELECT rendez-vous FOR UPDATE
      .mockResolvedValueOnce({}) // Verrou du patient
      .mockResolvedValueOnce({
        rowCount: 0,
        rows: [],
      }) // Aucun conflit
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [
          {
            ...existingAppointment,
            status: "confirmed",
          },
        ],
      }) // UPDATE
      .mockResolvedValueOnce({}); // COMMIT

    const response = await request(app)
      .patch(`/api/appointments/${appointmentId}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "confirmed" });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      "Statut du rendez-vous modifié avec succès."
    );
    expect(response.body.appointment.status).toBe("confirmed");

    expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
    expect(mockClient.release).toHaveBeenCalled();
  });

  test("Doit annuler un rendez-vous", async () => {
    mockClient.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [existingAppointment],
      }) // SELECT rendez-vous FOR UPDATE
      .mockResolvedValueOnce({}) // Verrou du patient
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [
          {
            ...existingAppointment,
            status: "cancelled",
          },
        ],
      }) // UPDATE
      .mockResolvedValueOnce({}); // COMMIT

    const response = await request(app)
      .patch(`/api/appointments/${appointmentId}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "cancelled" });

    expect(response.status).toBe(200);
    expect(response.body.appointment.status).toBe("cancelled");

    expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
    expect(mockClient.release).toHaveBeenCalled();
  });

  test("Doit refuser un statut invalide", async () => {
    const response = await request(app)
      .patch(`/api/appointments/${appointmentId}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "finished" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Statut invalide.");

    expect(pool.connect).not.toHaveBeenCalled();
  });

  test("Doit retourner 404 si le rendez-vous n'existe pas", async () => {
    mockClient.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({
        rowCount: 0,
        rows: [],
      }) // Rendez-vous introuvable
      .mockResolvedValueOnce({}); // ROLLBACK

    const response = await request(app)
      .patch(`/api/appointments/${appointmentId}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "confirmed" });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Rendez-vous introuvable.");

    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    expect(mockClient.release).toHaveBeenCalled();
  });

  test("Doit retourner 409 en cas de conflit de 30 minutes", async () => {
    mockClient.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [existingAppointment],
      }) // SELECT rendez-vous FOR UPDATE
      .mockResolvedValueOnce({}) // Verrou du patient
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ id: "550e8400-e29b-41d4-a716-446655440003" }],
      }) // Conflit détecté
      .mockResolvedValueOnce({}); // ROLLBACK

    const response = await request(app)
      .patch(`/api/appointments/${appointmentId}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "confirmed" });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe(
      "Ce patient possède déjà un rendez-vous confirmé dans une fenêtre de 30 minutes."
    );

    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    expect(mockClient.release).toHaveBeenCalled();
  });

  test("Doit refuser un identifiant UUID invalide", async () => {
    const response = await request(app)
      .patch("/api/appointments/123/status")
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "confirmed" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Identifiant du rendez-vous invalide."
    );

    expect(pool.connect).not.toHaveBeenCalled();
  });
});
