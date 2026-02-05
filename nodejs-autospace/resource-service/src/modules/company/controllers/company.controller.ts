import { Request, Response } from "express";
import { getCompanyByOwnerId } from "../services/company.service";
import { createCompany } from "../services/company.service";
import { getCompanyById } from "../services/company.service";
import { getAllCompanies } from "../services/company.service";
import { updateCompanyProfile } from "../services/company2.service";

export const registerCompany = async (req: Request, res: Response) => {
  console.log("Incoming body:", req.body);
  try {
    const ownerUserId = req.user.id;
    console.log("owner", ownerUserId);

    if (!ownerUserId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const company = await createCompany(ownerUserId, req.body);

    console.log("company", company);

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

export const getMyCompany = async (req: Request, res: Response) => {
  try {
    const ownerUserId = req.user.id;

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

export const updateCompanyProfileController = async (
  req: Request,
  res: Response,
) => {
  try {
    const companyId = req.params.id as string;
    const { companyName, contactEmail, contactPhone } = req.body;

    if (!companyName && !contactEmail && !contactPhone) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required to update",
      });
    }

    const company = await updateCompanyProfile(companyId, {
      companyName,
      contactEmail,
      contactPhone,
    });

    return res.status(200).json({
      success: true,
      message: "Company profile updated successfully",
      data: company,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update company",
    });
  }
};
