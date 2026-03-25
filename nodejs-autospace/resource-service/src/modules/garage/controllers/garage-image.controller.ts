import { Request, Response } from "express";
import { AppDataSource } from "../../../db/data-source";
import { GarageImageEntity } from "../entities/garage-image.entity";
import { Garage } from "../entities/garage.entity";
import { FileEntity } from "../../files/files.entity";
import { GarageStatus } from "../entities/garage.entity";

export const addGarageImageController = async (req: Request, res: Response) => {
  const garageId = req.params.garageId as string;
  const { fileId } = req.body;

  if (!fileId) {
    return res.status(400).json({ message: "fileId is required" });
  }

  const garageRepo = AppDataSource.getRepository(Garage);
  const fileRepo = AppDataSource.getRepository(FileEntity);
  const imageRepo = AppDataSource.getRepository(GarageImageEntity);

  const garage = await garageRepo.findOneBy({ id: garageId });
  if (!garage) {
    return res.status(404).json({ message: "Garage not found" });
  }

  if (garage.status !== GarageStatus.ACTIVE) {
    return res.status(400).json({
      message: "Garage must be active before adding images",
    });
  }

  const file = await fileRepo.findOneBy({ id: fileId });
  if (!file) {
    return res.status(404).json({ message: "File not found" });
  }

  const image = imageRepo.create({
    garageId,
    fileId,
  });

  await imageRepo.save(image);

  return res.status(201).json(image);
};

export const getGarageImagesController = async (
  req: Request,
  res: Response,
) => {
  const garageId = req.params.garageId as string;

  const imageRepo = AppDataSource.getRepository(GarageImageEntity);

  const images = await imageRepo.find({
    where: { garageId },
    order: { position: "ASC" },
  });

  return res.json(images);
};
