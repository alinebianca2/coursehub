import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const FEATURES_BY_ROLE: Record<string, string[]> = {
  ADMIN: [
    "Cadastrar novos usuários",
    "Listar e consultar todos os usuários",
    "Editar qualquer usuário",
    "Excluir usuários",
  ],
  OPERATOR: ["Listar e consultar todos os usuários", "Editar usuários"],
  CLIENT: ["Consultar os próprios dados"],
};

export function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const features = FEATURES_BY_ROLE[user.role] ?? [];

  return (
    <div className="page">
      <h1>Meu painel</h1>

      <section className="card">
        <h2>Meus dados</h2>
        <dl className="definition-list">
          <dt>Nome</dt>
          <dd>{user.name}</dd>
          <dt>E-mail</dt>
          <dd>{user.email}</dd>
          <dt>Perfil</dt>
          <dd>
            <span className="badge">{user.role}</span>
          </dd>
        </dl>
      </section>

      <section className="card">
        <h2>Funcionalidades disponíveis</h2>
        <ul>
          {features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>

        {(user.role === "ADMIN" || user.role === "OPERATOR") && (
          <Link to="/users" className="btn btn-primary">
            Ver usuários
          </Link>
        )}
      </section>
    </div>
  );
}
