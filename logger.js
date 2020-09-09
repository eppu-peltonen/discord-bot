
const winston = require('winston');

//transport with level critical logs all, debug logs debug and trace etc.
var logLevels = {
  levels: {
      trace: 0,
      debug: 1,
      info: 2,
      warn: 3,
      error: 4,
      critical: 5
  },
  colors: {
    trace: 'white',
    debug: 'cyan',
    info: 'green',
    warn: 'gray',
    error: 'red',
    critical: 'red'
  }
};

const logger = new (winston.Logger)({  
    levels: logLevels.levels,
    colors: logLevels.colors,  
    transports: [
      new (winston.transports.File)({
        name: 'combined',
        filename: './logs/combined.log',
        level: 'critical'        
      }),
      new (winston.transports.File)({
        name: 'crash',
        filename: './logs/crash.log',
        level: 'trace',
        handleExceptions: true,
        humanReadableUnhandledException: true
      }),
      new (winston.transports.Console)({
        name: "console",
        level: "critical",
        prettyPrint: true,
        timestamp: true,
        colorize: true,
        handleExceptions: true,
        humanReadableUnhandledException: true        
      })
    ],    
  });

  module.exports = logger;
  
