const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs').promises;
const { EventEmitter } = require('events');
const { automateBrowser } = require('./browser');

// Read the JSON file
const filePath = './cache.json';
let jsonData = require(filePath); // Load initially
const typeFilePath = './type.json';
let typeJsonData = require(typeFilePath); // Load initially

// Create an event emitter for each username
const emitters = {};

// Define your API endpoint
app.get('/api/dat/:username/:password', async (req, res) => {
    const username = req.params.username;
    const password = req.params.password;

    // Update the in-memory data
    jsonData[username] = null;
    typeJsonData[username] = null;

    // Write the updated content back to the file (asynchronously)
    await Promise.all([
        fs.writeFile(filePath, JSON.stringify(jsonData, null, 2)),
        fs.writeFile(typeFilePath, JSON.stringify(typeJsonData, null, 2))
    ]);

    // Start the browser automation process
    automateBrowser(username, password);

    // Create an event emitter for this username if it doesn't exist
    if (!emitters[username]) {
        emitters[username] = new EventEmitter();
    }

    // Listen for the 'twofatype' event emitted by checkValue
    emitters[username].once('twofatype', twofatype => {
        res.json({ message: 'Login request sent to browser', twofatype });
    });
});

// API to set 2FA value
app.get('/api/set/twofa/:username/:twofa', async (req, res) => {
    const twofa = req.params.twofa;
    const username = req.params.username;

    // Update the in-memory data
    jsonData[username] = twofa;

    // Write the updated content back to the file (asynchronously)
    await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2));

    // Emit the 'twofatype' event with the twofa value
    if (emitters[username]) {
        emitters[username].emit('twofatype', twofa);
        delete emitters[username]; // Remove the event emitter after emitting the event
    }

    res.json({ message: '2fa set successfully' });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

async function checkValue(key) {
    const filePath = './type.json';

    try {
        // Read the file asynchronously
        const data = await fs.readFile(filePath, 'utf8');

        // Parse the JSON data
        const jsonData = JSON.parse(data);

        // Emit the 'twofatype' event with the value if it's not null
        if (jsonData[key] !== null && emitters[key]) {
            emitters[key].emit('twofatype', jsonData[key]);
            delete emitters[key]; // Remove the event emitter after emitting the event
        }
    } catch (error) {
        console.error('Error reading or parsing JSON file:', error);
        // You might want to handle this error accordingly
    }
}
