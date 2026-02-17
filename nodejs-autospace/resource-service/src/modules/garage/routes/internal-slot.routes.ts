import { Router } from "express";
import { internalAuth } from "../../../middlewares/internalAuth.middleware";
import { AppDataSource } from "../../../db/data-source";
import { GarageSlot } from "../entities/garage-slot.entity";

const router = Router();

router.get("/:slotId", internalAuth, async (req, res) => {
  const repo = AppDataSource.getRepository(GarageSlot);

  const slot = await repo.findOne({
    where: { id: req.params.slotId as string },
  });

  return res.json({
    success: true,
    data: slot,
  });
});

export default router;
