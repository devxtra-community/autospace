import "express";
import { UserRole, UserStatus } from "@autospace/shared";
import { PublicGarageQuery } from "../modules/garage/validators/garage.validator";

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: UserRole;
      status: UserStatus;
    }

    interface Request {
      file?: Multer.File;
    }

    interface Request {
      user: User;
      validateQuery?: PublicGarageQuery;
    }
  }
}

export {};
