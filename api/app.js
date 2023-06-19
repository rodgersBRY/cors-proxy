var express = require("express"),
  request = require("request"),
  bodyParser = require("body-parser"),
  app = express();

var myLimit = typeof process.argv[2] != "undefined" ? process.argv[2] : "100kb";

console.log("Using limit: ", myLimit);

app.use(bodyParser.json({ limit: myLimit }));

app.all("*", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    req.header("access-control-request-headers")
  );

  if (req.method === "OPTIONS") {
    // CORS Preflight
    res.send();
  } else {
    var targetURL = req.header("Target-URL");
    if (!targetURL) {
      return res.status(500).json({ error: "Invalid target URL" });
    }

    request(
      {
        url: targetURL,
        method: req.method,
        headers: { Authorization: req.header("Authorization") },
        json: req.body,
      },
      (err, res, body) => {
        if (err) res.status(res.statusCode).json(err);
      }
    ).pipe(res);
  }
});

app.set("port", process.env.PORT || 5000);

app.listen(app.get("port"), () => {
  console.log("Proxy server listening on port " + app.get("port"));
});

module.exports = app