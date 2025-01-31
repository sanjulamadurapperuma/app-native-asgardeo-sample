import { User as NextAuthUser } from "next-auth";

declare module "next-auth" {
  interface User {
    id_token?: string;
    given_name?: string;
    family_name?: string;
    username?: string;
    name?: string;
  }
}