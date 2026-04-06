import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const logDirectory = path.join(dirname, "../../logs");

const accessLogStream = fs.createWriteStream(
  path.join(logDirectory, "access.log"),
  { flags: "a" }
);

const consoleLogger = morgan("dev");
const fileLogger = morgan("combined", { stream: accessLogStream });

const logger = {
  consoleLogger,
  fileLogger
};

export default logger;