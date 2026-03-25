import { Router } from "express";
import { AppDataSource } from "../../../db/data-source";
import { User } from "../entities/user.entity";

const router = Router();

router.get("/:userId", async (req, res) => {
  try {
    const userRepo = AppDataSource.getRepository(User);

    const user = await userRepo.findOne({
      where: { id: req.params.userId },
      select: ["id", "fullname", "phone", "email"],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
});

export default router;
