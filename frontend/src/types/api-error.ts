export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
};
