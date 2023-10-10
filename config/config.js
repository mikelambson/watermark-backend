// ./config/config.js
export const PORT = process.env.PORT || 8080;

const commonConfig = {
  host: ["127.0.0.1", "backup1_host"],
};

export const development = {
  username: process.env.DEVDB_USERNAME,
  password: process.env.DEVDB_PASSWORD,
  database: process.env.DEVDB_NAME,
  dialect: "postgres",
  ...commonConfig,
};

export const production = {
  username: process.env.DEVDB_USERNAME,
  password: process.env.DEVDB_PASSWORD,
  database: process.env.DEVDB_NAME,
  dialect: "postgres",
  ...commonConfig,
};
