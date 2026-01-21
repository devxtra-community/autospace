import { AppDataSource } from "../../../db/data-source";
import { Valet } from "../entities/valets.entity";
import { ValetStatus } from "../entities/valets.entity";

export const registerValetService = async ({
  userId,
  companyId,
  garageId,
}: {
  userId: string;
  companyId: string;
  garageId: string;
}) => {
  const valetRepo = AppDataSource.getRepository(Valet);

  const exists = await valetRepo.findOne({
    where: { id: userId },
  });

  if (exists) {
    throw new Error("Valet profile already exists");
  }

  const valet = valetRepo.create({
    id: userId,
    companyId,
    garageId,
    status: ValetStatus.PENDING,
    availabilityStatus: true,
  });

  return await valetRepo.save(valet);
};
