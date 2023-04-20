import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import AuthRoute from './Routes/AuthRoute.js'
import UserRoute from './Routes/UserRoute.js'
import PostRoute from './Routes/PostRoute.js'
import ConversationRoute from './Routes/ConversationRoute.js'
import MessageRoute from './Routes/MessageRoute.js'

const app = express();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000', 'http://localhost:4001', 'http://localhost:4000', 'https://hectrum.online', 'https://api.hectrum.online', "https://socket.hectrum.online", "https://admin.hectrum.online");
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header("Access-Control-Allow-Credentials", true);
    next();
});

// M I D D L E W A R E S 
app.use(bodyParser.json({ limit: '30mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }))


// app.use(cors({
//     origin: [
//         'http://localhost:3000',
//         'http://localhost:4001',
//         'http://localhost:4000',
//         'https://hectrum.online',
//         'https://api.hectrum.online',
//         "https://socket.hectrum.online",
//         "https://admin.hectrum.online"
//     ],
//     credentials: true
// }));



dotenv.config()
mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    app.listen(5000, () => console.log("Connected to 5000"));
}).catch((err) => { console.log(err) })


// R O U T E S

app.use('/api/auth', AuthRoute);
app.use('/api/users', UserRoute);
app.use('/api/posts', PostRoute)
app.use('/api/conversations', ConversationRoute)
app.use('/api/messages', MessageRoute);
