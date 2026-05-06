export interface IUser {
  id?: string;
  email: string;
  name?: string;
  role: "user" | "admin";
  avatar_url?: string;
  phone?: string;
  address?: Record<string, any>;
  updated_at?: Date | string;
  created_at?: Date | string;
}
