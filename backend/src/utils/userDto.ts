import { User } from "@prisma/client";
import { Role } from "../types/role";

export interface PublicUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as Role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
