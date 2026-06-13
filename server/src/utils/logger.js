const fs = require('fs');
const path = require('path');

const logDirectory = path.join(__dirname, '../../logs');

if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

const logger = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${type.toUpperCase()}]: ${message}\n`;
  
  console.log(logMessage);
  
  fs.appendFile(path.join(logDirectory, `${type}.log`), logMessage, (err) => {
    if (err) console.error('Error writing to log file:', err);
  });
};

module.exports = logger;
