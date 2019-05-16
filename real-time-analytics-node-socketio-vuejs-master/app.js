/* global process */

// require Express and Socket.io
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var config = require('./config.js');
var moment = require('moment');

var avro = require('avsc');
var kafka = require('kafka-node');

//Avro Schema
var avroSchema = {
    "type": "record",
    "name": "BrianUserType",
    "namespace": "bwo.kafka.example",
    "fields": [
        {
            "name": 'id',
            "type": 'string'
        }, {
            name: 'timestamp',
            "type": 'double'
        },
        {"name": "first",
            "type": "string",
            "default": "NONE"},
        {"name": "last",
            "type": "string",
            "default": "NONE"},
        {"name": "age",
            "type": "int",
            "default": -1},
        {"name": "phone",
            "type": "string",
            "default": "NONE"},
        {"name": "address",
            "type": {
                "type": "record",
                "name": "main_address",
                "fields": [
                    {"name": "street",
                        "type": "string",
                        "default": "NONE"},
                    {"name": "street2",
                        "type": "string",
                        "default": "NONE"},
                    {"name": "city",
                        "type": "string",
                        "default": "NONE"},
                    {"name": "country",
                        "type": "string",
                        "default": "NONE"},
                    {"name": "zip",
                        "type": "string",
                        "default": "NONE"}
                ]},
            "default": {}
        }
    ]
};
//schema

var type = avro.parse(avroSchema);

//kafka
var HighLevelConsumer = kafka.HighLevelConsumer;
var Offset = kafka.Offset;
var Client = kafka.Client;
var argv = require('yargs')
        .boolean('from_beginning')
        .boolean('verbose').argv;

var zk = argv.zk || '127.0.0.1:2181';
var topiclist = (argv.topic || 'node-test').split(",");
var fromBeginning = argv.from_beginning;
var verbose = argv.verbose;
var topics = [];
for (var i = 0; i < topiclist.length; i++) {
    topics.push({topic: topiclist[i]});
}
var client = new Client(zk);
var options = {autoCommit: true, fromBeginning: fromBeginning, fetchMaxWaitMs: 1000, fetchMaxBytes: 1024 * 1024};
var consumer = new HighLevelConsumer(client, topics, options);
var offset = new Offset(client);



// the object that will hold information about the active users currently
// on the site
var visitorsData = {};

app.set('port', (process.env.PORT || 5000));

// serve the static assets (js/dashboard.js and css/dashboard.css)
// from the public/ directory
app.use(express.static(path.join(__dirname, 'public/')));

// serve the index.html page when someone visits any of the following endpoints:
//    1. /
//    2. /about
//    3. /contact
app.get(/\/(about|contact)?$/, function (req, res) {
    res.sendFile(path.join(__dirname, 'views/index.html'));
});

// serve up the dashboard when someone visits /dashboard
app.get('/dashboard', function (req, res) {
    res.sendFile(path.join(__dirname, 'views/dashboard.html'));
});

consumer.on('message', function (message) {
    if (verbose) {
        console.log(this.id, message);
    } else {
        //console.log(message.topic);
    }
    try {
        //     var msg = message.value;

        var buf = new Buffer(message.value, 'binary'); // Read string into a buffer.
        var decodedMessage = type.fromBuffer(buf); // Skip prefix.


        //  console.log('---------',decodedMessage,'-----------------');

        //   try{
        //     msg = JSON.parse(message.value);
        //   }catch(e){
        //      //ok it's not json
        //   }
        io.emit('brian', decodedMessage);
    } catch (err) {
        console.log('error', err);
    }
});
//end onmessage

process.on('SIGINT', function () {
    consumer.close(true, function () {
        process.exit();
    });
});


io.on('connection', function (socket) {
    if (socket.handshake.headers.host === config.host
            && socket.handshake.headers.referer.indexOf(config.host + config.dashboardEndpoint) > -1) {

        // if someone visits '/dashboard' send them the computed visitor data
        io.emit('updated-stats', computeStats());

    }

    // a user has visited our page - add them to the visitorsData object
    socket.on('visitor-data', function (data) {
        visitorsData[socket.id] = data;

        // compute and send visitor data to the dashboard when a new user visits our page
        io.emit('updated-stats', computeStats());
    });

    socket.on('disconnect', function () {
        // a user has left our page - remove them from the visitorsData object
        delete visitorsData[socket.id];

        // compute and send visitor data to the dashboard when a user leaves our page
        io.emit('updated-stats', computeStats());
    });
});






// wrapper function to compute the stats and return a object with the updated stats
function computeStats() {
    return {
        pages: computePageCounts(),
        referrers: computeRefererCounts(),
        activeUsers: getActiveUsers()
    };
}

// get the total number of users on each page of our site
function computePageCounts() {
    // sample data in pageCounts object:
    // { "/": 13, "/about": 5 }
    var pageCounts = {};
    for (var key in visitorsData) {
        var page = visitorsData[key].page;
        if (page in pageCounts) {
            pageCounts[page]++;
        } else {
            pageCounts[page] = 1;
        }
    }
    return pageCounts;
}

// get the total number of users per referring site
function computeRefererCounts() {
    // sample data in referrerCounts object:
    // { "http://twitter.com/": 3, "http://stackoverflow.com/": 6 }
    var referrerCounts = {};
    for (var key in visitorsData) {
        var referringSite = visitorsData[key].referringSite || '(direct)';
        if (referringSite in referrerCounts) {
            referrerCounts[referringSite]++;
        } else {
            referrerCounts[referringSite] = 1;
        }
    }
    return referrerCounts;
}

// get the total active users on our site
function getActiveUsers() {
    return Object.keys(visitorsData).length;
}

http.listen(app.get('port'), function () {
    console.log('listening on *:' + app.get('port'));
});
