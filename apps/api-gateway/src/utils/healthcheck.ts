import axios from "axios";
import { servicesConfig } from "../config/service.config";

export interface ServiceHealth {
  name: string;
  status: "up" | "down";
  responseTime?: number;
  url: string;
}

export const checkHealth = async (
  serviceName: string,
  serviceUrl: string,
): Promise<ServiceHealth> => {
  const startTime = Date.now();

  try {
    await axios.get(`${serviceUrl}/health`, { timeout: 5000 });
    const responceTime = Date.now() - startTime;

    return {
      name: serviceName,
      status: "up",
      responseTime: responceTime,
      url: serviceUrl,
    };
  } catch (error) {
    return {
      name: serviceName,
      status: "down",
      url: serviceUrl,
    };
  }
};

export const checkAllServices = async (): Promise<ServiceHealth[]> => {
  const services = [
    {
      name: "auth-service",
      url: process.env.AUTH_SERVICE_URL || "http://localhost:4001",
    },
    {
      name: "booking-service",
      url: process.env.BOOKING_SERVICE_URL || "http://localhost:4002",
    },
    {
      name: "resource-service",
      url: process.env.RESOURCE_SERVICE_URL || "http://localhost:4003",
    },
  ];

  return Promise.all(
    Object.entries(servicesConfig).map(([serviceName, service]) =>
      checkHealth(serviceName, service.url),
    ),
  );
};
