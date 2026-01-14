import { AppDataSource } from "../../../db/data-source";
import { Company, CompanyStatus } from "../entities/company.entity";
import { CreateCompanyInput } from "@autospace/shared";

export const createCompany = async (
  ownerUserId: string,
  data: CreateCompanyInput,
) => {
  const companyRepo = AppDataSource.getRepository(Company);
  const existing = await companyRepo.findOne({
    where: { businessRegistrationNumber: data.businessRegistrationNumber },
  });
  if (existing) {
    throw new Error("Company already exists");
  }
  const company = companyRepo.create({
    ownerUserId,
    companyName: data.companyName,
    businessRegistrationNumber: data.businessRegistrationNumber,
    contactEmail: data.contactEmail,
    contactPhone: data.contactPhone,
    businessLocation: data.businessLocation,
    status: CompanyStatus.PENDING,
  });
  return await companyRepo.save(company);
};
