
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config({ path: path.resolve(__dirname, "../.env") });

console.log("ENV CHECK:");

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
                                    