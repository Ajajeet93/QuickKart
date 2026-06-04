const winston = require('winston');

const isProduction = process.env.NODE_ENV === 'production';

const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

const devFormat = winston.format.combine(
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.colorize(),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}${info.stack ? `\n${info.stack}` : ''}`
    )
);

const logger = winston.createLogger({
    level: isProduction ? 'info' : 'debug',
    format: isProduction ? format : devFormat,
    transports: [
        new winston.transports.Console(),
        // Uncomment to add file logging
        // new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        // new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
});

module.exports = logger;
