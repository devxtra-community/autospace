import { Router } from "express";
import { internalAuth } from "../../../middlewares/internalAuth.middleware";
import { AppDataSource } from "../../../db/data-source";
import { GarageSlot } from "../entities/garage-slot.entity";

const router = Router();

router.get("/:slotId", internalAuth, async (req, res) => {
  const repo = AppDataSource.getRepository(GarageSlot);

  const slot = await repo.findOne({
    where: { id: req.params.slotId as string },
    relations: ["floor"],
  });

  if (!slot) {
    return res.status(404).json({
      success: false,
      message: "Slot not found",
    });
  }

  return res.json({
    success: true,
    data: {
      id: slot.id,
      slotNumber: slot.slotNumber,
      floorNumber: slot.floor.floorNumber,
      slotSize: slot.slotSize,
    },
  });
});

export default router;
