import { AppDataSource } from "../../../db/data-source";
import { Company } from "../entities/company.entity";

export const updateCompanyProfile = async (
  companyId: string,
  data: {
    companyName?: string;
    contactEmail?: string;
    contactPhone?: string;
  },
) => {
  const repo = AppDataSource.getRepository(Company);

  const company = await repo.findOne({ where: { id: companyId } });

  if (!company) {
    throw new Error("Company not found");
  }
  if (data.companyName !== undefined) company.companyName = data.companyName;
  if (data.contactEmail !== undefined) company.contactEmail = data.contactEmail;
  if (data.contactPhone !== undefined) company.contactPhone = data.contactPhone;

  await repo.save(company);

  return company;
};
