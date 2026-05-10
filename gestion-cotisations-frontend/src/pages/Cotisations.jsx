import { useEffect, useState } from "react";
import { Plus, X, Download } from "lucide-react";
import api from "../api/axios";

const statutColors = { Paye: "#00ff88", EnAttente: "#ffaa00", Partiel: "#00b8ff", EnRetard: "#ff4444", Annule: "#666" };
const statutLabels = { Paye: "Payé", EnAttente: "En attente", Partiel: "Partiel", EnRetard: "En retard", Annule: "Annulé" };

const emptyForm = { membreId: "", typeCotisationId: "", montantDu: "", dateDebut: "", dateEcheance: "", exercice: new Date().getFullYear(), notes: "" };

function exportCSV(cotisations) {
  const headers = ["Membre", "Type", "Montant dû", "Montant payé", "Solde", "Échéance", "Statut"];
  const rows = cotisations.map((c) => [
    c.membre, c.typeCotisation, c.montantDu, c.montantPaye, c.solde,
    new Date(c.dateEcheance).toLocaleDateString("fr-FR"), statutLabels[c.statut] || c.statut,
  ]);
  const csv = [headers, ...rows].map((r) => r.join(";")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `cotisations_${new Date().getFullYear()}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

export default function Cotisations() {
  const [cotisations, setCotisations] = useState([]);
  const [membres, setMembres] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchCotisations = () => api.get("/Cotisations").then((res) => setCotisations(res.data));

  useEffect(() => {
    Promise.all([api.get("/Cotisations"), api.get("/Membres"), api.get("/TypeCotisations")])
      .then(([c, m, t]) => { setCotisations(c.data); setMembres(m.data); setTypes(t.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleTypeChange = (e) => {
    const type = types.find((t) => String(t.id) === e.target.value);
    setForm({ ...form, typeCotisationId: e.target.value, montantDu: type ? String(type.montant) : "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.post("/Cotisations", {
        membreId: parseInt(form.membreId),
        typeCotisationId: parseInt(form.typeCotisationId),
        montantDu: parseFloat(form.montantDu),
        dateDebut: form.dateDebut,
        dateEcheance: form.dateEcheance,
        exercice: parseInt(form.exercice),
        notes: form.notes || null,
      });
      setShowForm(false);
      setForm(emptyForm);
      await fetchCotisations();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const filtered = cotisations.filter((c) => filtre ? c.statut === filtre : true);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <h1 style={styles.title}>Cotisations</h1>
          <span style={styles.badge}>{cotisations.length} cotisations</span>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button style={styles.btnExport} onClick={() => exportCSV(filtered)}>
            <Download size={15} /> Export CSV
          </button>
          <button style={styles.btnAdd} onClick={() => { setError(""); setForm(emptyForm); setShowForm(true); }}>
            <Plus size={16} /> Nouvelle cotisation
          </button>
        </div>
      </div>

      <div style={styles.filters}>
        {[
          { value: "", label: "Tous" },
          { value: "Paye", label: "Payé" },
          { value: "EnAttente", label: "En attente" },
          { value: "Partiel", label: "Partiel" },
          { value: "EnRetard", label: "En retard" },
        ].map((f) => (
          <button key={f.value} onClick={() => setFiltre(f.value)} style={{
            ...styles.filterBtn,
            ...(filtre === f.value ? {
              background: f.value ? (statutColors[f.value] + "11") : "rgba(0,255,136,0.1)",
              borderColor: f.value ? (statutColors[f.value] + "55") : "rgba(0,255,136,0.3)",
              color: f.value ? statutColors[f.value] : "#00ff88",
            } : {}),
          }}>
            {f.label}
          </button>
        ))}
      </div>

      {showForm && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Nouvelle cotisation</h2>
              <button style={styles.btnClose} onClick={() => setShowForm(false)}><X size={18} /></button>
            </div>
            {error && <div style={styles.error}>{error}</div>}
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Membre</label>
                <select style={styles.input} value={form.membreId} onChange={(e) => setForm({ ...form, membreId: e.target.value })} required>
                  <option value="">-- Sélectionner un membre --</option>
                  {membres.filter((m) => m.statut === "Actif").map((m) => (
                    <option key={m.id} value={m.id}>{m.nom} {m.prenom}</option>
                  ))}
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Type de cotisation</label>
                <select style={styles.input} value={form.typeCotisationId} onChange={handleTypeChange} required>
                  <option value="">-- Sélectionner un type --</option>
                  {types.map((t) => (
                    <option key={t.id} value={t.id}>{t.libelle} ({t.montant?.toLocaleString()} F)</option>
                  ))}
                </select>
              </div>
              <div style={styles.row}>
                <div style={styles.field}>
                  <label style={styles.label}>Montant dû (FCFA)</label>
                  <input type="number" style={styles.input} value={form.montantDu} onChange={(e) => setForm({ ...form, montantDu: e.target.value })} required />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Exercice</label>
                  <input type="number" style={styles.input} value={form.exercice} onChange={(e) => setForm({ ...form, exercice: e.target.value })} required />
                </div>
              </div>
              <div style={styles.row}>
                <div style={styles.field}>
                  <label style={styles.label}>Date début</label>
                  <input type="date" style={styles.input} value={form.dateDebut} onChange={(e) => setForm({ ...form, dateDebut: e.target.value })} required />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Date échéance</label>
                  <input type="date" style={styles.input} value={form.dateEcheance} onChange={(e) => setForm({ ...form, dateEcheance: e.target.value })} required />
                </div>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Notes</label>
                <input style={styles.input} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optionnel" />
              </div>
              <div style={styles.modalActions}>
                <button type="button" style={styles.btnCancel} onClick={() => setShowForm(false)}>Annuler</button>
                <button type="submit" style={styles.btnSave} disabled={saving}>{saving ? "Enregistrement..." : "Enregistrer"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <div style={{ color: "#666" }}>Chargement...</div> : (
        <div style={styles.table}>
          <div style={styles.tableHeader}>
            <span>Membre</span><span>Type</span><span>Montant dû</span><span>Payé</span><span>Solde</span><span>Échéance</span><span>Statut</span>
          </div>
          {filtered.length === 0 ? <div style={styles.empty}>Aucune cotisation trouvée</div> : (
            filtered.map((c) => (
              <div key={c.id} style={styles.tableRow}>
                <span style={styles.membre}>{c.membre}</span>
                <span style={styles.cell}>{c.typeCotisation}</span>
                <span style={styles.montant}>{c.montantDu?.toLocaleString()} F</span>
                <span style={{ color: "#00ff88", fontSize: "13px" }}>{c.montantPaye?.toLocaleString()} F</span>
                <span style={{ color: c.solde > 0 ? "#ff4444" : "#00ff88", fontSize: "13px" }}>{c.solde?.toLocaleString()} F</span>
                <span style={styles.cell}>{new Date(c.dateEcheance).toLocaleDateString("fr-FR")}</span>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: statutColors[c.statut] || "#666" }} />
                  <span style={{ color: statutColors[c.statut] || "#666", fontSize: "12px", fontWeight: "600" }}>{statutLabels[c.statut] || c.statut}</span>
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
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" },
  title: { color: "#fff", fontSize: "28px", fontWeight: "700", margin: 0 },
  badge: { background: "rgba(0,255,136,0.1)", color: "#00ff88", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", border: "1px solid rgba(0,255,136,0.2)" },
  btnAdd: { background: "linear-gradient(135deg, #00ff88, #00b8ff)", border: "none", borderRadius: "10px", padding: "12px 20px", color: "#000", fontSize: "14px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" },
  btnExport: { background: "transparent", border: "1px solid #1a1a2e", borderRadius: "10px", padding: "12px 16px", color: "#888", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" },
  filters: { display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" },
  filterBtn: { padding: "8px 16px", background: "#0d0d18", border: "1px solid #1a1a2e", borderRadius: "20px", color: "#888", cursor: "pointer", fontSize: "12px", transition: "all 0.2s" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal: { background: "#0d0d18", border: "1px solid #1a1a2e", borderRadius: "16px", padding: "32px", width: "520px", maxHeight: "90vh", overflowY: "auto" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" },
  modalTitle: { color: "#fff", fontSize: "20px", fontWeight: "700", margin: 0 },
  btnClose: { background: "transparent", border: "none", color: "#666", cursor: "pointer", padding: "4px" },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { color: "#888", fontSize: "11px", fontWeight: "600", letterSpacing: "1px", textTransform: "uppercase" },
  input: { background: "#080810", border: "1px solid #1a1a2e", borderRadius: "8px", padding: "12px 14px", color: "#fff", fontSize: "14px", outline: "none" },
  modalActions: { display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" },
  btnCancel: { background: "transparent", border: "1px solid #1a1a2e", borderRadius: "8px", padding: "10px 20px", color: "#888", cursor: "pointer", fontSize: "14px" },
  btnSave: { background: "linear-gradient(135deg, #00ff88, #00b8ff)", border: "none", borderRadius: "8px", padding: "10px 20px", color: "#000", fontWeight: "700", cursor: "pointer", fontSize: "14px" },
  error: { background: "rgba(255,50,50,0.1)", border: "1px solid rgba(255,50,50,0.3)", color: "#ff5555", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "8px" },
  table: { background: "#0d0d18", border: "1px solid #1a1a2e", borderRadius: "16px", overflow: "hidden" },
  tableHeader: { display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 1fr 1.2fr", padding: "16px 24px", background: "#080810", color: "#555", fontSize: "11px", fontWeight: "600", letterSpacing: "1px", textTransform: "uppercase", borderBottom: "1px solid #1a1a2e" },
  tableRow: { display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 1fr 1.2fr", padding: "16px 24px", borderBottom: "1px solid #111", alignItems: "center" },
  membre: { color: "#fff", fontSize: "13px", fontWeight: "500" },
  cell: { color: "#888", fontSize: "13px" },
  montant: { color: "#fff", fontSize: "13px", fontFamily: "monospace" },
  empty: { padding: "40px", textAlign: "center", color: "#555" },
};
