import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { TrendingUp, CheckCircle2, ArrowRight } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch {
      setError("Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    "Suivi en temps réel",
    "Tableaux de bord dynamiques",
    "Export PDF & Excel",
    "Notifications automatiques",
  ];

  return (
    <div style={styles.container}>
      <div style={styles.left}>
        <div style={styles.leftContent}>
          <div style={styles.logoRow}>
            <TrendingUp size={48} color="#00ff88" />
          </div>
          <h1 style={styles.bigTitle}>COTIS<span style={{ color: "#00ff88" }}>PRO</span></h1>
          <p style={styles.bigSubtitle}>Gestion intelligente des cotisations</p>
          <div style={styles.features}>
            {features.map((f) => (
              <div key={f} style={styles.feature}>
                <CheckCircle2 size={16} color="#00ff88" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.card}>
          <h2 style={styles.title}>Connexion</h2>
          <p style={styles.subtitle}>Accédez à votre espace de gestion</p>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Adresse email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                placeholder="admin@association.sn"
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" style={styles.btn} disabled={loading}>
              {loading ? "Connexion..." : (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  Se connecter <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>

          <div style={styles.hint}>
            <p style={{ color: "#555", fontSize: "12px", margin: "0 0 4px" }}>Compte démo :</p>
            <p style={{ color: "#00ff88", fontSize: "12px", margin: 0 }}>admin@association.sn / Admin123!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", minHeight: "100vh", background: "#050508" },
  left: {
    flex: 1, background: "linear-gradient(135deg, #050508 0%, #0a1628 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "60px", borderRight: "1px solid #1a1a2e",
  },
  leftContent: { maxWidth: "400px" },
  logoRow: { marginBottom: "16px" },
  bigTitle: {
    fontSize: "48px", fontWeight: "900", color: "#fff",
    letterSpacing: "6px", fontFamily: "monospace", margin: "0 0 12px",
  },
  bigSubtitle: { color: "#666", fontSize: "16px", marginBottom: "40px" },
  features: { display: "flex", flexDirection: "column", gap: "16px" },
  feature: { color: "#aaa", fontSize: "15px", display: "flex", alignItems: "center", gap: "10px" },
  right: {
    width: "480px", display: "flex", alignItems: "center",
    justifyContent: "center", padding: "40px", background: "#080810",
  },
  card: { width: "100%", maxWidth: "380px" },
  title: { color: "#fff", fontSize: "28px", fontWeight: "700", marginBottom: "8px" },
  subtitle: { color: "#666", fontSize: "14px", marginBottom: "32px" },
  error: {
    background: "rgba(255,50,50,0.1)", border: "1px solid rgba(255,50,50,0.3)",
    color: "#ff5555", padding: "12px 16px", borderRadius: "10px",
    fontSize: "13px", marginBottom: "20px",
  },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  field: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { color: "#888", fontSize: "12px", fontWeight: "600", letterSpacing: "1px", textTransform: "uppercase" },
  input: {
    background: "#0d0d18", border: "1px solid #1a1a2e", borderRadius: "10px",
    padding: "14px 16px", color: "#fff", fontSize: "14px", outline: "none",
  },
  btn: {
    background: "linear-gradient(135deg, #00ff88, #00b8ff)", border: "none",
    borderRadius: "10px", padding: "16px", color: "#000",
    fontSize: "15px", fontWeight: "700", cursor: "pointer", marginTop: "8px",
  },
  hint: {
    marginTop: "24px", padding: "16px", background: "#0d0d18",
    borderRadius: "10px", border: "1px solid #1a1a2e",
  },
};
