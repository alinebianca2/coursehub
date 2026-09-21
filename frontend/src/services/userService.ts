import { CreateUserInput, UpdateUserInput, User } from "../types/user";
import { apiFetch } from "./api";

export function listUsers(token: string): Promise<User[]> {
  return apiFetch<User[]>("/users", { token });
}

export function getUser(id: number, token: string): Promise<User> {
  return apiFetch<User>(`/users/${id}`, { token });
}

export function createUser(input: CreateUserInput, token: string): Promise<User> {
  return apiFetch<User>("/users", { method: "POST", body: JSON.stringify(input), token });
}

export function updateUser(id: number, input: UpdateUserInput, token: string): Promise<User> {
  return apiFetch<User>(`/users/${id}`, { method: "PUT", body: JSON.stringify(input), token });
}

export function deleteUser(id: number, token: string): Promise<void> {
  return apiFetch<void>(`/users/${id}`, { method: "DELETE", token });
}
