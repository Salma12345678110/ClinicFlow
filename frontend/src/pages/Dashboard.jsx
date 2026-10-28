
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";

function Dashboard({ user, onLogout }) {
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          "http://localhost:5000/api/dashboard/stats",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Impossible de récupérer les statistiques");
        }

        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Erreur dashboard :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    {
      title: "Total patients",
      value: stats.totalPatients,
      icon: "👥",
      color: "blue",
      link: "/patients",
    },
    {
      title: "Rendez-vous aujourd'hui",
      value: stats.todayAppointments,
      icon: "📅",
      color: "purple",
      link: "/appointments",
    },
    {
      title: "En attente",
      value: stats.pendingAppointments,
      icon: "⏳",
      color: "orange",
      link: "/appointments",
    },
    {
      title: "Confirmés",
      value: stats.confirmedAppointments,
      icon: "✅",
      color: "green",
      link: "/appointments",
    },
  ];

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">✚</span>
          <span>ClinicFlow</span>
        </div>

        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-link active">
            <span>📊</span> Tableau de bord
          </Link>

          <Link to="/patients" className="nav-link">
            <span>👥</span> Patients
          </Link>

          <Link to="/appointments" className="nav-link">
            <span>📅</span> Rendez-vous
          </Link>

          <Link to="/users" className="nav-link">
            <span>👤</span> Utilisateurs
          </Link>
        </nav>

        <div className="sidebar-bottom">
          <div className="profile-avatar">
            {(user?.name || user?.nom || "A").charAt(0).toUpperCase()}
          </div>

          <div className="profile-info">
            <strong>{user?.name || user?.nom || "Administrateur"}</strong>
            <span>{user?.role || "ClinicFlow"}</span>
          </div>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="topbar">
          <div>
            <h1>Tableau de bord</h1>
            <p>Bienvenue sur votre espace ClinicFlow.</p>
          </div>

          <div className="topbar-actions">
            <span className="today-date">
              {new Date().toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>

            <button
              type="button"
              className="top-logout"
              onClick={onLogout}
            >
              ↪ Déconnexion
            </button>
          </div>
        </header>

        <section className="dashboard-content">
          <div className="section-heading">
            <div>
              <h2>Vue d'ensemble</h2>
              <p>Voici les principales statistiques de votre clinique.</p>
            </div>
          </div>

          <div className="stats-grid">
            {cards.map((card) => (
              <Link
                to={card.link}
                className="stat-card"
                key={card.title}
              >
                <div className={`stat-icon ${card.color}`}>
                  {card.icon}
                </div>

                <div className="stat-info">
                  <p>{card.title}</p>
                  <h3>{loading ? "..." : card.value ?? 0}</h3>
                </div>

                <span className="stat-arrow">↗</span>
              </Link>
            ))}
          </div>

          <section className="quick-section">
            <h2>Accès rapide</h2>
            <p>Accédez rapidement aux fonctionnalités principales.</p>

            <div className="quick-grid">
              <Link to="/patients" className="quick-card">
                <span>👥</span>
                <div>
                  <strong>Gestion des patients</strong>
                  <p>Consulter et gérer les patients</p>
                </div>
                <span className="quick-arrow">→</span>
              </Link>

              <Link to="/appointments" className="quick-card">
                <span>📅</span>
                <div>
                  <strong>Gestion des rendez-vous</strong>
                  <p>Consulter les rendez-vous</p>
                </div>
                <span className="quick-arrow">→</span>
              </Link>

              <Link to="/users" className="quick-card">
                <span>👤</span>
                <div>
                  <strong>Gestion des utilisateurs</strong>
                  <p>Gérer les comptes utilisateurs</p>
                </div>
                <span className="quick-arrow">→</span>
              </Link>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
