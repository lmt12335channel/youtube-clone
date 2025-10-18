export const DEFAULT_LIMIT = 10;

export const appURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const TRPC_ERROR_MESSAGES = {
  MUX_UPLOAD_FAILED: "Failed to create Mux upload.",
  DB_CREATE_FAILED: "Failed to create record in database.",
};

export const userPlaceholderImage = "/user-placeholder.svg";