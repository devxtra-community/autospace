import { Request, Response } from "express";
import { registerManager } from "../services/manager-register.service";
import { AppDataSource } from "../../../db/data-source";
import { User } from "../entities/user.entity";
import { UserRole, UserStatus } from "../constants";
import { ManagerState } from "../constants/manager-state.enum";

export const managerSignup = async (req: Request, res: Response) => {
  try {
    const manager = await registerManager(req.body);

    return res.status(201).json({
      success: true,
      message: "Manager registered successfully",
      data: manager,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getManagerInternal = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const userRepo = AppDataSource.getRepository(User);
  const manager = await userRepo.findOne({ where: { id } });

  if (!manager) {
    return res.status(404).json({ message: "Manager not found" });
  }

  return res.json({
    id: manager.id,
    role: manager.role,
    companyId: manager.companyId,
    managerState: manager.managerState,
  });
};

export const assignManagerInternal = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const userRepo = AppDataSource.getRepository(User);
  const manager = await userRepo.findOne({ where: { id } });

  if (!manager) {
    return res.status(404).json({ message: "Manager not found" });
  }

  if (manager.role !== UserRole.MANAGER) {
    return res.status(400).json({ message: "User is not a manager" });
  }

  manager.managerState = ManagerState.ASSIGNED;
  await userRepo.save(manager);

  return res.json({ success: true });
};

export const getAssignableManagers = async (req: Request, res: Response) => {
  try {
    const companyId = req.params.id as string;

    const userRepo = AppDataSource.getRepository(User);

    const managers = await userRepo.find({
      where: {
        companyId,
        role: UserRole.MANAGER,
        status: UserStatus.ACTIVE,
        managerState: ManagerState.UNASSIGNED,
      },
      select: ["id", "fullname", "email"],
    });

    return res.status(200).json({
      success: true,
      data: managers,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch managers",
    });
  }
};
