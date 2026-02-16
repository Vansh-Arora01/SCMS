
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const collegeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
});

const College = mongoose.model("College", collegeSchema);

async function checkColleges() {
    try {
        console.log('Connecting to DB...', process.env.DB_URL);
        await mongoose.connect(process.env.DB_URL);
        console.log('Connected.');

        const colleges = await College.find({});
        console.log('--- COLLEGES IN DB ---');
        colleges.forEach(c => console.log(`"${c.name}"`));
        console.log('----------------------');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

checkColleges();
