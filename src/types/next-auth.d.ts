import type { DefaultSession } from "next-auth";
import type { Role } from "@/generated/prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
    /** Present when a platform admin is viewing as this user. */
    impersonator?: {
      id: string;
      email: string;
    };
    impersonatingOwnerId?: string;
  }

  interface User {
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    impersonatorId?: string;
    impersonatorEmail?: string;
    impersonatorRole?: Role;
    impersonatingOwnerId?: string;
  }
}
