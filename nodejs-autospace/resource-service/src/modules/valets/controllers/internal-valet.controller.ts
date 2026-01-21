import { Request, Response } from "express";
import { resolveGarageService } from "../services/resolve-garage.service";
import { registerValetService } from "../services/valet-register.service";

export const resolveGarage = async (req: Request, res: Response) => {
  try {
    const result = await resolveGarageService(req.body);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(400).json({
      message: error.message || "Failed to resolve garage",
    });
  }
};

export const registerValet = async (req: Request, res: Response) => {
  try {
    const result = await registerValetService(req.body);
    return res.status(201).json(result);
  } catch (error: any) {
    return res.status(400).json({
      message: error.message || "Failed to register valet",
    });
  }
};
