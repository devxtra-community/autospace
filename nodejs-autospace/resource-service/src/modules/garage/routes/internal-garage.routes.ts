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

export default router;
