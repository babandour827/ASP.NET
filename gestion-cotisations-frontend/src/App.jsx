import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Membres from "./pages/Membres";
import Cotisations from "./pages/Cotisations";
import Paiements from "./pages/Paiements";
import Utilisateurs from "./pages/Utilisateurs";
import Notifications from "./pages/Notifications";

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role !== "Administrateur") return <Navigate to="/" />;
  return children;
}

function Layout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#080810" }}>
      <Sidebar />
      <main style={{ marginLeft: "260px", flex: 1, minHeight: "100vh" }}>
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
          <Route path="/membres" element={<PrivateRoute><Layout><Membres /></Layout></PrivateRoute>} />
          <Route path="/cotisations" element={<PrivateRoute><Layout><Cotisations /></Layout></PrivateRoute>} />
          <Route path="/paiements" element={<PrivateRoute><Layout><Paiements /></Layout></PrivateRoute>} />
          <Route path="/notifications" element={<PrivateRoute><Layout><Notifications /></Layout></PrivateRoute>} />
          <Route path="/utilisateurs" element={<AdminRoute><Layout><Utilisateurs /></Layout></AdminRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
