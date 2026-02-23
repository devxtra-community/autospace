import { AppDataSource } from "../data-source.js";
import { Booking } from "../entities/booking.entity.js";
import axios from "axios";

const RESOURCE_SERVICE_URL = process.env.RESOURCE_SERVICE_URL!;
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL!;

interface Filters {
  page?: number;
  limit?: number;
  garageId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export const getCompanyBookingsService = async (
  companyId: string,
  filters: Filters,
) => {
  const bookingRepo = AppDataSource.getRepository(Booking);

  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 10;
  const skip = (page - 1) * limit;

  const garageRes = await axios.get(
    `${RESOURCE_SERVICE_URL}/garages/byCompany/${companyId}`,
    {
      headers: {
        "x-user-id": "booking-service",
        "x-user-role": "SERVICE",
      },
      params: {
        page: 1,
        limit: 1000,
      },
    },
  );

  const garages = garageRes.data?.data || [];

  interface GarageDTO {
    id: string;
    name: string;
  }

  const garageMap = new Map<string, string>();
  const garageIds: string[] = [];

  garages.forEach((g: GarageDTO) => {
    garageMap.set(g.id, g.name);
    garageIds.push(g.id);
  });

  if (garageIds.length === 0) {
    return {
      data: [],
      meta: {
        page,
        limit,
        total: 0,
        totalPages: 0,
      },
    };
  }

  const query = bookingRepo
    .createQueryBuilder("booking")
    .where("booking.garageId IN (:...garageIds)", { garageIds });

  if (filters.garageId) {
    query.andWhere("booking.garageId = :garageId", {
      garageId: filters.garageId,
    });
  }

  if (filters.status) {
    query.andWhere("booking.status = :status", {
      status: filters.status,
    });
  }

  if (filters.startDate && !filters.endDate) {
    const start = new Date(filters.startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(filters.startDate);
    end.setHours(23, 59, 59, 999);

    query.andWhere("booking.startTime BETWEEN :start AND :end", {
      start,
      end,
    });
  }

  if (filters.startDate && filters.endDate) {
    const start = new Date(filters.startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(filters.endDate);
    end.setHours(23, 59, 59, 999);

    query.andWhere("booking.startTime BETWEEN :start AND :end", {
      start,
      end,
    });
  }

  query.orderBy("booking.createdAt", "DESC");

  const [bookings, total] = await query
    .skip(skip)
    .take(limit)
    .getManyAndCount();

  if (bookings.length === 0) {
    return {
      data: [],
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  const users = await Promise.all(
    bookings.map(async (b) => {
      try {
        const res = await axios.get(
          `${AUTH_SERVICE_URL}/internal/users/${b.userId}`,
          {
            headers: {
              "x-user-id": "booking-service",
              "x-user-role": "SERVICE",
            },
          },
        );

        return {
          id: b.userId,
          name: res.data?.data?.fullname || "",
          email: res.data?.data?.email || "",
          phone: res.data?.data?.phone || "",
        };
      } catch {
        return {
          id: b.userId,
          name: "",
          email: "",
          phone: "",
        };
      }
    }),
  );

  const userMap = new Map(users.map((u) => [u.id, u]));

  let data = bookings.map((b) => {
    const user = userMap.get(b.userId);

    return {
      bookingId: b.id,

      customerId: b.userId,
      customerName: user?.name || "",
      customerEmail: user?.email || "",
      customerPhone: user?.phone || "",

      garageId: b.garageId,
      garageName: garageMap.get(b.garageId) || "",

      startTime: b.startTime,
      endTime: b.endTime,

      status: b.status,

      createdAt: b.createdAt,
    };
  });

  if (filters.search) {
    const s = filters.search.toLowerCase();

    data = data.filter(
      (d) =>
        d.customerName.toLowerCase().includes(s) ||
        d.customerEmail.toLowerCase().includes(s) ||
        d.customerPhone.includes(s) ||
        d.garageName.toLowerCase().includes(s),
    );
  }

  return {
    data,

    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
