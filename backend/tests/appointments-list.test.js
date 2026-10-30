
const request = require("supertest");
const app = require("../src/app");
const pool = require("../src/config/db");
const jwt = require("jsonwebtoken");

jest.mock("../src/config/db", () => ({
  query: jest.fn(),
  connect: jest.fn(),
  end: jest.fn(),
}));

const userId = "550e8400-e29b-41d4-a716-446655440000";

const token = jwt.sign(
  { id: userId, role: "admin" },
  process.env.JWT_SECRET
);

const mockAppointments = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    patient_id: "550e8400-e29b-41d4-a716-446655440002",
    created_by: userId,
    appointment_date: "2026-11-15T10:00:00.000Z",
    status: "pending",
    reason: "Consultation générale",
    notes: null,
    patient_name: "Ahmed Benali",
    patient_cin: "AB123456",
    created_by_name: "Admin",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    patient_id: "550e8400-e29b-41d4-a716-446655440004",
    created_by: userId,
    appointment_date: "2026-11-15T11:00:00.000Z",
    status: "confirmed",
    reason: "Contrôle médical",
    notes: "Deuxième visite",
    patient_name: "Sara Amrani",
    patient_cin: "CD789012",
    created_by_name: "Admin",
  },
];

describe("GET /api/appointments - Liste des rendez-vous", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Doit retourner la liste des rendez-vous", async () => {
    pool.query
      .mockResolvedValueOnce({
        rows: [{ total: 2 }],
      })
      .mockResolvedValueOnce({
        rows: mockAppointments,
      });

    const response = await request(app)
      .get("/api/appointments")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.appointments).toHaveLength(2);

    expect(response.body.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 2,
      totalPages: 1,
    });

    expect(pool.query).toHaveBeenCalledTimes(2);
  });

  test("Doit retourner une liste vide si aucun rendez-vous n'existe", async () => {
    pool.query
      .mockResolvedValueOnce({
        rows: [{ total: 0 }],
      })
      .mockResolvedValueOnce({
        rows: [],
      });

    const response = await request(app)
      .get("/api/appointments")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.appointments).toEqual([]);
    expect(response.body.pagination.total).toBe(0);
    expect(response.body.pagination.totalPages).toBe(0);
  });

  test("Doit filtrer les rendez-vous par date", async () => {
    pool.query
      .mockResolvedValueOnce({
        rows: [{ total: 1 }],
      })
      .mockResolvedValueOnce({
        rows: [mockAppointments[0]],
      });

    const response = await request(app)
      .get("/api/appointments?date=2026-11-15")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.appointments).toHaveLength(1);

    expect(pool.query.mock.calls[0][0]).toContain(
      "a.appointment_date >= $1::date"
    );
  });

  test("Doit filtrer les rendez-vous par statut", async () => {
    pool.query
      .mockResolvedValueOnce({
        rows: [{ total: 1 }],
      })
      .mockResolvedValueOnce({
        rows: [mockAppointments[1]],
      });

    const response = await request(app)
      .get("/api/appointments?status=confirmed")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.appointments).toHaveLength(1);

    expect(pool.query.mock.calls[0][0]).toContain(
      "a.status = $1"
    );

    expect(pool.query.mock.calls[0][1]).toEqual(["confirmed"]);
  });

  test("Doit appliquer la pagination", async () => {
    pool.query
      .mockResolvedValueOnce({
        rows: [{ total: 25 }],
      })
      .mockResolvedValueOnce({
        rows: [mockAppointments[0]],
      });

    const response = await request(app)
      .get("/api/appointments?page=2&limit=10")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.pagination).toEqual({
      page: 2,
      limit: 10,
      total: 25,
      totalPages: 3,
    });

    expect(pool.query.mock.calls[1][1]).toEqual([10, 10]);
  });

  test("Doit refuser une date invalide", async () => {
    const response = await request(app)
      .get("/api/appointments?date=15/11/2026")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "La date doit être au format AAAA-MM-JJ."
    );

    expect(pool.query).not.toHaveBeenCalled();
  });

  test("Doit retourner 500 en cas d'erreur de base de données", async () => {
    pool.query.mockRejectedValueOnce(
      new Error("Erreur base de données")
    );

    const response = await request(app)
      .get("/api/appointments")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(500);
    expect(response.body.message).toBe(
      "Erreur lors de la récupération des rendez-vous."
    );
  });
});
