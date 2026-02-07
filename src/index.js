// import dotenv from 'dotenv';
// import path from "path";



// dotenv.config({
//     path: './.env'
// });
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔥 FORCE absolute path to .env
dotenv.config({ path: path.resolve(__dirname, "../.env") });

console.log("ENV CHECK:");
// console.log("ACCESS_SECRET =", process.env.ACCESS_SECRET);
// console.log("ACCESS_EXPIRY =", process.env.ACCESS_EXPIRY);
// console.log("REFRESH_SECRET =", process.env.REFRESH_SECRET);
// console.log("REFRESH_EXPIRY =", process.env.REFRESH_EXPIRY);
import connectDB from './Db/index.js';
import app from './app.js';

const PORT = process.env.PORT || 8000;


connectDB()
.then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
        console.log(`🌐 Access the server at http://localhost:${PORT}`);
    }); 
})
.catch((error) => {
    console.error("Failed to connect to the database", error);
});   
// console.log("MONGO_URI =", process.env.DB_URL);                                     