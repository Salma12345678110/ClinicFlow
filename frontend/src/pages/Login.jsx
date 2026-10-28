
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import "./Login.css";

export default function Login({ onLogin }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!data?.token) {
        throw new Error("Le serveur n'a pas renvoyé de token.");
      }

      localStorage.setItem("token", data.token);

      const currentUser = await apiRequest("/auth/me");
      const user = data.user || currentUser.user || currentUser;

      localStorage.setItem("user", JSON.stringify(user));
      onLogin(user);
      navigate("/dashboard");
    } catch (err) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setError(err.message || "Impossible de se connecter.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="brand">
          <div className="brand-icon">+</div>
          <span>ClinicFlow</span>
        </div>

        <div className="visual-content">
          <span className="eyebrow">GESTION MÉDICALE</span>
          <h1>Une gestion plus simple, des soins plus efficaces.</h1>
          <p>
            Retrouvez vos patients, organisez les rendez-vous et
            suivez votre activité depuis un seul espace.
          </p>

          <div className="visual-card">
            <div className="visual-card-icon">✓</div>
            <div>
              <strong>Votre espace de travail</strong>
              <p>Patients et rendez-vous réunis au même endroit.</p>
            </div>
          </div>
        </div>

        <p className="visual-footer">
          ClinicFlow · Votre gestion médicale au quotidien
        </p>
      </section>

      <section className="login-form-section">
        <form className="login-card" onSubmit={handleSubmit}>
          <div className="mobile-brand">
            <span className="brand-icon">+</span>
            <span>ClinicFlow</span>
          </div>

          <span className="form-eyebrow">BON RETOUR</span>
          <h2>Connectez-vous</h2>
          <p className="form-description">
            Entrez vos identifiants pour accéder à votre espace.
          </p>

          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Adresse e-mail</label>
            <input
              id="email"
              type="email"
              placeholder="nom@clinique.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              placeholder="Entrez votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            className="login-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
            {!loading && <span aria-hidden="true"> →</span>}
          </button>

          <p className="security-note">
            <span aria-hidden="true">🔒</span>
            Accès réservé au personnel autorisé
          </p>
        </form>

        <p className="copyright">
          © {new Date().getFullYear()} ClinicFlow. Tous droits réservés.
        </p>
      </section>
    </main>
  );
}
