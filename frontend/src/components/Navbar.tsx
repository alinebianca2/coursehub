import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Navbar() {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        CourseHub
      </Link>
      <nav className="navbar-links">
        <Link to="/">Dashboard</Link>
        {(user.role === "ADMIN" || user.role === "OPERATOR") && <Link to="/users">Usuários</Link>}
      </nav>
      <div className="navbar-user">
        <span>
          {user.name} <span className="badge">{user.role}</span>
        </span>
        <button onClick={logout} className="btn btn-ghost">
          Sair
        </button>
      </div>
    </header>
  );
}
