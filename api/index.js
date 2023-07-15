import express from 'express';
const app = express();

import dotenv from 'dotenv';
import dbConnect from '../utils/dbConnect.js';
// import authRoute from './routes/auths.js';
import regRoute from '../routes/register.js'


dotenv.config();
// ===connect to database
dbConnect();
// ===accept json files
app.use(express.json());
// ===register the routes
// app.use('/api/auth', authRoute);
app.use('/api', regRoute);

app.listen(8800, ()=>{
    console.log("Backend server is running...")
})