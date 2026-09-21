import { FormEvent, useState } from "react";
import { useToast } from "../context/ToastContext";
import { ROLES, Role, User } from "../types/user";

export interface UserFormValues {
  name: string;
  email: string;
  password: string;
  role: Role;
}

interface UserFormProps {
  initialUser?: User;
  submitLabel: string;
  onSubmit: (values: UserFormValues) => Promise<void>;
  onCancel: () => void;
}

export function UserForm({ initialUser, submitLabel, onSubmit, onCancel }: UserFormProps) {
  const [name, setName] = useState(initialUser?.name ?? "");
  const [email, setEmail] = useState(initialUser?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(initialUser?.role ?? "CLIENT");
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const isEditing = Boolean(initialUser);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({ name, email, password, role });
      showToast(isEditing ? "Usuário atualizado com sucesso" : "Usuário criado com sucesso", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erro ao salvar usuário");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="user-form" onSubmit={handleSubmit}>
      <label>
        Nome
        <input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
      </label>

      <label>
        E-mail
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>

      <label>
        {isEditing ? "Nova senha (opcional)" : "Senha"}
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required={!isEditing}
          minLength={8}
          placeholder={isEditing ? "Deixe em branco para manter a atual" : undefined}
        />
      </label>

      <label>
        Perfil
        <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Salvando..." : submitLabel}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={submitting}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
