import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, Users, Wallet, CreditCard, Bell, Settings, LogOut, TrendingUp } from "lucide-react";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = [
    { to: "/", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
    { to: "/membres", icon: <Users size={18} />, label: "Membres" },
    { to: "/cotisations", icon: <Wallet size={18} />, label: "Cotisations" },
    { to: "/paiements", icon: <CreditCard size={18} />, label: "Paiements" },
    { to: "/notifications", icon: <Bell size={18} />, label: "Notifications" },
    ...(user?.role === "Administrateur"
      ? [{ to: "/utilisateurs", icon: <Settings size={18} />, label: "Utilisateurs" }]
      : []),
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logo}>
        <TrendingUp size={24} color="#00ff88" />
        <span style={styles.logoText}>COTIS<span style={styles.logoAccent}>PRO</span></span>
      </div>

      <div style={styles.userCard}>
        <div style={styles.avatar}>{user?.nom?.[0]}{user?.prenom?.[0]}</div>
        <div style={{ overflow: "hidden" }}>
          <div style={styles.userName}>{user?.prenom} {user?.nom}</div>
          <div style={styles.userRole}>{user?.role}</div>
        </div>
      </div>

      <nav style={styles.nav}>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            style={({ isActive }) => ({
              ...styles.navLink,
              ...(isActive ? styles.navLinkActive : {}),
            })}
          >
            <span style={styles.navIcon}>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <button onClick={handleLogout} style={styles.logoutBtn}>
        <LogOut size={15} />
        Déconnexion
      </button>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: "260px", minHeight: "100vh", background: "#0a0a0f",
    borderRight: "1px solid #1a1a2e", display: "flex", flexDirection: "column",
    position: "fixed", left: 0, top: 0, bottom: 0,
  },
  logo: { display: "flex", alignItems: "center", gap: "10px", padding: "28px 24px", borderBottom: "1px solid #1a1a2e" },
  logoText: { fontSize: "20px", fontWeight: "800", color: "#fff", letterSpacing: "3px", fontFamily: "monospace" },
  logoAccent: { color: "#00ff88" },
  userCard: { display: "flex", alignItems: "center", gap: "12px", padding: "20px 24px", borderBottom: "1px solid #1a1a2e", background: "#0d0d18" },
  avatar: { width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg, #00ff88, #00b8ff)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", color: "#000", fontSize: "14px", flexShrink: 0 },
  userName: { color: "#fff", fontWeight: "600", fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  userRole: { color: "#00ff88", fontSize: "11px", marginTop: "2px" },
  nav: { flex: 1, padding: "20px 12px", display: "flex", flexDirection: "column", gap: "4px" },
  navLink: { display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "10px", color: "#888", textDecoration: "none", fontSize: "14px", fontWeight: "500", transition: "all 0.2s" },
  navLinkActive: { background: "rgba(0,255,136,0.1)", color: "#00ff88", borderLeft: "3px solid #00ff88" },
  navIcon: { display: "flex", alignItems: "center" },
  logoutBtn: { margin: "12px", padding: "12px", background: "transparent", border: "1px solid #1a1a2e", borderRadius: "10px", color: "#666", cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" },
};
