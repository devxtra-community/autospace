import { FindOptionsWhere } from "typeorm";
import { AppDataSource } from "../../../db/data-source";
import { Garage, GarageStatus } from "../entities/garage.entity";
import { getAllGarages } from "./garage2.service";

interface GetPublicGaragesFilters {
  latitude?: number;
  longitude?: number;
  radius: number;
  valetAvailable?: boolean;
  page: number;
  limit: number;
}

export const getPublicGarages = async (filters: GetPublicGaragesFilters) => {
  const { latitude, longitude, radius, valetAvailable, limit, page } = filters;
  const skip = (page - 1) * limit;

  if (latitude !== undefined && longitude !== undefined) {
    return await getGaragesWithProximity(
      latitude,
      longitude,
      radius,
      valetAvailable,
      limit,
      page,
    );
  }

  return await getAllActiveGarages(valetAvailable, limit, skip);
};

async function getGaragesWithProximity(
  lat: number,
  lng: number,
  radius: number,
  valetAvailable: boolean | undefined,
  limit: number,
  skip: number,
) {
  const valetCondition =
    valetAvailable !== undefined
      ? `AND valet_available = ${valetAvailable}`
      : "";

  const query = `
        SELECT
    id,
        company_id as "companyId",
        name,
        location_name as "locationName",
        latitude,
        longitude,
        capacity,
        valet_available as "valetAvailable",
        status,
        created_at as "createdAt",
        (6371 * acos(
            cos(radians($1)) * cos(radians(latitude)) *
            cos(radians(longitude) - radians($2)) +
            sin(radians($1)) * sin(radians(latitude))
        )) AS distance
    FROM garages
    WHERE status = $3
    ${valetCondition}
    HAVING distance <= $4
    ORDER BY distance ASC
    LIMIT $5 OFFSET $6
        `;

  const data = await AppDataSource.query(query, [
    lat,
    lng,
    GarageStatus.ACTIVE,
    radius,
    limit,
    skip,
  ]);

  const countQuery = `
    SELECT COUNT(*) as total
    FROM(
        SELECT
            (6371 * acos(
                cos(radians($1)) * cos(radians(latitude)) *
                cos(radians(longitude) - radians($2)) +
                sin(radians($1)) * sin(radians(latitude))
            )) AS distance
      FROM garages
      WHERE status = $3
      ${valetCondition}
      HAVING distance <= $4
    ) as subquery
    `;

  const countResult = await AppDataSource.query(countQuery, [
    lat,
    lng,
    GarageStatus.ACTIVE,
    radius,
  ]);

  const total = parseInt(countResult[0].total);

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

async function getAllActiveGarages(
  valetAvailable: boolean | undefined,
  limit: number,
  skip: number,
) {
  const repo = AppDataSource.getRepository(Garage);

  const where: FindOptionsWhere<Garage> = {
    status: GarageStatus.ACTIVE,
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
