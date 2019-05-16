'use strict';
//AVRO schema
const avroSchema = {
  "type": "record",
  "name": "BrianUserType",
  "namespace": "bwo.kafka.example",
  "fields": [{
      "name": 'id',
      "type": 'string'
    }, {
      name: 'timestamp',
      "type": 'double'
    },
    {
      "name": "first",
      "type": "string",
      "default": "NONE"
    },
    {
      "name": "last",
      "type": "string",
      "default": "NONE"
    },
    {
      "name": "age",
      "type": "int",
      "default": -1
    },
    {
      "name": "phone",
      "type": "string",
      "default": "NONE"
    },
    {
      "name": "address",
      "type": {
        "type": "record",
        "name": "main_address",
        "fields": [{
            "name": "street",
            "type": "string",
            "default": "NONE"
          },
          {
            "name": "street2",
            "type": "string",
            "default": "NONE"
          },
          {
            "name": "city",
            "type": "string",
            "default": "NONE"
          },
          {
            "name": "country",
            "type": "string",
            "default": "NONE"
          },
          {
            "name": "zip",
            "type": "string",
            "default": "NONE"
          }
        ]
      },
      "default": {}
    }
  ]
};
//schema

//define const
const http = require('http');
const express = require('express');
const kafka = require('kafka-node');
const avro = require('avsc');

const app = express();
const server = http.createServer(app);
const type = avro.parse(avroSchema);
const debug = true;

//kafka stuff
const HighLevelConsumer = kafka.HighLevelConsumer;
const Offset = kafka.Offset;
const Client = kafka.Client;
const argv = require('yargs')
  .boolean('from_beginning')
  .boolean('verbose').argv;

const port = argv.port || 9080;
const zk = '127.0.0.1:2181';
const topiclist = (argv.topic || 'weather_display').split(",");

const fromBeginning = argv.from_beginning;
const verbose = argv.verbose;
const topics = [];

for (var i = 0; i < topiclist.length; i++) {
  topics.push({
    topic: topiclist[i]
  });
}

const client = new Client(zk);
const options = {
  autoCommit: true,
  fromBeginning: fromBeginning,
  fetchMaxWaitMs: 1000,
  fetchMaxBytes: 1024 * 1024
};
const consumer = new HighLevelConsumer(client, topics, options);
const offset = new Offset(client);

const io = require('socket.io').listen(server);

server.listen(port, function() {
  console.log('App listening on port 9080!')
});
//kafka stuff

//routing stuff
app.use(express.static('public'));
app.set('view engine', 'ejs')

app.get('/', function(req, res) {
  var laport = req.app.settings.port || port;
  var url = req.protocol + '://' + req.hostname + (laport == 80 || laport == 443 ? '' : ':' + laport) + "/";
  console.log('URL is ',url);
  res.render('index',{url:url});
})

//Socket stuff
consumer.on('message', function(message) {
  if (debug) {
    console.log(this.id, message);
  }

  try {
    //     var msg = message.value;
    var buf = new Buffer(message.value, 'binary'); // Read string into a buffer.
    var decodedMessage = type.fromBuffer(buf); // Skip prefix.

    io.emit('brian1', decodedMessage);

    io.emit(message.topic, decodedMessage);
  } catch (err) {
    console.log('error', err);
  }
});
consumer.on('error', function(err) {
  console.log('error', err);
});
consumer.on('offsetOutOfRange', function(topic) {
  topic.maxNum = 2;
  offset.fetch([topic], function(err, offsets) {
    var min = Math.min.apply(null, offsets[topic.topic][topic.partition]);
    consumer.setOffset(topic.topic, topic.partition, min);
  });
});
