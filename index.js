const express = require('express');
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const auth = require("./routes/auth");
const fileUpload = require('express-fileupload');
const PORT = 6002;

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(express.static("public"));
require("dotenv").config();


const { PORT, MONGODB_URI, NODE_ENV,ORIGIN } = require("./config");


// routes
const authRoutes = require("./routes/auth.route");


// init express app


// middlewares



app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: ORIGIN,
    optionsSuccessStatus: 200,
  })
);

// middle ware
app.use(express.static('public')); //to access the files in public folder
app.use(cors()); // it enables all cors requests
app.use(fileUpload());
// file upload api
app.post('/upload', (req, res) => {
    if (!req.files) {
        return res.status(500).send({ msg: "file is not found" })
    }
        // accessing the file
    const myFile = req.files.image;
    //  mv() method places the file inside public directory
    myFile.mv(`${__dirname}/public/${myFile.name}`, function (err) {
        if (err) {
            console.log(err)
            return res.status(500).send({ msg: "Error occured" });
        }
        // returing the response with file path and name
        return res.send({name: myFile.name, path: `/${myFile.name}`});
    });
})

// log in development environment

if (NODE_ENV === "development") {
  const morgan = require("morgan");
  app.use(morgan("dev"));
}

// index route

app.get("/", (req, res) => {
  res.status(200).json({
    type: "success",
    message: "server is up and running",
    data: null,
  });
});

// routes middlewares

app.use("/api/auth", auth);


// page not found error handling  middleware

app.use("*", (req, res, next) => {
  const error = {
    status: 404,
    message: API_ENDPOINT_NOT_FOUND_ERR,
  };
  next(error);
});

// global error handling middleware
app.use((err, req, res, next) => {
  console.log(err);
  const status = err.status || 500;
  const message = err.message || SERVER_ERR;
  const data = err.data || null;
  res.status(status).json({
    type: "error",
    message,
    data,
  });
});

async function main() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });

    console.log("database connected");

    app.listen(6002, () => console.log(`Server listening on port ${PORT}`));
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

main();

