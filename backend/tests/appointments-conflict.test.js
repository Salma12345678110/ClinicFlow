
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
const otherPatientId = "550e8400-e29b-41d4-a716-446655440002";
const appointmentId = "550e8400-e29b-41d4-a716-446655440003";

const token = jwt.sign(
  { id: userId, role: "admin" },
  process.env.JWT_SECRET
);

const appointmentDate = "2026-11-15T10:00:00.000Z";

function prepareMocks({
  patient = patientId,
  conflict = false,
}) {
  mockClient.query
    .mockResolvedValueOnce({}) // BEGIN
    .mockResolvedValueOnce({
      rowCount: 1,
      rows: [
        {
          id: appointmentId,
          patient_id: patient,
          appointment_date: appointmentDate,
          status: "pending",
        },
      ],
    }) // SELECT rendez-vous FOR UPDATE
    .mockResolvedValueOnce({}) // Verrou du patient
    .mockResolvedValueOnce({
      rowCount: conflict ? 1 : 0,
      rows: conflict
        ? [{ id: "550e8400-e29b-41d4-a716-446655440004" }]
        : [],
    }); // Recherche de conflit

  if (conflict) {
    mockClient.query.mockResolvedValueOnce({}); // ROLLBACK
  } else {
    mockClient.query
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [
          {
            id: appointmentId,
            patient_id: patient,
            appointment_date: appointmentDate,
            status: "confirmed",
          },
        ],
      }) // UPDATE
      .mockResolvedValueOnce({}); // COMMIT
  }
}

describe("Gestion des conflits entre rendez-vous", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockClient.query.mockReset();
    mockClient.release.mockReset();
    pool.connect.mockResolvedValue(mockClient);
  });

  test("Doit refuser deux rendez-vous espacés de 15 minutes", async () => {
    prepareMocks({ conflict: true });

    const response = await request(app)
      .patch(`/api/appointments/${appointmentId}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "confirmed" });

    expect(response.status).toBe(409);
    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    expect(mockClient.release).toHaveBeenCalled();
  });

  test("Doit refuser deux rendez-vous espacés de 29 minutes", async () => {
    prepareMocks({ conflict: true });

    const response = await request(app)
      .patch(`/api/appointments/${appointmentId}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "confirmed" });

    expect(response.status).toBe(409);
    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
  });

  test("Doit accepter deux rendez-vous espacés exactement de 30 minutes", async () => {
    prepareMocks({ conflict: false });

    const response = await request(app)
      .patch(`/api/appointments/${appointmentId}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "confirmed" });

    expect(response.status).toBe(200);
    expect(response.body.appointment.status).toBe("confirmed");
    expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
  });

  test("Doit accepter deux rendez-vous espacés de 45 minutes", async () => {
    prepareMocks({ conflict: false });

    const response = await request(app)
      .patch(`/api/appointments/${appointmentId}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "confirmed" });

    expect(response.status).toBe(200);
    expect(response.body.appointment.status).toBe("confirmed");
    expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
  });

  test("Ne doit pas considérer un rendez-vous d'un autre patient comme un conflit", async () => {
    prepareMocks({
      patient: otherPatientId,
      conflict: false,
    });

    const response = await request(app)
      .patch(`/api/appointments/${appointmentId}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "confirmed" });

    expect(response.status).toBe(200);
    expect(response.body.appointment.status).toBe("confirmed");
    expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
  });
});
