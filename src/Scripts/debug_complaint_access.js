import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Complaint } from '../Models/Complain.model.js';
import { User } from '../Models/User.model.js';

// Adjust path as needed or hardcode for debug
// dotenv.config({ path: './.env' });
const MONGODB_URI = "mongodb+srv://shreyashree5127_db_user:nQ5skHty7FeKYqjt@cluster0.qng35be.mongodb.net/?appName=Cluster0";

const debugComplaint = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const complaintId = '69908437b3f10e3e02c53ca9'; // ID from screenshot

        const complaint = await Complaint.findById(complaintId);

        if (!complaint) {
            console.log('Complaint not found!');
            return;
        }

        console.log('Complaint details:');
        console.log('ID:', complaint._id);
        console.log('Title:', complaint.title);
        console.log('CollegeId:', complaint.collegeId);
        console.log('CreatedBy:', complaint.createdBy);

        if (complaint.createdBy) {
            const user = await User.findById(complaint.createdBy);
            if (user) {
                console.log('Creator details:');
                console.log('ID:', user._id);
                console.log('Email:', user.email);
                console.log('CollegeId:', user.collegeId);
                console.log('CollegeId Match:', complaint.collegeId === user.collegeId);
            } else {
                console.log('Creator not found in Users collection');
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

debugComplaint();
