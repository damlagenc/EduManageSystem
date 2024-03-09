const winston = require('winston');

const logger = winston.createLogger({
    level: 'info', // Log seviyesi
    format: winston.format.json(), // Log formatı
    transports: [
        //
        // Konsola loglama
        new winston.transports.Console({
            format: winston.format.simple(),
        }),
        //
        // Dosyaya loglama
        new winston.transports.File({ filename: 'authlogfile.log' }),
    ],
});

module.exports = logger;
