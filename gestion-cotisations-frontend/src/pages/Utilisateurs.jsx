import { useEffect, useState } from "react";
import { Plus, Pencil, Power, X } from "lucide-react";
import api from "../api/axios";

export default function Utilisateurs() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nom: "", prenom: "", email: "", password: "", roleId: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchAll = () =>
    api.get("/Utilisateurs").then((res) => setUtilisateurs(res.data));

  useEffect(() => {
    Promise.all([api.get("/Utilisateurs"), api.get("/Utilisateurs/roles")])
      .then(([u, r]) => { setUtilisateurs(u.data); setRoles(r.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ nom: "", prenom: "", email: "", password: "", roleId: String(roles[0]?.id ?? "") });
    setError("");
    setShowForm(true);
  };

  const openEdit = (u) => {
    setEditing(u);
    // Bug fix: convert roleId to string for HTML select comparison
    setForm({ nom: u.nom, prenom: u.prenom, email: u.email, password: "", roleId: String(u.roleId) });
    setError("");
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/Utilisateurs/${editing.id}`, {
          nom: form.nom, prenom: form.prenom, email: form.email,
          roleId: parseInt(form.roleId), actif: editing.actif,
          password: form.password || null,
        });
      } else {
        await api.post("/Utilisateurs", {
          nom: form.nom, prenom: form.prenom, email: form.email,
          password: form.password, roleId: parseInt(form.roleId),
        });
      }
      setShowForm(false);
      await fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (u) => {
    try {
      await api.put(`/Utilisateurs/${u.id}`, {
        nom: u.nom, prenom: u.prenom, email: u.email,
        roleId: u.roleId, actif: !u.actif, password: null,
      });
      await fetchAll();
    } catch {
      alert("Erreur lors de la mise à jour du statut");
    }
  };

  const roleColor = { Administrateur: "#ff4444", Tresorier: "#00b8ff", Membre: "#00ff88" };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Utilisateurs</h1>
          <span style={styles.badge}>{utilisateurs.length} comptes</span>
        </div>
        <button style={styles.btnAdd} onClick={openCreate}>
          <Plus size={16} /> Nouvel utilisateur
        </button>
      </div>

      {showForm && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editing ? "Modifier l'utilisateur" : "Créer un utilisateur"}
              </h2>
              <button style={styles.btnClose} onClick={() => setShowForm(false)}>
                <X size={18} />
              </button>
            </div>
            {error && <div style={styles.error}>{error}</div>}
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.row}>
                <div style={styles.field}>
                  <label style={styles.label}>Nom</label>
                  <input style={styles.input} value={form.nom}
                    onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Prénom</label>
                  <input style={styles.input} value={form.prenom}
                    onChange={(e) => setForm({ ...form, prenom: e.target.value })} required />
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Email</label>
                <input type="email" style={styles.input} value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  {editing ? "Nouveau mot de passe (laisser vide pour ne pas changer)" : "Mot de passe"}
                </label>
                <input type="password" style={styles.input} value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required={!editing} placeholder={editing ? "Laisser vide pour conserver" : ""} />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Rôle</label>
                <select style={styles.input} value={form.roleId}
                  onChange={(e) => setForm({ ...form, roleId: e.target.value })} required>
                  {roles.map((r) => (
                    <option key={r.id} value={String(r.id)}>{r.libelle}</option>
                  ))}
                </select>
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
            <span>Utilisateur</span>
            <span>Email</span>
            <span>Rôle</span>
            <span>Dernière connexion</span>
            <span>Statut</span>
            <span>Actions</span>
          </div>
          {utilisateurs.map((u) => (
            <div key={u.id} style={styles.tableRow}>
              <div style={styles.userInfo}>
                <div style={styles.avatar}>
                  {(u.nom?.[0] ?? "?")}{(u.prenom?.[0] ?? "")}
                </div>
                <span style={{ color: "#fff", fontSize: "13px" }}>{u.nom} {u.prenom}</span>
              </div>
              <span style={styles.cell}>{u.email}</span>
              <span style={{
                ...styles.roleBadge,
                color: roleColor[u.role] || "#888",
                borderColor: (roleColor[u.role] || "#888") + "44",
                background: (roleColor[u.role] || "#888") + "11",
              }}>
                {u.role}
              </span>
              <span style={styles.cell}>
                {u.derniereConnexion ? new Date(u.derniereConnexion).toLocaleDateString("fr-FR") : "Jamais"}
              </span>
              <span style={{ ...styles.statutBadge }}>
                <span style={{ ...styles.dot, background: u.actif ? "#00ff88" : "#666" }} />
                <span style={{ color: u.actif ? "#00ff88" : "#666" }}>{u.actif ? "Actif" : "Inactif"}</span>
              </span>
              <div style={styles.actions}>
                <button style={styles.btnEdit} title="Modifier" onClick={() => openEdit(u)}>
                  <Pencil size={13} />
                </button>
                <button
                  style={{ ...styles.btnToggle, color: u.actif ? "#ff4444" : "#00ff88",
                    borderColor: u.actif ? "#ff444433" : "#00ff8833" }}
                  title={u.actif ? "Désactiver" : "Activer"}
                  onClick={() => handleToggle(u)}
                >
                  <Power size={13} />
                </button>
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
    borderRadius: "16px", padding: "32px", width: "500px",
  },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" },
  modalTitle: { color: "#fff", fontSize: "20px", fontWeight: "700", margin: 0 },
  btnClose: { background: "transparent", border: "none", color: "#666", cursor: "pointer", padding: "4px" },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
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
    display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1.5fr 1fr 0.7fr",
    padding: "16px 24px", background: "#080810", color: "#555",
    fontSize: "11px", fontWeight: "600", letterSpacing: "1px",
    textTransform: "uppercase", borderBottom: "1px solid #1a1a2e",
  },
  tableRow: {
    display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1.5fr 1fr 0.7fr",
    padding: "16px 24px", borderBottom: "1px solid #111", alignItems: "center",
  },
  userInfo: { display: "flex", alignItems: "center", gap: "10px" },
  avatar: {
    width: "34px", height: "34px", borderRadius: "8px", flexShrink: 0,
    background: "linear-gradient(135deg, #00ff88, #00b8ff)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: "700", color: "#000", fontSize: "11px",
  },
  cell: { color: "#888", fontSize: "13px" },
  roleBadge: {
    padding: "3px 10px", borderRadius: "12px", fontSize: "11px",
    fontWeight: "600", border: "1px solid", width: "fit-content",
  },
  statutBadge: { display: "flex", alignItems: "center", gap: "6px" },
  dot: { width: "7px", height: "7px", borderRadius: "50%", flexShrink: 0 },
  actions: { display: "flex", gap: "8px" },
  btnEdit: {
    background: "rgba(0,184,255,0.1)", border: "1px solid rgba(0,184,255,0.2)",
    borderRadius: "6px", padding: "6px 8px", color: "#00b8ff",
    cursor: "pointer", display: "flex", alignItems: "center",
  },
  btnToggle: {
    background: "transparent", border: "1px solid",
    borderRadius: "6px", padding: "6px 8px", cursor: "pointer", display: "flex", alignItems: "center",
  },
};
