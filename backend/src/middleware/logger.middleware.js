const morgan = require("morgan");
const fs = require("fs");
const path = require("path");

const logDirectory = path.join(__dirname, "../../logs");

const accessLogStream = fs.createWriteStream(
  path.join(logDirectory, "access.log"),
  { flags: "a" }
);

module.exports = [
  morgan("dev"), // console log
  morgan("combined", { stream: accessLogStream }) // file log
];