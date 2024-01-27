import express from 'express'
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

// Earlier express was not able to handle the JSON files or incoming data. So we have to use BodyParser. But now we can direclty accept the incoming data by following way.

// In this way we can directly configure the express for accepting JSON.
app.use(express.json({
    limit: '16kb', // Here we are setting the size of data allowed to save on our server.
}));

// In case of URL's, we have seen that what we type on google is not same that go into URL's. For eg: If we searched for "MS Dhoni" then in URL it will become like "MS+Dhoni" or "MS%20Dhoni". So URL's have their own UrlEncoding. In express app we have to configure that also.

// In this way we can configure express app for urlencodings.
// "extended: true" is used to tell that it can accept nested objects.
app.use(express.urlencoded({extended: true, limit: "16kb"}));

// We also need to configure express for static files.
app.use(express.static('public'));

/*** SETTING COOKIE PARSER ***/
// cookie-parser is used so that we can perfom CRUD operations on user's server.
// cookie-parser allow us to safely add, access and remove cookies from user's browser from server.
app.use(cookieParser());



// routes import
import userRouter from './routes/user.routes.js';

import healthcheckRouter from "./routes/healthcheck.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"

// routes declaration

// app.use("/users", userRouter); // Here when user will go to "/users" routes then the control of program will jump to "userRouter" file.

// This is a good practice but not followed in industry.
// Since this is an API as we are talking to another route and we need to send and recieve data. To understand this line understand "userRoute" file thoroughly.
// Since it is an API so industry grade practice is to display the "api" word and it's version in url.
// So, the route becomes:

app.use("/api/v1/users", userRouter);
// The final url will become "http://localhost3000:/api/v1/users/{routes define in userRouter file such as /register or /login}"

app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/dashboard", dashboardRouter)

export { app } 