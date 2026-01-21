import { Request, Response } from "express";
import { createCompany } from "../services/company.service";
import { getCompanyById } from "../services/company.service";
import { getAllCompanies } from "../services/company.service";

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

export const getCompanyDetails = async (req: Request, res: Response) => {
  try {
    const companyId = req.params.id as string;

    const company = await getCompanyById(companyId);

    return res.status(200).json({
      success: true,
      message: "Company fetched successfully",
      data: company,
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message || "Failed to fetch company",
    });
  }
};

export const getAllCompaniesController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    if (page < 1 || limit < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters",
      });
    }

    const result = await getAllCompanies(page, limit);

    return res.status(200).json({
      success: true,
      message: "Companies fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    console.error("Get all companies failed:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch companies",
    });
  }
};
