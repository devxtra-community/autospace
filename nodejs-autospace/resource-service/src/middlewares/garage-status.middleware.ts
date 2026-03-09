import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../db/data-source";
import { Garage, GarageStatus } from "../modules/garage/entities/garage.entity";
import { Valet } from "../modules/valets/entities/valets.entity";
import { UserRole } from "../types/auth.type";

export const requireActiveGarage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user;
    if (!user) return next();

    // Only apply to managers and valets
    if (user.role !== UserRole.MANAGER && user.role !== UserRole.VALET) {
      return next();
    }

    const garageRepo = AppDataSource.getRepository(Garage);
    let garage: Garage | null = null;

    if (user.role === UserRole.MANAGER) {
      garage = await garageRepo.findOne({ where: { managerId: user.id } });
    } else if (user.role === UserRole.VALET) {
      const valetRepo = AppDataSource.getRepository(Valet);
      const valet = await valetRepo.findOne({ where: { id: user.id } });
      if (valet) {
        garage = await garageRepo.findOne({ where: { id: valet.garageId } });
      }
    }

    if (garage && garage.status === GarageStatus.BLOCKED) {
      return res.status(403).json({
        success: false,
        message: "Garage blocked by authority",
      });
    }

    next();
  } catch (error) {
    console.error("Garage status check failed:", error);
    // Continue processing on error so we don't accidentally block legitimate requests if there's a DB blip
    next();
  }
};
