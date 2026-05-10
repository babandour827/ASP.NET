import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import api from "../api/axios";

const modes = [
  { value: "Virement", label: "Virement" },
  { value: "Especes", label: "Espèces" },
  { value: "Cheque", label: "Chèque" },
  { value: "MobileMoney", label: "Mobile Money" },
  { value: "CarteBancaire", label: "Carte bancaire" },
  { value: "Autre", label: "Autre" },
];

export default function Paiements() {
  const [paiements, setPaiements] = useState([]);
  const [cotisations, setCotisations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ cotisationId: "", montant: "", modePaiement: "Virement", reference: "" });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchData = () =>
    Promise.all([api.get("/Paiements"), api.get("/Cotisations")]).then(([p, c]) => {
      setPaiements(p.data);
      setCotisations(c.data.filter((cot) => cot.statut !== "Paye"));
    });

  useEffect(() => {
    fetchData().catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.post("/Paiements", {
        cotisationId: parseInt(form.cotisationId),
        montant: parseFloat(form.montant),
        modePaiement: form.modePaiement,
        reference: form.reference || null,
      });
      setShowForm(false);
      setForm({ cotisationId: "", montant: "", modePaiement: "Virement", reference: "" });
      await fetchData();
    } catch {
      setError("Erreur lors de l'enregistrement du paiement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Paiements</h1>
          <span style={styles.badge}>{paiements.length} paiements</span>
        </div>
        <button style={styles.btnAdd} onClick={() => setShowForm(true)}>
          <Plus size={16} /> Nouveau paiement
        </button>
      </div>

      {showForm && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Enregistrer un paiement</h2>
              <button style={styles.btnClose} onClick={() => setShowForm(false)}>
                <X size={18} />
              </button>
            </div>
            {error && <div style={styles.error}>{error}</div>}
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Cotisation</label>
                <select
                  value={form.cotisationId}
                  onChange={(e) => setForm({ ...form, cotisationId: e.target.value })}
                  style={styles.input}
                  required
                >
                  <option value="">-- Sélectionner une cotisation --</option>
                  {cotisations.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.membre} — Solde : {c.solde?.toLocaleString()} F ({c.statut})
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Montant (FCFA)</label>
                <input
                  type="number"
                  value={form.montant}
                  onChange={(e) => setForm({ ...form, montant: e.target.value })}
                  style={styles.input}
                  placeholder="0"
                  min="1"
                  required
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Mode de paiement</label>
                <select
                  value={form.modePaiement}
                  onChange={(e) => setForm({ ...form, modePaiement: e.target.value })}
                  style={styles.input}
                >
                  {modes.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Référence (optionnel)</label>
                <input
                  type="text"
                  value={form.reference}
                  onChange={(e) => setForm({ ...form, reference: e.target.value })}
                  style={styles.input}
                  placeholder="N° chèque, reçu..."
                />
              </div>

              <div style={styles.modalActions}>
                <button type="button" style={styles.btnCancel} onClick={() => setShowForm(false)}>
                  Annuler
                </button>
                <button type="submit" style={styles.btnSave} disabled={saving}>
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ color: "#666" }}>Chargement...</div>
      ) : (
        <div style={styles.table}>
          <div style={styles.tableHeader}>
            <span>Membre</span>
            <span>Montant</span>
            <span>Mode</span>
            <span>Référence</span>
            <span>Date</span>
          </div>
          {paiements.length === 0 ? (
            <div style={styles.empty}>Aucun paiement enregistré</div>
          ) : (
            paiements.map((p) => (
              <div key={p.id} style={styles.tableRow}>
                <span style={styles.membre}>{p.membre}</span>
                <span style={{ color: "#00ff88", fontFamily: "monospace", fontSize: "13px" }}>
                  {p.montant?.toLocaleString()} F
                </span>
                <span style={styles.modeBadge}>{p.modePaiement}</span>
                <span style={styles.cell}>{p.reference || "—"}</span>
                <span style={styles.cell}>
                  {new Date(p.datePaiement).toLocaleDateString("fr-FR")}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: "40px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" },
  title: { color: "#fff", fontSize: "28px", fontWeight: "700", margin: "0 0 8px 0" },
  badge: {
    background: "rgba(0,255,136,0.1)", color: "#00ff88",
    padding: "4px 12px", borderRadius: "20px", fontSize: "12px",
    border: "1px solid rgba(0,255,136,0.2)",
  },
  btnAdd: {
    background: "linear-gradient(135deg, #00ff88, #00b8ff)",
    border: "none", borderRadius: "10px", padding: "12px 20px",
    color: "#000", fontSize: "14px", fontWeight: "700", cursor: "pointer",
    display: "flex", alignItems: "center", gap: "6px",
  },
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
  },
  modal: {
    background: "#0d0d18", border: "1px solid #1a1a2e",
    borderRadius: "16px", padding: "32px", width: "480px",
  },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" },
  modalTitle: { color: "#fff", fontSize: "20px", fontWeight: "700", margin: 0 },
  btnClose: {
    background: "transparent", border: "none", color: "#666", cursor: "pointer", padding: "4px",
  },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { color: "#888", fontSize: "11px", fontWeight: "600", letterSpacing: "1px", textTransform: "uppercase" },
  input: {
    background: "#080810", border: "1px solid #1a1a2e", borderRadius: "8px",
    padding: "12px 14px", color: "#fff", fontSize: "14px", outline: "none",
  },
  modalActions: { display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" },
  btnCancel: {
    background: "transparent", border: "1px solid #1a1a2e",
    borderRadius: "8px", padding: "10px 20px", color: "#888", cursor: "pointer", fontSize: "14px",
  },
  btnSave: {
    background: "linear-gradient(135deg, #00ff88, #00b8ff)",
    border: "none", borderRadius: "8px", padding: "10px 20px",
    color: "#000", fontWeight: "700", cursor: "pointer", fontSize: "14px",
  },
  error: {
    background: "rgba(255,50,50,0.1)", border: "1px solid rgba(255,50,50,0.3)",
    color: "#ff5555", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "8px",
  },
  table: { background: "#0d0d18", border: "1px solid #1a1a2e", borderRadius: "16px", overflow: "hidden" },
  tableHeader: {
    display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
    padding: "16px 24px", background: "#080810", color: "#555",
    fontSize: "11px", fontWeight: "600", letterSpacing: "1px",
    textTransform: "uppercase", borderBottom: "1px solid #1a1a2e",
  },
  tableRow: {
    display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
    padding: "16px 24px", borderBottom: "1px solid #111", alignItems: "center",
  },
  membre: { color: "#fff", fontSize: "13px", fontWeight: "500" },
  cell: { color: "#888", fontSize: "13px" },
  modeBadge: {
    background: "rgba(0,184,255,0.1)", color: "#00b8ff",
    padding: "3px 10px", borderRadius: "12px", fontSize: "11px",
    border: "1px solid rgba(0,184,255,0.2)", width: "fit-content",
  },
  empty: { padding: "40px", textAlign: "center", color: "#555" },
};
