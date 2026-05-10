import { useEffect, useState } from "react";
import { Search, Plus, Pencil, X } from "lucide-react";
import api from "../api/axios";

const statutOptions = ["Actif", "Inactif", "Suspendu", "Exclu"];
const statutColors = { Actif: "#00ff88", Inactif: "#666", Suspendu: "#ffaa00", Exclu: "#ff4444" };

const emptyForm = { nom: "", prenom: "", email: "", telephone: "", adresse: "", ville: "", statut: "Actif" };

export default function Membres() {
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchMembres = () => api.get("/Membres").then((res) => setMembres(res.data));

  useEffect(() => {
    fetchMembres().catch(console.error).finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  };

  const openEdit = (m) => {
    setEditing(m);
    setForm({ nom: m.nom, prenom: m.prenom, email: m.email, telephone: m.telephone || "", adresse: m.adresse || "", ville: m.ville || "", statut: m.statut });
    setError("");
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/Membres/${editing.id}`, form);
      } else {
        await api.post("/Membres", form);
      }
      setShowForm(false);
      await fetchMembres();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const filtered = membres.filter((m) =>
    `${m.nom} ${m.prenom} ${m.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <h1 style={styles.title}>Membres</h1>
          <span style={styles.badge}>{membres.length} membres</span>
        </div>
        <button style={styles.btnAdd} onClick={openCreate}>
          <Plus size={16} /> Nouveau membre
        </button>
      </div>

      <div style={styles.searchWrapper}>
        <Search size={16} color="#555" style={styles.searchIcon} />
        <input
          type="text"
          placeholder="Rechercher un membre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.search}
        />
      </div>

      {showForm && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{editing ? "Modifier le membre" : "Nouveau membre"}</h2>
              <button style={styles.btnClose} onClick={() => setShowForm(false)}><X size={18} /></button>
            </div>
            {error && <div style={styles.error}>{error}</div>}
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.row}>
                <div style={styles.field}>
                  <label style={styles.label}>Nom</label>
                  <input style={styles.input} value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Prénom</label>
                  <input style={styles.input} value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} required />
                </div>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Email</label>
                <input type="email" style={styles.input} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div style={styles.row}>
                <div style={styles.field}>
                  <label style={styles.label}>Téléphone</label>
                  <input style={styles.input} value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Ville</label>
                  <input style={styles.input} value={form.ville} onChange={(e) => setForm({ ...form, ville: e.target.value })} />
                </div>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Adresse</label>
                <input style={styles.input} value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} />
              </div>
              {editing && (
                <div style={styles.field}>
                  <label style={styles.label}>Statut</label>
                  <select style={styles.input} value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value })}>
                    {statutOptions.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              )}
              <div style={styles.modalActions}>
                <button type="button" style={styles.btnCancel} onClick={() => setShowForm(false)}>Annuler</button>
                <button type="submit" style={styles.btnSave} disabled={saving}>{saving ? "Enregistrement..." : "Enregistrer"}</button>
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
            <span>Membre</span><span>Email</span><span>Téléphone</span><span>Ville</span><span>Adhésion</span><span>Statut</span><span></span>
          </div>
          {filtered.length === 0 ? (
            <div style={styles.empty}>Aucun membre trouvé</div>
          ) : (
            filtered.map((m) => (
              <div key={m.id} style={styles.tableRow}>
                <div style={styles.memberName}>
                  <div style={styles.avatar}>{m.nom[0]}{m.prenom[0]}</div>
                  <span style={{ color: "#fff", fontSize: "13px" }}>{m.nom} {m.prenom}</span>
                </div>
                <span style={styles.cell}>{m.email}</span>
                <span style={styles.cell}>{m.telephone || "—"}</span>
                <span style={styles.cell}>{m.ville || "—"}</span>
                <span style={styles.cell}>{new Date(m.dateAdhesion).toLocaleDateString("fr-FR")}</span>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: statutColors[m.statut] || "#666" }} />
                  <span style={{ color: statutColors[m.statut] || "#666", fontSize: "12px", fontWeight: "600" }}>{m.statut}</span>
                </span>
                <button style={styles.btnEdit} onClick={() => openEdit(m)}><Pencil size={13} /></button>
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
  searchWrapper: { position: "relative", maxWidth: "400px", marginBottom: "24px" },
  searchIcon: { position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" },
  search: { width: "100%", background: "#0d0d18", border: "1px solid #1a1a2e", borderRadius: "10px", padding: "12px 16px 12px 40px", color: "#fff", fontSize: "14px", outline: "none", boxSizing: "border-box" },
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
  tableHeader: { display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 1fr 0.4fr", padding: "16px 24px", background: "#080810", color: "#555", fontSize: "11px", fontWeight: "600", letterSpacing: "1px", textTransform: "uppercase", borderBottom: "1px solid #1a1a2e" },
  tableRow: { display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 1fr 0.4fr", padding: "16px 24px", borderBottom: "1px solid #111", alignItems: "center" },
  memberName: { display: "flex", alignItems: "center", gap: "12px" },
  avatar: { width: "36px", height: "36px", borderRadius: "8px", background: "linear-gradient(135deg, #00ff88, #00b8ff)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", color: "#000", fontSize: "12px", flexShrink: 0 },
  cell: { color: "#888", fontSize: "13px" },
  btnEdit: { background: "rgba(0,184,255,0.1)", border: "1px solid rgba(0,184,255,0.2)", borderRadius: "6px", padding: "6px 8px", color: "#00b8ff", cursor: "pointer", display: "flex", alignItems: "center" },
  empty: { padding: "40px", textAlign: "center", color: "#555" },
};
