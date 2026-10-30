
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import "./Patients.css";

const PAGE_SIZE = 8;

const EMPTY_FORM = {
  fullName: "",
  cin: "",
  phone: "",
  birthDate: "",
  address: "",
};

function getUserRole() {
  const storedRole = localStorage.getItem("role");

  if (storedRole?.trim()) {
    return storedRole.trim().toLowerCase();
  }

  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return String(user?.role ?? "").trim().toLowerCase();
  } catch {
    return "";
  }
}

function formatDate(date) {
  if (!date) return "—";

  const parts = String(date).slice(0, 10).split("-");

  return parts.length === 3
    ? `${parts[2]}/${parts[1]}/${parts[0]}`
    : "—";
}

export default function Patients({ onLogout }) {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const isAdmin = getUserRole() === "admin";

  const loadPatients = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        search: search.trim(),
        page: String(page),
        limit: String(PAGE_SIZE),
      });

      const response = await apiRequest(
        `/patients?${params.toString()}`
      );

      const data = response?.data ?? response;

      const list = Array.isArray(data?.patients)
        ? data.patients
        : Array.isArray(data)
          ? data
          : [];

      setPatients(list);

      setPagination(
        data?.pagination ?? {
          total: list.length,
          totalPages: 1,
        }
      );
    } catch (err) {
      setError(err.message || "Impossible de charger les patients.");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  function openAddModal() {
    setEditingPatient(null);
    setForm({ ...EMPTY_FORM });
    setError("");
    setSuccess("");
    setModalOpen(true);
  }

  function openEditModal(patient) {
    setEditingPatient(patient);

    setForm({
      fullName: patient.full_name ?? patient.fullName ?? "",
      cin: patient.cin ?? "",
      phone: String(patient.phone ?? ""),
      birthDate: String(
        patient.birth_date ?? patient.birthDate ?? ""
      ).slice(0, 10),
      address: patient.address ?? "",
    });

    setError("");
    setSuccess("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setEditingPatient(null);
    setForm({ ...EMPTY_FORM });
  }

  function handleChange(event) {
    const { name, value } = event.target;

    const newValue =
      name === "phone" ? value.replace(/\D/g, "") : value;

    setForm((previous) => ({
      ...previous,
      [name]: newValue,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (
      !form.fullName.trim() ||
      !form.cin.trim() ||
      !form.phone.trim() ||
      !form.birthDate
    ) {
      setError(
        "Le nom complet, la CIN, le téléphone et la date de naissance sont obligatoires."
      );
      return;
    }

    if (!/^[0-9]+$/.test(form.phone)) {
      setError("Le téléphone doit contenir uniquement des chiffres.");
      return;
    }

    const payload = {
      full_name: form.fullName.trim(),
      cin: form.cin.trim(),
      phone: form.phone.trim(),
      birth_date: form.birthDate,
      address: form.address.trim() || null,
    };

    setSaving(true);

    try {
      if (editingPatient) {
        await apiRequest(`/patients/${editingPatient.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        setSuccess("Patient modifié avec succès.");
      } else {
        await apiRequest("/patients", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        setSuccess("Patient ajouté avec succès.");
      }

      setModalOpen(false);
      setEditingPatient(null);
      setForm({ ...EMPTY_FORM });

      if (!editingPatient && page !== 1) {
        setPage(1);
      } else {
        await loadPatients();
      }
    } catch (err) {
      setError(err.message || "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(patient) {
    if (!isAdmin) {
      setError("Seul un administrateur peut supprimer un patient.");
      return;
    }

    if (deletingId !== null) return;

    const name = patient.full_name ?? patient.fullName ?? "ce patient";

    if (!window.confirm(`Voulez-vous vraiment supprimer ${name} ?`)) {
      return;
    }

    setError("");
    setSuccess("");
    setDeletingId(patient.id);

    try {
      await apiRequest(`/patients/${patient.id}`, {
        method: "DELETE",
      });

      setSuccess("Patient supprimé avec succès.");

      if (patients.length === 1 && page > 1) {
        setPage((previous) => previous - 1);
      } else {
        await loadPatients();
      }
    } catch (err) {
      setError(err.message || "Impossible de supprimer ce patient.");
    } finally {
      setDeletingId(null);
    }
  }

  const totalPages = Math.max(
    1,
    Number(pagination.totalPages) || 1
  );

  return (
    <main className="patients-page">
      <header className="patients-header">
        <div>
          <p className="patients-eyebrow">CLINICFLOW</p>
          <h1>Gestion des patients</h1>
          <p className="patients-subtitle">
            Consultez et gérez les dossiers des patients.
          </p>
        </div>

        <div className="patients-header-actions">
          <button
            type="button"
            className="patients-logout-button"
            onClick={onLogout}
          >
            Déconnexion
          </button>
        </div>
      </header>

      {error && (
        <div className="patients-alert patients-alert-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")}>
            ×
          </button>
        </div>
      )}

      {success && (
        <div
          className="patients-alert patients-alert-success"
          role="status"
        >
          <span>{success}</span>
          <button type="button" onClick={() => setSuccess("")}>
            ×
          </button>
        </div>
      )}

      <section className="patients-card">
        <div className="patients-toolbar">
          <div>
            <h2>Liste des patients</h2>
            <p className="patients-count">
              {pagination.total ?? patients.length} patient(s)
            </p>
          </div>

          <div className="patients-toolbar-actions">
            <div className="patients-search-wrapper">
              <svg
                className="patients-search-icon"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>

              <input
                type="search"
                className="patients-search"
                placeholder="Rechercher par nom ou CIN..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                aria-label="Rechercher par nom ou CIN"
              />
            </div>

            <button
              type="button"
              className="patients-add-button"
              onClick={openAddModal}
            >
              + Ajouter un patient
            </button>
          </div>
        </div>

        <div className="patients-table-wrapper">
          <table className="patients-table">
            <thead>
              <tr>
                <th>Nom complet</th>
                <th>CIN</th>
                <th>Téléphone</th>
                <th>Date de naissance</th>
                <th>Adresse</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="patients-empty">
                    Chargement des patients...
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="patients-empty">
                    Aucun patient trouvé.
                  </td>
                </tr>
              ) : (
                patients.map((patient) => (
                  <tr key={patient.id}>
                    <td className="patients-name">
                      {patient.full_name ?? patient.fullName ?? "—"}
                    </td>
                    <td>{patient.cin || "—"}</td>
                    <td>{patient.phone || "—"}</td>
                    <td>
                      {formatDate(
                        patient.birth_date ?? patient.birthDate
                      )}
                    </td>
                    <td>{patient.address || "—"}</td>
                    <td>
                      <div className="patients-row-actions">
                        <button
                          type="button"
                          className="patients-view-button"
                          onClick={() =>
                            navigate(`/patients/${patient.id}`)
                          }
                        >
                          Voir
                        </button>

                        <button
                          type="button"
                          className="patients-edit-button"
                          onClick={() => openEditModal(patient)}
                        >
                          Modifier
                        </button>

                        {isAdmin && (
                          <button
                            type="button"
                            className="patients-delete-button"
                            onClick={() => handleDelete(patient)}
                            disabled={deletingId !== null}
                          >
                            {deletingId === patient.id
                              ? "Suppression..."
                              : "Supprimer"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="patients-pagination">
          <span>
            Page {page} sur {totalPages}
          </span>

          <div className="patients-pagination-actions">
            <button
              type="button"
              className="patients-page-button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((previous) => previous - 1)}
            >
              Précédent
            </button>

            <button
              type="button"
              className="patients-page-button"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((previous) => previous + 1)}
            >
              Suivant
            </button>
          </div>
        </div>
      </section>

      {modalOpen && (
        <div
          className="patients-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            className="patients-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="patients-modal-title"
          >
            <div className="patients-modal-header">
              <div>
                <h2 id="patients-modal-title">
                  {editingPatient
                    ? "Modifier le patient"
                    : "Ajouter un patient"}
                </h2>
                <p>Les champs marqués d'un * sont obligatoires.</p>
              </div>

              <button
                type="button"
                className="patients-modal-close"
                onClick={closeModal}
                disabled={saving}
                aria-label="Fermer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="patients-form-grid">
                <label className="patients-form-field">
                  <span className="patients-label-text">
                    Nom complet <span className="required-star">*</span>
                  </span>
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                    maxLength={150}
                  />
                </label>

                <label className="patients-form-field">
                  <span className="patients-label-text">
                    CIN <span className="required-star">*</span>
                  </span>
                  <input
                    type="text"
                    name="cin"
                    value={form.cin}
                    onChange={handleChange}
                    required
                    maxLength={50}
                  />
                </label>

                <label className="patients-form-field">
                  <span className="patients-label-text">
                    Téléphone <span className="required-star">*</span>
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    maxLength={15}
                    inputMode="numeric"
                    pattern="[0-9]+"
                  />
                </label>

                <label className="patients-form-field">
                  <span className="patients-label-text">
                    Date de naissance{" "}
                    <span className="required-star">*</span>
                  </span>
                  <input
                    type="date"
                    name="birthDate"
                    value={form.birthDate}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label className="patients-form-field patients-form-full">
                  <span className="patients-label-text">Adresse</span>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    rows={3}
                    maxLength={500}
                  />
                </label>
              </div>

              {error && (
                <p className="patients-form-error" role="alert">
                  {error}
                </p>
              )}

              <div className="patients-modal-actions">
                <button
                  type="button"
                  className="patients-cancel-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="patients-save-button"
                  disabled={saving}
                >
                  {saving
                    ? "Enregistrement..."
                    : editingPatient
                      ? "Enregistrer les modifications"
                      : "Ajouter le patient"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
