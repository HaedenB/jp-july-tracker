import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Import from "./pages/Import";
import Log from "./pages/Log";
import Goals from "./pages/Goals";

export default function App() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          JP Tracker
          <small>immersion goals</small>
        </div>
        <nav className="nav">
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>Dashboard</NavLink>
          <NavLink to="/goals" className={({ isActive }) => (isActive ? "active" : "")}>Goals</NavLink>
          <NavLink to="/log" className={({ isActive }) => (isActive ? "active" : "")}>Log</NavLink>
          <NavLink to="/import" className={({ isActive }) => (isActive ? "active" : "")}>Import ExStatic</NavLink>
        </nav>
      </aside>
      <main className="content">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/log" element={<Log />} />
          <Route path="/import" element={<Import />} />
        </Routes>
      </main>
    </div>
  );
}
