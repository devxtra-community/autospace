import { Router } from "express";
import { internalAuth } from "../../../middlewares/internalAuth.middleware";
import { AppDataSource } from "../../../db/data-source";
import { Garage } from "../entities/garage.entity";

const router = Router();
const repo = AppDataSource.getRepository(Garage);

router.get("/:garageId", internalAuth, async (req, res) => {
  const garage = await repo.findOne({
    where: { id: req.params.garageId as string },
  });

  return res.json({
    success: true,
    data: garage,
  });
});

router.get("/count/:companyId", async (req, res) => {
  const count = await repo.count({
    where: { companyId: req.params.companyId },
  });

  res.json({
    success: true,
    data: { count },
  });
});

router.get("/manager/:managerId", internalAuth, async (req, res) => {
  const garage = await repo.findOne({
    where: {
      managerId: req.params.managerId as string,
    },
  });

  if (!garage) {
    return res.status(404).json({
      success: false,
      message: "Garage not found",
    });
  }

  return res.json({
    success: true,
    data: garage,
  });
});

router.get("/users/:userId/status", internalAuth, async (req, res) => {
  try {
    const userId = req.params.userId as string;
    let garage = await repo.findOne({ where: { managerId: userId } });

    if (!garage) {
      const valetRepo = AppDataSource.getRepository(
        require("../../valets/entities/valets.entity").Valet,
      );
      const valet = await valetRepo.findOne({ where: { id: userId } });
      if (valet) {
        garage = await repo.findOne({ where: { id: valet.garageId } });
      }
    }

    if (!garage) {
      return res
        .status(404)
        .json({ success: false, message: "Garage not found for this user" });
    }

    return res.json({
      success: true,
      data: { status: garage.status },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server error checking garage status" });
  }
});

export default router;
