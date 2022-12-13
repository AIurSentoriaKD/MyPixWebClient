const express = require("express");
const session = require("express-session");
const env = require('dotenv');
const path = require("path");
const cookieParser = require("cookie-parser");

const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');
//const morgan = require('morgan');
//const _ = require('lodash');

const app = express();

//app.use(multer());

//Middleware settings
app.use(fileUpload());
//add other middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
//app.use(morgan('dev'));

// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());
app.use(express.static(path.join(__dirname, "./src/public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./src/views"));
env.config()

//app.use(fileUpload());

//Session configuration
const date = new Date()
const expiresAt = new Date(+date + 12000 * 10000)
console.log(expiresAt);
app.use(cookieParser());
app.use(
  session({
    secret: "keyboard neko",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 15 * 5 },
  })
);

app.use((req, res, next) => {
  if (!req.user)
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  next();
});

// Routes Config
const login_route = require("./src/routes/login.routes");
const dashboard_route = require("./src/routes/dashboard.routes");
const illust_route = require("./src/routes/illust.routes");
const user_route = require("./src/routes/user.routes");
const submit_route = require("./src/routes/submit.routes")
const manage_route = require("./src/routes/manage.routes")

app.use("/", login_route);
app.use("/DashBoard", dashboard_route);
app.use("/illusts", illust_route);
app.use("/user", user_route);
app.use("/submit", submit_route);
app.use("/manage", manage_route)

//OPEN SERVER
// const PORT = process.env.PORT;
const PORT = 1234;

app.listen(PORT, (req, res) => {
  console.log("App listening on port: ", PORT);
});
