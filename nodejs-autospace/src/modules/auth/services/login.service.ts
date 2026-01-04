import bcrypt from "bcrypt";
import pool from "../../../db";
import { LoginApiInput } from "../validators/auth.api.schema";

export const loginUser = async (data: LoginApiInput) => {
  const { email, password } = data;
  const query = `
  SELECT id, email, password_hash, role, status
  FROM users
  WHERE email = $1`;

  const values = [email];
  const { rows } = await pool.query(query, values);

  if (rows.length === 0) {
    throw new Error("Invalid credentials");
  }

  const user = rows[0];

  const isPassword = await bcrypt.compare(password, user.password_hash);
  if (!isPassword) {
    throw new Error("Invalid credentials");
  }

  if (
    (user.role === "owner" ||
      user.role === "manager" ||
      user.role === "valet") &&
    user.status !== "active"
  ) {
    throw new Error("User not approved");
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
  };
};
