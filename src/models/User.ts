export interface IUser {
  _id?: string;
  name: string;
  email: string;
  image?: string;
  role: "user" | "admin";
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// Mock model for compatibility
const User = {};
export default User;
