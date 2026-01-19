import { Request, Response } from "express";
import {
  createCompany,
  getCompanyByOwnerId,
} from "../services/company.service";
import { AppDataSource } from "../../../db/data-source";
import { Company } from "../entities/company.entity";

const companyRepository = AppDataSource.getRepository(Company);

export const registerCompany = async (req: Request, res: Response) => {
  try {
    const ownerUserId = req.headers["x-user-id"] as string;

    if (!ownerUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const company = await createCompany(ownerUserId, req.body);

    return res.status(201).json({
      success: true,
      message: "Company registered successfully. Awaiting approval.",
      data: company,
    });
  } catch (error: any) {
    if (error.message === "Company already exists") {
      return res.status(409).json({
        success: false,
        message: "Company with this registration number already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Company registration failed",
    });
  }
};

export const getMyCompany = async (req: Request, res: Response) => {
  try {
    const ownerUserId = req.headers["x-user-id"] as string;

    if (!ownerUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    console.log("RESOURCE → ownerUserId:", ownerUserId);

    const company = await getCompanyByOwnerId(ownerUserId);

    return res.status(200).json({
      success: true,
      data: company ?? null,
    });
  } catch (error) {
    console.error("Get my company error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch company",
    });
  }
};
