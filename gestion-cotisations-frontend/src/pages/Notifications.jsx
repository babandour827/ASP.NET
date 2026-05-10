import { useEffect, useState } from "react";
import { Bell, RefreshCw, CheckCheck } from "lucide-react";
import api from "../api/axios";

const statutColors = { Envoye: "#00ff88", EnAttente: "#ffaa00", Echoue: "#ff4444", Annule: "#555" };
const statutLabels = { Envoye: "Envoyé", EnAttente: "En attente", Echoue: "Échec", Annule: "Archivé" };
const typeColors = { RappelPaiement: "#ffaa00", ConfirmationPaiement: "#00ff88", RetardPaiement: "#ff4444", Bienvenue: "#00b8ff", Autre: "#888" };
const typeLabels = { RappelPaiement: "Rappel", ConfirmationPaiement: "Confirmation", RetardPaiement: "Retard", Bienvenue: "Bienvenue", Autre: "Autre" };

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");

  const fetchNotifications = () =>
    api.get("/Notifications").then((res) => setNotifications(res.data));

  useEffect(() => {
    fetchNotifications().catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleGenerer = async () => {
    setGenerating(true);
    setMessage("");
    try {
      const res = await api.post("/Notifications/generer");
      setMessage(res.data.message);
      await fetchNotifications();
    } catch {
      setMessage("Erreur lors de la génération");
    } finally {
      setGenerating(false);
    }
  };

  const handleMarquerLu = async (id) => {
    await api.put(`/Notifications/${id}/marquer-lu`);
    await fetchNotifications();
  };

  const nonLues = notifications.filter((n) => n.statut === "EnAttente" || n.statut === "Envoye").length;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <h1 style={styles.title}>Notifications</h1>
          <span style={styles.badge}>{notifications.length} au total</span>
          {nonLues > 0 && <span style={styles.badgeAlert}>{nonLues} non lues</span>}
        </div>
        <button style={styles.btnGenerer} onClick={handleGenerer} disabled={generating}>
          <RefreshCw size={15} style={{ animation: generating ? "spin 1s linear infinite" : "none" }} />
          {generating ? "Génération..." : "Générer rappels"}
        </button>
      </div>

      {message && (
        <div style={styles.successMsg}>{message}</div>
      )}

      {loading ? (
        <div style={{ color: "#666" }}>Chargement...</div>
      ) : notifications.length === 0 ? (
        <div style={styles.empty}>
          <Bell size={48} color="#333" />
          <p style={{ color: "#555", marginTop: "16px" }}>Aucune notification</p>
          <p style={{ color: "#444", fontSize: "13px" }}>Cliquez sur "Générer rappels" pour envoyer des rappels aux membres en retard</p>
        </div>
      ) : (
        <div style={styles.list}>
          {notifications.map((n) => (
            <div key={n.id} style={{ ...styles.card, opacity: n.statut === "Lu" ? 0.6 : 1 }}>
              <div style={styles.cardLeft}>
                <div style={{ ...styles.typeBadge, background: (typeColors[n.type] || "#888") + "22", color: typeColors[n.type] || "#888", borderColor: (typeColors[n.type] || "#888") + "44" }}>
                  {typeLabels[n.type] || n.type}
                </div>
                <div>
                  <div style={styles.sujet}>{n.sujet}</div>
                  <div style={styles.membre}>{n.membre}</div>
                  <div style={styles.messageText}>{n.message}</div>
                </div>
              </div>
              <div style={styles.cardRight}>
                <span style={{ ...styles.statut, color: statutColors[n.statut] || "#888" }}>
                  <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: statutColors[n.statut] || "#888", display: "inline-block", marginRight: "6px" }} />
                  {statutLabels[n.statut] || n.statut}
                </span>
                <span style={styles.date}>
                  {new Date(n.dateCreation).toLocaleDateString("fr-FR")}
                </span>
                {n.statut !== "Annule" && (
                  <button style={styles.btnLu} onClick={() => handleMarquerLu(n.id)} title="Archiver">
                    <CheckCheck size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: "40px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" },
  title: { color: "#fff", fontSize: "28px", fontWeight: "700", margin: 0 },
  badge: { background: "rgba(0,255,136,0.1)", color: "#00ff88", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", border: "1px solid rgba(0,255,136,0.2)" },
  badgeAlert: { background: "rgba(255,170,0,0.1)", color: "#ffaa00", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", border: "1px solid rgba(255,170,0,0.2)" },
  btnGenerer: { background: "linear-gradient(135deg, #00ff88, #00b8ff)", border: "none", borderRadius: "10px", padding: "12px 20px", color: "#000", fontSize: "14px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" },
  successMsg: { background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.3)", color: "#00ff88", padding: "12px 16px", borderRadius: "10px", fontSize: "13px", marginBottom: "24px" },
  empty: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 40px", background: "#0d0d18", borderRadius: "16px", border: "1px solid #1a1a2e", textAlign: "center" },
  list: { display: "flex", flexDirection: "column", gap: "12px" },
  card: { background: "#0d0d18", border: "1px solid #1a1a2e", borderRadius: "12px", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "24px" },
  cardLeft: { display: "flex", gap: "16px", flex: 1 },
  typeBadge: { padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: "700", border: "1px solid", whiteSpace: "nowrap", height: "fit-content" },
  sujet: { color: "#fff", fontWeight: "600", fontSize: "14px", marginBottom: "4px" },
  membre: { color: "#00ff88", fontSize: "12px", marginBottom: "6px" },
  messageText: { color: "#666", fontSize: "12px", lineHeight: "1.5" },
  cardRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", minWidth: "120px" },
  statut: { fontSize: "12px", fontWeight: "600", display: "flex", alignItems: "center" },
  date: { color: "#555", fontSize: "11px" },
  btnLu: { background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: "6px", padding: "5px 8px", color: "#00ff88", cursor: "pointer", display: "flex", alignItems: "center" },
};
