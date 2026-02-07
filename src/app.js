import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';


const app = express();

app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true,limit:"16kb"}));
app.use(express.static("Public"));
app.use(cookieParser());

app.use(
  cors({
    origin:process.env.CORS_ORIGIN?.split(",")|| "http://localhost:5173",
    credentials:true,
    methods:["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
    allowedHeaders:["Content-type","Authorization"]
}))




app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.get('/insta', (req, res) => {
  res.send('Hello World! INSTAGRAM');
});

import healthcheckRoutes from './Routes/healthcheck.routes.js';

import authRouter from "./Routes/auth.routes.js"

import complaintRouter from "./Routes/complaint.routes.js"

import collegeRouter from "./Routes/college.routes.js"

import voteRoutes from "./Routes/vote.routes.js";
import complainMediaRouter from "./Routes/complaintMedia.routes.js"

import adminRoutes from "./Routes/admin.routes.js"

import staffRoutes from "./Routes/staff.routes.js"


import notificationRoutes from "./Routes/notification.routes.js"

app.use("/api/v1/complain/vote", voteRoutes);



app.use("/api/v1/auth",authRouter);
app.use("/api/v1/complain",complaintRouter);
app.use("/api/v1/complain",complainMediaRouter)

app.use('/api/v1/healthcheck', healthcheckRoutes);

app.use('/api/v1/college',collegeRouter)



app.use('/api/v1/admin',adminRoutes)



app.use('/api/v1/staff',staffRoutes)


app.use("/api/v1/notification",notificationRoutes)

export default app;