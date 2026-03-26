"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGarageImagesController = exports.addGarageImageController = void 0;
const data_source_1 = require("../../../db/data-source");
const garage_image_entity_1 = require("../entities/garage-image.entity");
const garage_entity_1 = require("../entities/garage.entity");
const files_entity_1 = require("../../files/files.entity");
const garage_entity_2 = require("../entities/garage.entity");
const addGarageImageController = async (req, res) => {
    const garageId = req.params.garageId;
    const { fileId } = req.body;
    if (!fileId) {
        return res.status(400).json({ message: "fileId is required" });
    }
    const garageRepo = data_source_1.AppDataSource.getRepository(garage_entity_1.Garage);
    const fileRepo = data_source_1.AppDataSource.getRepository(files_entity_1.FileEntity);
    const imageRepo = data_source_1.AppDataSource.getRepository(garage_image_entity_1.GarageImageEntity);
    const garage = await garageRepo.findOneBy({ id: garageId });
    if (!garage) {
        return res.status(404).json({ message: "Garage not found" });
    }
    if (garage.status !== garage_entity_2.GarageStatus.ACTIVE) {
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
exports.addGarageImageController = addGarageImageController;
const getGarageImagesController = async (req, res) => {
    const garageId = req.params.garageId;
    const imageRepo = data_source_1.AppDataSource.getRepository(garage_image_entity_1.GarageImageEntity);
    const images = await imageRepo.find({
        where: { garageId },
        order: { position: "ASC" },
    });
    return res.json(images);
};
exports.getGarageImagesController = getGarageImagesController;
