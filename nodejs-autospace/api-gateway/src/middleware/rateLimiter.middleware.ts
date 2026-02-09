import rateLimit from "express-rate-limit";

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
    console.error(
      `[HealthCheck] ${serviceName} is DOWN → ${serviceUrl}`,
      error instanceof Error ? error.message : error,
    );

    return {
      name: serviceName,
      status: "down",
      url: serviceUrl,
    };
  }
};

export const checkAllServices = async (): Promise<ServiceHealth[]> => {
  return Promise.all(
    Object.entries(servicesConfig).map(([serviceName, service]) =>
      checkHealth(serviceName, service.url),
    ),
  );
};

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,

  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests, please try again later",
    });
  },
});

// add cheyyannam limiting asper project big like password reset limit //
