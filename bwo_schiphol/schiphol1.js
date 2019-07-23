var http = require("https");

var options = {
  "method": "GET",
  "hostname": "domain",
  "port": null,
  "path": "/flights",
  "headers": {
    "resourceversion": "v4",
	"app_id": "b6062b99",
	"app_key": "456330c16a9794c0a47e89791cf69538"
  }
};

var req = http.request(options, function (res) {
  var chunks = [];

  res.on("data", function (chunk) {
    chunks.push(chunk);
  });

  res.on("end", function () {
    var body = Buffer.concat(chunks);
    console.log(body.toString());
  });
});

req.end();