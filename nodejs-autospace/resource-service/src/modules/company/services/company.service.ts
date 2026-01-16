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

export const getCompanyByStatus = async (
  status: CompanyStatus,
  page = 1,
  limit = 10,
) => {
  const repo = AppDataSource.getRepository(Company);

  const [data, total] = await repo.findAndCount({
    where: { status },
    skip: (page - 1) * limit,
    take: limit,
    order: { createdAt: "DESC" },
  });

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const updateCompanyStatus = async (
  companyId: string,
  status: CompanyStatus,
  adminUserId: string,
) => {
  const repo = AppDataSource.getRepository(Company);

  const company = await repo.findOne({
    where: { id: companyId },
  });

  if (!company) {
    throw new Error("Company not found");
  }

  if (company.status !== CompanyStatus.PENDING) {
    throw new Error("Company already processed");
  }

  company.status = status;
  await repo.save(company);

  console.log(
    `[AUDIT] Admin ${adminUserId} set company ${companyId} to ${status}`,
  );

  return company;
};
