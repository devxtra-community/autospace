import { Request, Response } from "express";
import { createCompany } from "../services/company.service";

export const registerCompany = async (req: Request, res: Response) => {
  try {
    const ownerUserId = req.headers["x-user-id"] as string;

    if (!ownerUserId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const company = await createCompany(ownerUserId, req.body);

    return res.status(201).json({
      success: true,
      message: "Company registered successfully. Awaiting approval.",
      data: company,
    });
  } catch (error: any) {
    if (error.message.includes("already exists")) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Company registration failed",
    });
  }
};
