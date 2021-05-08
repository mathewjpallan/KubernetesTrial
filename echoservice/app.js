const express = require("express");
const app = express();
const port = 9595

var server = app.listen(port, () => {
    console.log("Server running on port " + port);
});

app.get("/echo/:echo/after/:time", (req, res, next) => {
    let time = req.params.time;
    let echo = req.params.echo;

    setTimeout(function() {
        res.status(200).send(echo);
    },time);
});


app.get("/echo/:echo", (req, res, next) => {
    let echo = req.params.echo;
    res.status(200).send(echo);
});

