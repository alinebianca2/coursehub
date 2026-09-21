import { User } from "../types/user";

interface UserTableProps {
  users: User[];
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export function UserTable({ users, canEdit, canDelete, onEdit, onDelete }: UserTableProps) {
  if (users.length === 0) {
    return <p>Nenhum usuário cadastrado.</p>;
  }

  return (
    <table className="user-table">
      <thead>
        <tr>
          <th>Nome</th>
          <th>E-mail</th>
          <th>Perfil</th>
          {(canEdit || canDelete) && <th>Ações</th>}
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>
              <span className="badge">{user.role}</span>
            </td>
            {(canEdit || canDelete) && (
              <td className="user-table-actions">
                {canEdit && (
                  <button className="btn btn-small" onClick={() => onEdit(user)}>
                    Editar
                  </button>
                )}
                {canDelete && (
                  <button className="btn btn-small btn-danger" onClick={() => onDelete(user)}>
                    Excluir
                  </button>
                )}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
