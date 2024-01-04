const express = require("express");
require('dotenv').config();

const app = express();

const port = 3000;

app.get('/', (req, res)=>{
    res.send('Hello there!');
});

app.get('/twitter', (req, res)=>{
    res.send("Nishant Paliwal");
});

app.get('/login', (req, res)=>{
    res.send('<h1>Please Login at Chai or code');
});

app.listen(process.env.PORT, (req, res)=>{
    console.log("App is listening at port ", process.env.PORT);
});