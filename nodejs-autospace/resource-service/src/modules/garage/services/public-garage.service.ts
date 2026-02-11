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
  console.log(" SERVICE START");
  console.log("INPUT:", filters);

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
  let valetFilter = "";
  let params: any[];
  let limitIndex: number;
  let offsetIndex: number;

  if (valetAvailable !== undefined) {
    // With valet filter
    params = [
      lat,
      lng,
      GarageStatus.ACTIVE,
      valetAvailable,
      radius,
      limit,
      skip,
    ];
    //        $1   $2   $3                    $4              $5      $6     $7
    valetFilter = 'AND "valetAvailable" = $4';
    limitIndex = 6;
    offsetIndex = 7;
  } else {
    // Without valet filter
    params = [lat, lng, GarageStatus.ACTIVE, radius, limit, skip];
    //        $1   $2   $3                    $4      $5     $6
    limitIndex = 5;
    offsetIndex = 6;
  }

  console.log("Query params:", params);
  console.log(
    " Param types:",
    params.map((p) => typeof p),
  );

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
        // large_slot_price,
        // "valetAvailable",
        status,
        "createdAt",
        (
          6371 * acos(
            cos(radians($1)) * cos(radians(latitude)) *
            cos(radians(longitude::double precision) - radians($2)) +
            sin(radians($1)) * sin(radians(latitude))
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
  const data = await AppDataSource.query(query, params);

  console.log(`Found ${data.length} garages`);
  if (data.length > 0) {
    console.log("First result:", {
      name: data[0].name,
      distance: parseFloat(data[0].distance).toFixed(2) + " km",
      location: `${data[0].latitude}, ${data[0].longitude}`,
    });
  }

  const countParams =
    valetAvailable !== undefined
      ? [lat, lng, GarageStatus.ACTIVE, valetAvailable, radius]
      : [lat, lng, GarageStatus.ACTIVE, radius];

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

  const countResult = await AppDataSource.query(countQuery, countParams);
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
      // "standard_slot_price",
      // "large_slot_price",
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
