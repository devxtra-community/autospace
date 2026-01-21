import { AppDataSource } from "../../../db/data-source";
import { Company } from "../../company/entities/company.entity";
import { Garage } from "../../garage/entities/garage.entity";

export const resolveGarageService = async ({
  companyBrn,
  garageCode,
}: {
  companyBrn: string;
  garageCode: string;
}) => {
  const companyRepo = AppDataSource.getRepository(Company);
  const garageRepo = AppDataSource.getRepository(Garage);

  const company = await companyRepo.findOne({
    where: { businessRegistrationNumber: companyBrn },
  });

  if (!company) {
    throw new Error("Invalid company BRN");
  }

  const garage = await garageRepo.findOne({
    where: {
      garageRegistrationNumber: garageCode,
      companyId: company.id,
    },
  });

  if (!garage) {
    throw new Error("Invalid garage code for this company");
  }

  return {
    companyId: company.id,
    garageId: garage.id,
  };
};
