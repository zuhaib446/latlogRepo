const express = require('express');
const app = express();
const redis = require('redis');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
require('dotenv').config();


const PORT = process.env.PORT || 4000;

const redisClient = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
});

redisClient.on('connect', () => {
    console.log('Redis client connected....');
});

redisClient.on('error', (err) => {
    console.log('Something went wrong', err);
});

redisClient.connect();


app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
    app.use(express.static('client/build'));
}

generateLatLog = async (lat, lon) => {
    await redisClient.lPush('latlog', JSON.stringify({ lat, lon }));
}

// random cordinates generator  radius of islamabad city
// 33.6372834,72.9465142
generateRandomLatLog = () => {
    const lat = Math.random() * (36.0 - 34.0) + 34.0;
    const lon = Math.random() * (72.0 - 70.0) + 70.0;
    generateLatLog(lat, lon);
}
// 1 minute cron job
cron.schedule('*/1 * * * *', () => {
    generateRandomLatLog();
});

// get all latlogs
app.get('/location', (req, res) => {
    const get = redisClient.lRange('latlog', 0, -1);
    get.then((data) => {
        res.json({
            data,
        });
    }
    ).catch((err) => {
        console.log('Error: ', err);
    }
    );
});
// clear redis data after 5 minutes

cron.schedule('*/5 * * * *', () => {
    redisClient.flushall();
});

app.listen(PORT, () => { console.log('Server is running on port 4000') });
