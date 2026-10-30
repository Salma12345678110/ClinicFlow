
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiRequest } from "../services/api";
import "./PatientDetails.css";

function formatDate(date) {
  if (!date) return "—";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) return "—";

  return value.toLocaleDateString("fr-FR");
}

function formatDateTime(date) {
  if (!date) return "—";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) return "—";

  return value.toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function PatientDetails() {
  const { id } = useParams();

  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPatientDetails() {
      setLoading(true);
      setError("");

      try {
        const response = await apiRequest(`/patients/${id}`);
        const data = response?.data ?? response;
        const patientData = data?.patient ?? data;

        setPatient(patientData);

        const appointmentsResponse = await apiRequest(
          `/appointments?patient_id=${encodeURIComponent(id)}`
        );

        const appointmentsData =
          appointmentsResponse?.data ?? appointmentsResponse;

        const list = Array.isArray(appointmentsData?.appointments)
          ? appointmentsData.appointments
          : Array.isArray(appointmentsData)
            ? appointmentsData
            : [];

        setAppointments(list);
      } catch (err) {
        setError(
          err.message || "Impossible de charger les informations du patient."
        );
      } finally {
        setLoading(false);
      }
    }

    loadPatientDetails();
  }, [id]);

  if (loading) {
    return (
      <main className="patient-details-page">
        <p className="patient-details-message">
          Chargement des informations...
        </p>
      </main>
    );
  }

  if (error || !patient) {
    return (
      <main className="patient-details-page">
        <p className="patient-details-error">
          {error || "Patient introuvable."}
        </p>
      </main>
    );
  }

  return (
    <main className="patient-details-page">
      <header className="patient-details-header">
        <div>
          <p className="patient-details-eyebrow">CLINICFLOW</p>
          <h1>Fiche du patient</h1>
          <p>Informations personnelles et historique des rendez-vous.</p>
        </div>
      </header>

      <section className="patient-details-card">
        <h2>Informations personnelles</h2>

        <div className="patient-details-grid">
          <div>
            <span>Nom complet</span>
            <strong>{patient.full_name ?? patient.fullName ?? "—"}</strong>
          </div>

          <div>
            <span>CIN</span>
            <strong>{patient.cin ?? "—"}</strong>
          </div>

          <div>
            <span>Téléphone</span>
            <strong>{patient.phone ?? "—"}</strong>
          </div>

          <div>
            <span>Date de naissance</span>
            <strong>
              {formatDate(patient.birth_date ?? patient.birthDate)}
            </strong>
          </div>

          <div className="patient-details-full">
            <span>Adresse</span>
            <strong>{patient.address || "Non renseignée"}</strong>
          </div>
        </div>
      </section>

      <section className="patient-details-card">
        <h2>Historique des rendez-vous</h2>

        {appointments.length === 0 ? (
          <p className="patient-details-message">
            Aucun rendez-vous trouvé pour ce patient.
          </p>
        ) : (
          <div className="patient-details-table-wrapper">
            <table className="patient-details-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Motif</th>
                  <th>Statut</th>
                </tr>
              </thead>

              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>
                      {formatDateTime(
                        appointment.appointment_date ??
                          appointment.appointmentDate
                      )}
                    </td>

                    <td>{appointment.reason || "—"}</td>

                    <td>
                      <span
                        className={`patient-status patient-status-${appointment.status}`}
                      >
                        {{
                          pending: "En attente",
                          confirmed: "Confirmé",
                          cancelled: "Annulé",
                        }[appointment.status] || appointment.status || "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
