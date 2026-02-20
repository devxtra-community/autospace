import axios from "axios";
import { AppDataSource } from "../../../db/data-source";
import { Company, CompanyStatus } from "../entities/company.entity";
import { CreateCompanyInput } from "@autospace/shared";
import { Garage } from "../../garage/entities/garage.entity";

export const createCompany = async (
  ownerUserId: string,
  data: CreateCompanyInput,
) => {
  const companyRepo = AppDataSource.getRepository(Company);

  const result = await AppDataSource.query(
    `SELECT nextval('company_code_seq') AS seq`,
  );

  const seqNumber = result[0].seq;
  const businessRegistrationNumber = `CPY-${String(seqNumber).padStart(4, "0")}`;

  const company = companyRepo.create({
    ownerUserId,
    companyName: data.companyName,
    businessRegistrationNumber,
    contactEmail: data.contactEmail,
    contactPhone: data.contactPhone,
    businessLocation: data.businessLocation,
    status: CompanyStatus.PENDING,
  });

  try {
    const saved = await companyRepo.save(company);

    return {
      id: saved.id,
      companyName: saved.companyName,
      businessRegistrationNumber: saved.businessRegistrationNumber,
      status: saved.status,
      createdAt: saved.createdAt,
    };
  } catch (err: any) {
    if (err.code === "23505") {
      throw new Error("Company already exists");
    }
    throw err;
  }
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

export const getCompanyByOwnerId = async (ownerUserId: string) => {
  const repo = AppDataSource.getRepository(Company);

  const company = await repo.findOne({
    where: {
      ownerUserId: ownerUserId,
    },
  });

  return company;
};
export const getCompanyById = async (id: string) => {
  const repo = AppDataSource.getRepository(Company);

  const company = await repo.findOne({
    where: { id },
  });

  if (!company) {
    throw new Error("Company not found");
  }

  return company;
};

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;

export const getAllCompanies = async (
  page = 1,
  limit = 10,
  search?: string,
) => {
  const companyRepo = AppDataSource.getRepository(Company);
  const garageRepo = AppDataSource.getRepository(Garage);

  const [companies, total] = await companyRepo.findAndCount({
    where: search ? { companyName: search } : {},
    order: { createdAt: "DESC" },
    skip: (page - 1) * limit,
    take: limit,
  });

  const enriched = await Promise.all(
    companies.map(async (company) => {
      let ownerName = "Unknown";

      try {
        const res = await axios.get(
          `${AUTH_SERVICE_URL}/internal/users/${company.ownerUserId}`,
          {
            headers: {
              "x-user-id": "resource-service",
              "x-user-role": "SERVICE",
            },
          },
        );

        ownerName = res.data?.data?.fullname || "Unknown";
      } catch (err) {
        console.error("Owner fetch failed:", err);
      }

      const garagesCount = await garageRepo.count({
        where: { companyId: company.id },
      });

      return {
        companyId: company.id,
        companyCode: company.businessRegistrationNumber,
        companyName: company.companyName,

        ownerName,

        contactEmail: company.contactEmail,
        contactPhone: company.contactPhone,
        businessLocation: company.businessLocation,

        garagesCount,

        status:
          company.status === "active"
            ? "ACTIVE"
            : company.status === "pending"
              ? "PENDING"
              : "REJECTED",
        createdAt: company.createdAt,
      };
    }),
  );

  return {
    data: enriched,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};
