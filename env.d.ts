declare namespace NodeJS {
  interface ProcessEnv {
    PORT: string; // env variables are always strings
    MONGO_DB: string;

    JWT_SECRET: string;
    JWT_RESET_SECRET: string;

    GOOGLE_Client_ID: string;
    GOOGLE_Client_Secret: string;
    BACKEND_URL: string;

    NODE_ENV: "development" | "production" | "test";
  }
}
