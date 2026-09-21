export const ROLES = ["ADMIN", "OPERATOR", "CLIENT"] as const;

export type Role = (typeof ROLES)[number];
