require("dotenv").config();
const passport = require("passport");
const authRoute = require("./routes/auth");
const cookieSession = require("cookie-session");
const passportStrategy = require("./passport");
const path = require('path');
const express = require("express");
const cors = require("cors");
const dbConfig = require("./app/config/db.config");
const finalhandler = require('finalhandler');
const serveStatic = require('serve-static');

const serve = serveStatic("/node_modules");
const http = require('http');

const app = express();

var corsOptions = {
  origin: "*"
};


app.use(express.static(__dirname));

//app.use(express.static('./node_modules'));

//app.use('/node_modules/', express.static('/node_modules/'));

app.use('/static', express.static(__dirname + '/public'));

app.use("/node_modules", express.static(path.join(__dirname, 'node_modules')));

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const db = require("./app/models");
const Role = db.role;

db.mongoose
  .connect(`mongodb+srv://ju3tin:grierson1979@cluster0.yudvymo.mongodb.net/?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    initial();
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });

var server = http.createServer(function(req, res) {
  var done = finalhandler(req, res);
  serve(req, res, done);
});

app.get('/studio1', function(req, res) {
  res.sendFile(path.join(__dirname, '/index.html'));
});

app.get('/js/main.js', function(req, res) {
  res.sendFile(path.join(__dirname, '/js/main.js'));
});

app.get('/css/style.css', function(req, res) {
  res.sendFile(path.join(__dirname, '/css/style.css'));
});
// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to emersa application." });
});

//google stuff

app.use('/node_modules', express.static(__dirname + '/node_modules'));
app.use(express.json());
app.use(
	cookieSession({
		name: "session",
		keys: ["emersa"],
		maxAge: 24 * 60 * 60 * 100,
	})
);

app.use(passport.initialize());
app.use(passport.session());

app.use(
	cors({
		origin: "*",
		methods: "GET,POST,PUT,DELETE",
		credentials: true,
	})
);

app.use("/auth", authRoute);



// end google stuff




// routes
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

function initial() {
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({
        name: "user"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'user' to roles collection");
      });

      new Role({
        name: "moderator"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'moderator' to roles collection");
      });

      new Role({
        name: "admin"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'admin' to roles collection");
      });
    }
  });
}
