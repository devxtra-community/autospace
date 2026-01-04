import bcrypt from "bcrypt";
import pool from "../../../db";
import { RegisterApiInput } from "../validators/auth.api.schema";

export const registerUser = async (data: RegisterApiInput) => {
  const { email, password, role } = data;
  const passwordHash = await bcrypt.hash(password, 10);
  const status = role === "customer" || role === "admin" ? "active" : "pending";
  const query = `                                            
    INSERT INTO users (email , password_hash , role , status)
    VALUES($1 , $2 , $3 , $4)
    RETURNING id , email , role , status , created_at
    `;

  const values = [email, passwordHash, role, status]; // values to replace placeholders in query

  const { rows } = await pool.query(query, values); // query execute and extract returned rows

  return rows[0]; // return the newly created user
};
