import { useEffect, useState } from "react";
import { Users, TrendingUp, Target, AlertTriangle, Clock, BarChart3 } from "lucide-react";
import api from "../api/axios";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/Cotisations/dashboard")
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={styles.loading}>Chargement...</div>;

  const taux = stats && stats.totalAttendu > 0
    ? Math.round((stats.totalEncaisse / stats.totalAttendu) * 100)
    : 0;

  const cards = [
    { label: "Membres actifs", value: stats?.totalMembresActifs, color: "#00ff88", icon: <Users size={24} /> },
    { label: "Total encaissé", value: `${stats?.totalEncaisse?.toLocaleString()} FCFA`, color: "#00b8ff", icon: <TrendingUp size={24} /> },
    { label: "Total attendu", value: `${stats?.totalAttendu?.toLocaleString()} FCFA`, color: "#ffaa00", icon: <Target size={24} /> },
    { label: "En retard", value: stats?.cotisationsEnRetard, color: "#ff4444", icon: <AlertTriangle size={24} /> },
    { label: "En attente", value: stats?.cotisationsEnAttente, color: "#aa88ff", icon: <Clock size={24} /> },
    { label: "Taux recouvrement", value: `${taux}%`, color: "#00ff88", icon: <BarChart3 size={24} /> },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Tableau de bord</h1>
        <span style={styles.year}>Exercice {new Date().getFullYear()}</span>
      </div>

      <div style={styles.grid}>
        {cards.map((card) => (
          <div key={card.label} style={styles.card}>
            <div style={{ ...styles.cardIcon, color: card.color }}>{card.icon}</div>
            <div style={{ ...styles.cardValue, color: card.color }}>{card.value}</div>
            <div style={styles.cardLabel}>{card.label}</div>
            <div style={{ ...styles.cardBar, background: card.color }} />
          </div>
        ))}
      </div>

      <div style={styles.progressSection}>
        <h2 style={styles.sectionTitle}>Taux de recouvrement</h2>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${taux}%` }} />
        </div>
        <div style={styles.progressLabels}>
          <span style={{ color: "#666" }}>0%</span>
          <span style={{ color: "#00ff88", fontWeight: "700" }}>{taux}%</span>
          <span style={{ color: "#666" }}>100%</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "40px" },
  loading: { color: "#666", padding: "40px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" },
  title: { color: "#fff", fontSize: "28px", fontWeight: "700", margin: 0 },
  year: {
    background: "rgba(0,255,136,0.1)", color: "#00ff88",
    padding: "6px 16px", borderRadius: "20px", fontSize: "13px",
    border: "1px solid rgba(0,255,136,0.2)",
  },
  grid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "40px" },
  card: {
    background: "#0d0d18", border: "1px solid #1a1a2e",
    borderRadius: "16px", padding: "28px", position: "relative", overflow: "hidden",
  },
  cardIcon: { marginBottom: "16px" },
  cardValue: { fontSize: "28px", fontWeight: "800", marginBottom: "6px", fontFamily: "monospace" },
  cardLabel: { color: "#666", fontSize: "13px" },
  cardBar: { position: "absolute", bottom: 0, left: 0, right: 0, height: "3px", opacity: 0.6 },
  progressSection: {
    background: "#0d0d18", border: "1px solid #1a1a2e", borderRadius: "16px", padding: "28px",
  },
  sectionTitle: { color: "#fff", fontSize: "16px", fontWeight: "600", marginBottom: "20px" },
  progressBar: { background: "#1a1a2e", borderRadius: "8px", height: "12px", overflow: "hidden" },
  progressFill: {
    height: "100%", background: "linear-gradient(90deg, #00ff88, #00b8ff)",
    borderRadius: "8px", transition: "width 1s ease",
  },
  progressLabels: { display: "flex", justifyContent: "space-between", marginTop: "10px", fontSize: "13px" },
};
