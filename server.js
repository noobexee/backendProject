const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const {xss} = require('express-xss-sanitizer');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');


//Load env vars
dotenv.config({path:'./config/config.env'});

//connect to db
connectDB(); 

const app =express();
app.use(cookieParser());
app.use(express.json());
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());

const limiter = rateLimit({
    windowsMs:10*60*1000,//10min
    max:100
});
app.use(limiter);
app.use(hpp());
app.use(cors());

const auth = require('./routes/auth');
app.use('/api/v1/auth', auth);

const restaurants = require('./routes/restaurants');
app.use('/api/v1/restaurants', restaurants);

const reservations = require('./routes/reservations');
app.use('/api/v1/reservations',reservations);

const menus = require('./routes/menus');
app.use('/api/v1/menus',menus);

const PORT = process.env.PORT || 5000 ;

const server = app.listen(PORT, console.log('Server running in ', process.env.HOST ,' mode on port ', PORT));

//handle rejection
process.on('unhandledRejection',(err,promise)=>{
    console.log(`Error: ${err.massage}`);
    //close server and exit
    server.close(()=>process.exit(1));
});