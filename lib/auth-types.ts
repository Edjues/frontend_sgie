import type { auth } from "./auth"; // IMPORTANTE: Usa 'import type'

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;