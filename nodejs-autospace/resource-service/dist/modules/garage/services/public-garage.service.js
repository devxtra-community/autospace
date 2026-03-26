"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGarageByIdService = exports.getPublicGarages = void 0;
const data_source_1 = require("../../../db/data-source");
const garage_entity_1 = require("../entities/garage.entity");
const redis_1 = __importDefault(require("../../../config/redis"));
const getPublicGarages = async (filters) => {
    // console.log(" SERVICE START");
    // console.log("INPUT:", filters);
    const { latitude, longitude, valetAvailable, limit, page } = filters;
    const radius = filters.radius ?? 20;
    const skip = (page - 1) * limit;
    // console.log(" Search params:", {
    //   latitude,
    //   longitude,
    //   radius,
    //   valetAvailable,
    //   page,
    //   limit,
    // });
    if (latitude !== undefined && longitude !== undefined) {
        return await getGaragesWithProximity(latitude, longitude, radius, valetAvailable, limit, skip);
    }
    return await getAllActiveGarages(valetAvailable, limit, skip);
};
exports.getPublicGarages = getPublicGarages;
const getGarageByIdService = async (garageId) => {
    const garagesRepo = data_source_1.AppDataSource.getRepository(garage_entity_1.Garage);
    const cacheKey = `garage:${garageId}`;
    const cachedGarage = await redis_1.default.get(cacheKey);
    if (cachedGarage) {
        console.log("Garage fetched from Redis");
        return JSON.parse(cachedGarage);
    }
    const garage = await garagesRepo.findOne({
        where: {
            id: garageId,
            status: garage_entity_1.GarageStatus.ACTIVE,
        },
        select: [
            "id",
            "name",
            "locationName",
            "latitude",
            "longitude",
            "standardSlotPrice",
            "largeSlotPrice",
            "valetAvailable",
            "valetServiceRadius",
            "capacity",
            "contactPhone",
            "createdAt",
        ],
    });
    if (!garage)
        return null;
    await redis_1.default.set(cacheKey, JSON.stringify(garage), {
        EX: 600,
    });
    console.log("Garage fetched from DB and cached");
    return garage;
};
exports.getGarageByIdService = getGarageByIdService;
async function getGaragesWithProximity(lat, lng, radius, valetAvailable, limit, skip) {
    let valetFilter = "";
    let params;
    let limitIndex;
    let offsetIndex;
    if (valetAvailable !== undefined) {
        // With valet filter
        params = [
            lat,
            lng,
            garage_entity_1.GarageStatus.ACTIVE,
            valetAvailable,
            radius,
            limit,
            skip,
        ];
        //        $1   $2   $3                    $4              $5      $6     $7
        valetFilter = 'AND "valetAvailable" = $4';
        limitIndex = 6;
        offsetIndex = 7;
    }
    else {
        // Without valet filter
        params = [lat, lng, garage_entity_1.GarageStatus.ACTIVE, radius, limit, skip];
        //        $1   $2   $3                    $4      $5     $6
        limitIndex = 5;
        offsetIndex = 6;
    }
    console.log("Query params:", params);
    console.log(" Param types:", params.map((p) => typeof p));
    const query = `
    SELECT *
    FROM (
      SELECT
        id,
        "companyId",
        name,
        "locationName",
        latitude,
        longitude,
        capacity,
        standard_slot_price,
        large_slot_price,
        "valetAvailable",
        "valetServiceRadius",
        status,
        "createdAt",
      (
 6371 * acos(
  LEAST(1.0, GREATEST(-1.0,
    cos(radians($1::double precision)) * cos(radians(latitude)) *
    cos(radians(longitude::double precision) - radians($2::double precision)) +
    sin(radians($1::double precision)) * sin(radians(latitude))
  ))
 )
) AS distance
      FROM garages
      WHERE status = $3
      ${valetFilter}
    ) g
    WHERE g.distance <= $${valetAvailable !== undefined ? 5 : 4}
    ORDER BY g.distance ASC
    LIMIT $${limitIndex} OFFSET $${offsetIndex}
  `;
    console.log("Executing query with params:", params);
    const data = await data_source_1.AppDataSource.query(query, params);
    console.log(`Found ${data.length} garages`);
    if (data.length > 0) {
        console.log("First result:", {
            name: data[0].name,
            distance: parseFloat(data[0].distance).toFixed(2) + " km",
            location: `${data[0].latitude}, ${data[0].longitude}`,
        });
    }
    const countParams = valetAvailable !== undefined
        ? [lat, lng, garage_entity_1.GarageStatus.ACTIVE, valetAvailable, radius]
        : [lat, lng, garage_entity_1.GarageStatus.ACTIVE, radius];
    const countQuery = `
    SELECT COUNT(*) AS total
    FROM (
      SELECT
        (
          6371 * acos(
            LEAST(1.0, GREATEST(-1.0,
              cos(radians($1::double precision)) * cos(radians(latitude)) *
              cos(radians(longitude) - radians($2::double precision)) +
              sin(radians($1::double precision)) * sin(radians(latitude))
            ))
          )
        ) AS distance
      FROM garages
      WHERE status = $3
      ${valetFilter}
    ) sub
    WHERE distance <= $${valetAvailable !== undefined ? 5 : 4}
  `;
    const countResult = await data_source_1.AppDataSource.query(countQuery, countParams);
    const total = parseInt(countResult[0].total);
    console.log(`Total garages within ${radius}km: ${total}`);
    return {
        data,
        meta: {
            page: Math.floor(skip / limit) + 1,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}
async function getAllActiveGarages(valetAvailable, limit, skip) {
    const repo = data_source_1.AppDataSource.getRepository(garage_entity_1.Garage);
    const where = {
        status: garage_entity_1.GarageStatus.ACTIVE,
    };
    if (valetAvailable !== undefined) {
        where.valetAvailable = valetAvailable;
    }
    const [data, total] = await repo.findAndCount({
        where,
        skip,
        take: limit,
        order: { createdAt: "DESC" },
        select: [
            "id",
            "companyId",
            "name",
            "locationName",
            "latitude",
            "longitude",
            "capacity",
            "valetAvailable",
            "valetServiceRadius",
            "standardSlotPrice",
            "largeSlotPrice",
            "status",
            "createdAt",
        ],
    });
    return {
        data,
        meta: {
            page: Math.floor(skip / limit) + 1,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}
