var express = require('express');
var request = require('request');
var https = require('https');
var app = express();
var path = require('path');
var public_dir = './public/';
var libxmljs = require("libxmljs");


//declare variables
const REQUIRED_ENVIRONMENT_SETTINGS = [{
        name: "TALEO_URL",
        message: "The URL of the taleo system you want to use"
    },
    {
        name: "TALEO_USERNAME",
        message: "The taleo username you want to connect to taleo for checking candidate"
    },
    {
        name: "TALEO_PASSWORD",
        message: "The taleo username you want to connect to taleo for checking candidate"
    },
]

for (var env of REQUIRED_ENVIRONMENT_SETTINGS) {
    if (!process.env[env.name]) {
        console.error(`Environment variable ${env.name} should be set: ${env.message}`);
    } else {
        // convenient for debug; however: this line exposes all environment variable values - including any secret values they may contain
        // console.log(`Environment variable ${env.name} is set to : ${process.env[env.name]}`);  
    }
}

//added for ACCS
var LISTEN_PORT = process.env.PORT || 8484;
app.listen(LISTEN_PORT, function () {
    console.log('listening on port : ' + LISTEN_PORT);
});

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.use(express.static(path.join(__dirname, 'public')));


app.get('/checkCandidate/:email', function (req, res) {

    res.setHeader('Content-Type', 'application/json');
    var escapedheader1 = '\'text\/xml; charset=UTF-8\'';
    var escapedheader2 = ' \'http:\/\/www.taleo.com\/ws\/tee800\/2009\/01\/find\/FindService#findEntities\'';

    request.post({
        method: 'POST ',
        url: process.env.TALEO_URL,
        headers: {
            'Content-Type': escapedheader1,
            'SOAPAction': escapedheader2
        },
        body: '<?xml version="1.0" encoding="UTF-8"?>' +
            '<env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/"' +
            ' xmlns:ns1="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"' +
            ' xmlns:ns2="http://www.taleo.com/ws/tee800/2009/01/find"' +
            ' xmlns:ns3="http://itk.taleo.com/ws/query">' +
            '<env:Header>' +
            '<wsse:Security env:mustUnderstand="1" xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">' +
            '<wsse:UsernameToken wsu:Id="UsernameToken-CC096863D2EF92A27A15547326886925">' +
            '<wsse:Username>' + process.env.TALEO_USERNAME + '</wsse:Username>' +
            '<wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">' + process.env.TALEO_PASSWORD + '</wsse:Password>' +
            '<wsse:Nonce EncodingType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-soap-message-security-1.0#Base64Binary">V8U+BPj0vXCgApVeAhMgMg==</wsse:Nonce>' +
            '<wsu:Created>2019-04-08T14:11:28.692Z</wsu:Created>' +
            '</wsse:UsernameToken>' +
            '</wsse:Security>' +
            '</env:Header>' +
            '<env:Body>' +
            '<ns2:findEntities>' +
            '<ns2:mappingVersion>http://www.taleo.com/ws/art750/2006/12</ns2:mappingVersion>' +
            '<ns2:query>' +
            '<ns3:query alias="GetCandidate" projectedClass="Candidate">' +
            '<ns3:filterings>' +
            '<ns3:filtering>' +
            '<ns3:equal>' +
            '<ns3:field path="EmailAddress"/>' +
            '<ns3:string>' + req.params.email + '</ns3:string>' +
            '</ns3:equal>' +
            '</ns3:filtering>' +
            '</ns3:filterings>' +
            '</ns3:query>' +
            '</ns2:query>' +
            '<ns2:attributes/>' +
            '</ns2:findEntities>' +
            '</env:Body>' +
            '</env:Envelope>'

    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {

            var taleoboolean = false;
            var taleoid = null;
            var xml = body;

            //xpath /soap:Envelope/soap:Body/ns1:findEntitiesResponse/root:Entities/e:Entity/e:Number
            var doc = libxmljs.parseXml(xml);

            var aantal = doc.get('//root:Entities', {
                'root': 'http://www.taleo.com/ws/tee800/2009/01/find'
            }).attr('entityCount');

            console.log('aantal is :' + aantal.value());

            if (aantal.value() != 0) {
                var ltaleoid = doc.get('//e:Number', {
                    'e': 'http://www.taleo.com/ws/art750/2006/12'
                });
                taleoboolean = true;
                taleoid = ltaleoid.text();
                console.log('ltaleoid is ' + ltaleoid.text());
            }
            res.send(
                {
                    "checkCandidateResponse": {
                        "candidateExists": taleoboolean,
                        "taleo-id": taleoid
                    }
                }
            );



        } else {
            console.log(response.statusCode);
            console.log(body);
        }
    }); //end checkcandidate

});