import dotenv from "dotenv";
dotenv.config();

const DATA_PATH = process.env["DATA_PATH"];
if (!DATA_PATH) throw new Error("Environment variable DATA_PATH not set");

const MONGODB_URI = process.env["MONGODB_URI"];
if (!MONGODB_URI) throw new Error("Environment variable MONGODB_URI not set");

const PORT = process.env["PORT"] ? Number(process.env["PORT"]) : 3000;

export default {
    DATA_PATH,
    MONGODB_URI,
    PORT,
};
