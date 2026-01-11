// api-gateway/src/config/services.config.ts
export const servicesConfig = {
  auth: {
    url: process.env.AUTH_SERVICE_URL || "http://localhost:4001",
    healthEndpoint: "/health",
  },
  booking: {
    url: process.env.BOOKING_SERVICE_URL || "http://localhost:4002",
    healthEndpoint: "/health",
  },
  resource: {
    url: process.env.RESOURCE_SERVICE_URL || "http://localhost:4003",
    healthEndpoint: "/health",
  },
};

export const getServiceUrl = (
  serviceName: keyof typeof servicesConfig,
): string => {
  return servicesConfig[serviceName].url;
};
