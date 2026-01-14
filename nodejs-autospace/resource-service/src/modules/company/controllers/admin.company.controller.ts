import { Request, Response } from "express";
import { CompanyStatus } from "../entities/company.entity";
import { getCompanyByStatus } from "../services/company.service";

export const getPendingCompanies = async (
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

    const result = await getCompanyByStatus(CompanyStatus.PENDING, page, limit);

    return res.status(200).json({
      success: true,
      message: "Pending companies fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    console.error("Get pending companies failed:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending companies",
    });
  }
};
