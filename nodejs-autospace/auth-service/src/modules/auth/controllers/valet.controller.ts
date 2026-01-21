import { Request, Response } from "express";
import { ValetRegisterSchema } from "@autospace/shared";
import { registerValetService } from "../services/valet-register.service";

export const registerValet = async (req: Request, res: Response) => {
  try {
    const parsed = ValetRegisterSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const result = await registerValetService(parsed.data);

    return res.status(201).json({
      success: true,
      message: "Valet registered successfully. Pending approval.",
      data: result,
    });
  } catch (error: any) {
    console.error("Valet register error:", error.message);

    return res.status(400).json({
      success: false,
      message: error.message || "Valet registration failed",
    });
  }
};
