var express = require('express');
var request = require('request');
var app = express();
var path = require('path');
var public_dir = './public/';



//added for ACCS
var LISTEN_PORT = process.env.PORT || 48484;
app.listen(LISTEN_PORT, function () {
    console.log('listening on port : ' + LISTEN_PORT);
});


app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/swagger.json', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(public_dir + 'swagger.json', {"root": __dirname});
});

app.get('/moviesearch/:name', function (req, res) {
    res.set('Content-Type', 'application/json');
    request.get({url: "https://www.omdbapi.com/?t=" + req.params.name}, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            res.send(body);
            //console.log(body);
        }
    }); //end get moviesearch request

});

