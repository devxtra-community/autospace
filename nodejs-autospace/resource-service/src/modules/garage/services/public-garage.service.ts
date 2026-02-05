import { FindOptionsWhere } from "typeorm";
import { AppDataSource } from "../../../db/data-source";
import { Garage, GarageStatus } from "../entities/garage.entity";

interface GetPublicGaragesFilters {
  latitude?: number;
  longitude?: number;
  radius?: number;
  valetAvailable?: boolean;
  page: number;
  limit: number;
}

export const getPublicGarages = async (filters: GetPublicGaragesFilters) => {
  const { latitude, longitude, valetAvailable, limit, page } = filters;
  const radius = filters.radius ?? 10;
  const skip = (page - 1) * limit;

  if (latitude !== undefined && longitude !== undefined) {
    return await getGaragesWithProximity(
      latitude,
      longitude,
      radius,
      valetAvailable,
      limit,
      skip,
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
  const params: any[] = [lat, lng, GarageStatus.ACTIVE, radius, limit, skip];

  let valetFilter = "";
  if (valetAvailable !== undefined) {
    params.push(valetAvailable);
    valetFilter = `AND valet_available = $${params.length}`;
  }

  const query = `
    SELECT *
    FROM (
      SELECT
        id,
        company_id AS "companyId",
        name,
        location_name AS "locationName",
        latitude,
        longitude,
        capacity,
        valet_available AS "valetAvailable",
        status,
        created_at AS "createdAt",
        (
          6371 * acos(
            cos(radians($1)) * cos(radians(latitude::double precision)) *
            cos(radians(longitude::double precision) - radians($2)) +
            sin(radians($1)) * sin(radians(latitude::double precision))
          )
        ) AS distance
      FROM garages
      WHERE status = $3
      ${valetFilter}
    ) g
    WHERE g.distance <= $4
    ORDER BY g.distance ASC
    LIMIT $5 OFFSET $6
  `;

  const data = await AppDataSource.query(query, params);

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM (
      SELECT
        (
          6371 * acos(
            cos(radians($1)) * cos(radians(latitude::double precision)) *
            cos(radians(longitude::double precision) - radians($2)) +
            sin(radians($1)) * sin(radians(latitude::double precision))
          )
        ) AS distance
      FROM garages
      WHERE status = $3
      ${valetFilter}
    ) sub
    WHERE distance <= $4
  `;

  const countResult = await AppDataSource.query(
    countQuery,
    params.slice(0, valetAvailable !== undefined ? 5 : 4),
  );

  const total = Number(countResult[0].total);

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
