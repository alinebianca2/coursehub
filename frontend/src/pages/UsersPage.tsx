import { useEffect, useState } from "react";
import { UserForm, UserFormValues } from "../components/UserForm";
import { UserTable } from "../components/UserTable";
import { useAuth } from "../context/AuthContext";
import * as userService from "../services/userService";
import { ApiError } from "../services/api";
import { User } from "../types/user";

type FormMode = { type: "create" } | { type: "edit"; user: User } | null;

export function UsersPage() {
  const { user, token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [formMode, setFormMode] = useState<FormMode>(null);

  const canCreate = user?.role === "ADMIN";
  const canEdit = user?.role === "ADMIN" || user?.role === "OPERATOR";
  const canDelete = user?.role === "ADMIN";

  const loadUsers = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await userService.listUsers(token);
      setUsers(data);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível carregar os usuários",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleCreateOrEdit = async (values: UserFormValues) => {
    if (!token) return;

    if (formMode?.type === "edit") {
      const input = {
        name: values.name,
        email: values.email,
        role: values.role,
        ...(values.password ? { password: values.password } : {}),
      };
      await userService.updateUser(formMode.user.id, input, token);
    } else {
      await userService.createUser(values, token);
    }

    setFormMode(null);
    await loadUsers();
  };

  const handleDelete = async (targetUser: User) => {
    if (!token) return;
    const confirmed = window.confirm(`Excluir o usuário "${targetUser.name}"?`);
    if (!confirmed) return;

    try {
      await userService.deleteUser(targetUser.id, token);
      await loadUsers();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível excluir o usuário");
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Usuários</h1>
        {canCreate && !formMode && (
          <button className="btn btn-primary" onClick={() => setFormMode({ type: "create" })}>
            Novo usuário
          </button>
        )}
      </div>

      {formMode && (
        <section className="card">
          <h2>{formMode.type === "create" ? "Novo usuário" : `Editar ${formMode.user.name}`}</h2>
          <UserForm
            initialUser={formMode.type === "edit" ? formMode.user : undefined}
            submitLabel={formMode.type === "create" ? "Criar" : "Salvar"}
            onSubmit={handleCreateOrEdit}
            onCancel={() => setFormMode(null)}
          />
        </section>
      )}

      {loading && <p>Carregando...</p>}
      {error && <p className="form-error">{error}</p>}

      {!loading && !error && (
        <UserTable
          users={users}
          canEdit={canEdit}
          canDelete={canDelete}
          onEdit={(u) => setFormMode({ type: "edit", user: u })}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
