import { useEffect, useState } from "react";
import "./Appointments.css";

const API_URL = "http://localhost:5000/api/appointments";
const PAGE_SIZE = 10;

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 0,
  });

  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    patient_id: "",
    appointment_date: "",
    reason: "",
    notes: "",
  });

  const token = localStorage.getItem("token");

  async function request(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Une erreur est survenue.");
    }

    return data;
  }

  async function loadAppointments() {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });

      if (statusFilter) params.set("status", statusFilter);
      if (dateFilter) params.set("date", dateFilter);

      const data = await request(`${API_URL}?${params.toString()}`);

      setAppointments(
        Array.isArray(data) ? data : data.appointments || []
      );

      if (data.pagination) {
        setPagination(data.pagination);
      } else {
        setPagination({
          page,
          limit: PAGE_SIZE,
          total: Array.isArray(data) ? data.length : 0,
          totalPages: Math.ceil(
            (Array.isArray(data) ? data.length : 0) / PAGE_SIZE
          ),
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadPatients() {
    try {
      const data = await request("http://localhost:5000/api/patients");
      setPatients(Array.isArray(data) ? data : data.patients || []);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [page, statusFilter, dateFilter]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function resetToFirstPage() {
    setPage(1);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      await request(API_URL, {
        method: "POST",
        body: JSON.stringify({
          ...form,
          appointment_date: new Date(
            form.appointment_date
          ).toISOString(),
          notes: form.notes || null,
        }),
      });

      setSuccess("Rendez-vous créé avec succès.");
      setForm({
        patient_id: "",
        appointment_date: "",
        reason: "",
        notes: "",
      });

      setPage(1);
      await loadAppointments();
    } catch (err) {
      setError(err.message);
    }
  }

  async function updateStatus(id, status) {
    setError("");
    setSuccess("");

    try {
      await request(`${API_URL}/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      setSuccess("Statut du rendez-vous mis à jour.");
      await loadAppointments();
    } catch (err) {
      setError(err.message);
    }
  }

  function formatDate(value) {
    return new Date(value).toLocaleString("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  const totalPages = pagination.totalPages;
  const firstItem =
    pagination.total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastItem = Math.min(page * PAGE_SIZE, pagination.total);

  return (
    <main className="appointments-page">
      <header className="appointments-header">
        <div>
          <h1>Gestion des rendez-vous</h1>
          <p>Créer, consulter et gérer les rendez-vous des patients.</p>
        </div>
      </header>

      {error && <div className="appointment-alert error">{error}</div>}
      {success && <div className="appointment-alert success">{success}</div>}

      <section className="appointment-card">
        <h2>Nouveau rendez-vous</h2>

        <form className="appointment-form" onSubmit={handleSubmit}>
          <label>
            Patient
            <select
              name="patient_id"
              value={form.patient_id}
              onChange={handleChange}
              required
            >
              <option value="">Sélectionner un patient</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.full_name} — {patient.cin}
                </option>
              ))}
            </select>
          </label>

          <label>
            Date et heure
            <input
              type="datetime-local"
              name="appointment_date"
              value={form.appointment_date}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Motif
            <input
              type="text"
              name="reason"
              value={form.reason}
              onChange={handleChange}
              placeholder="Ex. : Consultation générale"
              required
            />
          </label>

          <label>
            Notes (facultatif)
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Informations complémentaires"
            />
          </label>

          <button type="submit" className="appointment-primary">
            Créer le rendez-vous
          </button>
        </form>
      </section>

      <section className="appointment-card">
        <h2>Liste des rendez-vous</h2>

        <div className="appointment-filters">
          <label>
            Filtrer par date
            <input
              type="date"
              value={dateFilter}
              onChange={(event) => {
                setDateFilter(event.target.value);
                resetToFirstPage();
              }}
            />
          </label>

          <label>
            Filtrer par statut
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                resetToFirstPage();
              }}
            >
              <option value="">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmé</option>
              <option value="cancelled">Annulé</option>
            </select>
          </label>

          <button
            type="button"
            className="appointment-secondary"
            onClick={() => {
              setDateFilter("");
              setStatusFilter("");
              setPage(1);
            }}
          >
            Réinitialiser
          </button>
        </div>

        {loading ? (
          <p>Chargement des rendez-vous...</p>
        ) : appointments.length === 0 ? (
          <p>Aucun rendez-vous trouvé.</p>
        ) : (
          <>
            <div className="appointment-table-wrapper">
              <table className="appointment-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Date</th>
                    <th>Motif</th>
                    <th>Statut</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {appointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td>
                        <strong>
                          {appointment.patient_name || "Patient"}
                        </strong>
                        <small>{appointment.patient_cin || ""}</small>
                      </td>

                      <td>{formatDate(appointment.appointment_date)}</td>
                      <td>{appointment.reason}</td>

                      <td>
                        <span
                          className={`appointment-status ${appointment.status}`}
                        >
                          {appointment.status === "pending"
                            ? "En attente"
                            : appointment.status === "confirmed"
                            ? "Confirmé"
                            : "Annulé"}
                        </span>
                      </td>

                      <td>
                        <select
                          aria-label="Modifier le statut"
                          value={appointment.status}
                          onChange={(event) =>
                            updateStatus(
                              appointment.id,
                              event.target.value
                            )
                          }
                        >
                          <option value="pending">En attente</option>
                          <option value="confirmed">Confirmé</option>
                          <option value="cancelled">Annulé</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="appointment-pagination">
              <p>
                Affichage de {firstItem} à {lastItem} sur{" "}
                {pagination.total} rendez-vous
              </p>

              <div className="appointment-pagination-controls">
                <button
                  type="button"
                  className="appointment-secondary"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((current) => current - 1)}
                >
                  ← Précédent
                </button>

                <span>
                  Page {page} sur {Math.max(totalPages, 1)}
                </span>

                <button
                  type="button"
                  className="appointment-secondary"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Suivant →
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default Appointments;