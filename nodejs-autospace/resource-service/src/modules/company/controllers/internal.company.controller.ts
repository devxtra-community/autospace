import { Request, Response } from "express";
import { AppDataSource } from "../../../db/data-source";
import { Company, CompanyStatus } from "../entities/company.entity";

export const validateCompany = async (req: Request, res: Response) => {
  const value = String(req.params.brn).trim().toUpperCase();

  const companyRepo = AppDataSource.getRepository(Company);

  const company = await companyRepo.findOne({
    where: {
      businessRegistrationNumber: value,
      status: CompanyStatus.ACTIVE,
    },
  });

  if (!company) {
    return res.status(404).json({ valid: false });
  }

  return res.json({
    valid: true,
    companyId: company.id,
    status: company.status,
  });
};
