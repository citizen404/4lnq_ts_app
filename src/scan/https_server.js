const https = require('https');
const fs = require('fs');
const path = require('path');

// Read the certificate and key
const options = {
    key: fs.readFileSync(path.join(__dirname, 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'cert.pem'))
};

// Serve your static files
const express = require('express');
const app = express();

// Serve static files from the current directory
app.use(express.static(__dirname));

// Start the HTTPS server
https.createServer(options, app).listen(8444, () => {
    console.log('HTTPS Server running on https://localhost:8444');
});
