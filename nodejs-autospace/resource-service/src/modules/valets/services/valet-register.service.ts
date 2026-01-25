import { AppDataSource } from "../../../db/data-source";
import { Valet, ValetAvailabilityStatus } from "../entities/valets.entity";
import { ValetEmployementStatus } from "../entities/valets.entity";

export const registerValetService = async ({
  userId,
  companyId,
  garageId,
}: {
  userId: string;
  companyId: string;
  garageId: string;
}) => {
  console.log("INTERNAL VALET REGISTER PAYLOAD:", {
    userId,
    companyId,
    garageId,
  });

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
    employmentStatus: ValetEmployementStatus.PENDING,
    availabilityStatus: ValetAvailabilityStatus.AVAILABLE,
  });

  return await valetRepo.save(valet);
};
