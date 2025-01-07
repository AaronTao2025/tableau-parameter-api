const express = require('express');
const cors = require('cors'); // Import CORS middleware
const https = require('https');
const fs = require('fs');
const app = express();
const port = 5001;

// Middleware to serve static files from the "dist" directory
app.use(express.static('dist')); // Adjust "dist" to your actual static file directory

// Middleware to parse JSON requests
app.use(express.json());

// Middleware to log each access
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next(); // Proceed to the next middleware or route handler
});

// Use CORS middleware to allow cross-origin requests
app.use(cors()); // This will allow all origins by default

let parameterValues = {};

// Endpoint to get the current parameter value
app.get('/getParameterValue', (req, res) => {
  if (parameterValues) {
    res.json(parameterValues);
  } else {
    res.status(404).send('Parameter value not set.');
  }
});

// Endpoint to update the current parameter value
app.post('/updateParameterValue', (req, res) => {
  const { key, value } = req.body;
  if (key && value) {
    parameterValues[key] = value;
    res.send('Parameter value updated successfully.');
  } else {
    res.status(400).send('No key or value provided.');
  }
});

// Create an HTTPS server
const server = https.createServer({
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
}, app);

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
