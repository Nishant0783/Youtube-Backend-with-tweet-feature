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

export { app }