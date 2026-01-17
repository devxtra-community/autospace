import { Request, Response } from "express";
import { registerManager } from "../services/manager-register.service";

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
