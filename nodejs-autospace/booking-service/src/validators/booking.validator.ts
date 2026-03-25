export class ValidationError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "ValidationError";
    this.status = status;
  }
}

export function validateId(id: string, field: string) {
  if (!id || typeof id !== "string" || id.trim().length === 0) {
    throw new ValidationError(`Invalid ${field}`);
  }

  if (id.length > 50) {
    throw new ValidationError(`${field} too long`);
  }
}

export function validateBookingInput(data: {
  slotId?: string;
  userId?: string;
  garageId?: string;
  startTime?: string | Date;
  endTime?: string | Date;
  vehicleType: string;
  amount?: number;
  status?: string;
  pickupLatitude?: number;
  pickupLongitude?: number;
  pickupAddress?: string;
  valetRequested?: boolean;
}) {
  const {
    slotId,
    userId,
    garageId,
    startTime,
    endTime,
    status,
    pickupAddress,
    pickupLatitude,
    pickupLongitude,
    valetRequested,
  } = data;

  if (slotId) validateId(slotId, "slotId");
  if (userId) validateId(userId, "userId");
  if (garageId) validateId(garageId, "garageId");

  if (!startTime || !endTime) {
    throw new ValidationError("startTime and endTime are required");
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new ValidationError("Invalid date format");
  }

  if (start >= end) {
    throw new ValidationError("startTime must be before endTime");
  }

  if (start < new Date()) {
    throw new ValidationError("startTime cannot be in the past");
  }

  // Duration check (30 min → 24 hours)
  const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

  if (durationMinutes < 30) {
    throw new ValidationError("Minimum booking duration is 30 minutes");
  }

  if (durationMinutes > 1440) {
    throw new ValidationError("Booking cannot exceed 24 hours");
  }

  if (valetRequested) {
    if (
      pickupLatitude === undefined ||
      pickupLongitude === undefined ||
      !pickupAddress
    ) {
      throw new ValidationError(
        "Pickup location required when valet is requested",
      );
    }
  }

  // Status validation
  if (status) {
    const validStatuses = ["pending", "confirmed", "cancelled", "completed"];
    if (!validStatuses.includes(status)) {
      throw new ValidationError(
        `Invalid status. Allowed: ${validStatuses.join(", ")}`,
      );
    }
  }
}

export function validateStatusTransition(
  current: string,
  next: string,
): boolean {
  const transitions: Record<string, string[]> = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["completed", "cancelled"],
    completed: [],
    cancelled: [],
  };

  return transitions[current]?.includes(next) ?? false;
}
