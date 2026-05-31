import winston from "winston";

const customLevelOpt = {
  levels: { fatal: 0, error: 1, warning: 2, info: 3, debug: 4 },
  colors: { fatal: "red", error: "magenta", warning: "blue", info: "green", debug: "yellow" },
};

winston.addColors(customLevelOpt.colors);

const logger = winston.createLogger({
  levels: customLevelOpt.levels,
  transports: [
    new winston.transports.Console({
      level: "debug",
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({
      filename: "./errors.log",
      level: "error",
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    }),
  ],
});

export const addlogger = (req, res, next) => {
  req.logger = logger;
  req.logger.debug(`${req.method} ${req.url} — ${new Date().toISOString()}`);
  next();
};
