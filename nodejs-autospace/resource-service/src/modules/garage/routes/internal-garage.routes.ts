import { Router } from "express";
import { internalAuth } from "../../../middlewares/internalAuth.middleware";
import { AppDataSource } from "../../../db/data-source";
import { Garage } from "../entities/garage.entity";

const router = Router();

router.get("/:garageId", internalAuth, async (req, res) => {
  const repo = AppDataSource.getRepository(Garage);

  const garage = await repo.findOne({
    where: { id: req.params.garageId as string },
  });

  return res.json({
    success: true,
    data: garage,
  });
});

export default router;
