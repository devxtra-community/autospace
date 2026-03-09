import { Request, Response } from "express";
import { getCompanyEmployeesService } from "../services/companyEmployee.service";

export const getCompanyEmployeesController = async (
  req: Request,
  res: Response,
) => {
  try {
    /* ================= FIX companyId TYPE ================= */

    const companyIdParam = req.params.companyId ?? req.user?.companyId;

    const companyId =
      typeof companyIdParam === "string"
        ? companyIdParam
        : Array.isArray(companyIdParam)
          ? companyIdParam[0]
          : undefined;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "companyId required",
      });
    }

    /* ================= FIX QUERY TYPES ================= */

    const page =
      typeof req.query.page === "string" ? parseInt(req.query.page) : 1;

    const limit =
      typeof req.query.limit === "string" ? parseInt(req.query.limit) : 10;

    const role =
      typeof req.query.role === "string" ? req.query.role : undefined;

    const employmentStatus =
      typeof req.query.employmentStatus === "string"
        ? req.query.employmentStatus
        : undefined;

    const search =
      typeof req.query.search === "string" ? req.query.search : undefined;

    // console.log("company",companyId);

    const result = await getCompanyEmployeesService(companyId, {
      page,
      limit,
      role: role as "MANAGER" | "VALET" | undefined,
      employmentStatus,
      search,
    });

    return res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("getCompanyEmployeesController error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch company employees",
    });
  }
};
