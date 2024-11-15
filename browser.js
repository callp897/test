const puppeteer = require('puppeteer');
const fsSync = require("fs");
const fs = require('fs').promises;
const filePath = './data/cache.json';
const jsonData = require(filePath);
const proxyChain = require('proxy-chain')
require('dotenv').config()

async function automateBrowser(login, password) {
    const proxyUser = 'egzdkhbl'; // Proxy username
    const proxyPass = 'lebpugkqbhy7'; // Proxy password
    const proxy = '173.211.0.148:6641';
    const originalUrl = `http://${proxyUser}:${proxyPass}@${proxy}`;
    // Return anonymized version of original URL; it looks like <http://127.0.0.1:45678>
    const newUrl = await proxyChain.anonymizeProxy(originalUrl);

    const browser = await puppeteer.launch({ headless: false, defaultViewport: null,args: [
            `--proxy-server=${newUrl}`,
            '--ignore-certificate-errors' // Useful for HTTPS sites
        ],
        executablePath:
            process.env.NODE_ENV === "production"
                ? process.env.PUPPETEER_EXECUTABLE_PATH
                : puppeteer.executablePath(),
    });

    const page = await browser.newPage();
    await page.goto('https://httpbin.org/ip');
    // await page.authenticate({ proxyUser, proxyPass });
    setTimeout(() => {},2000)
    var passed = false;
    var intervalId;
    try {
        // Navigate to the login page of the other site
        await page.goto('https://www.dat.com/login');
        await page.click('.list-item .lt-web-desk');
        // Find the login and password input fields and submit button
        // Get the last <a> tag using XPath
        // setTimeout(() => {},10000)
        // const lastATag = await page.$x('(//ul[@class="list-unstyled list-divider pl-0 mb-0"]/li/a)[last()]');
        // // Wait for the new tab to be created
        // await lastATag[0].click()

        // await page.click(lastATag[0]);
        const newTarget = await browser.waitForTarget(target => target.opener() === page.target());
        try {
            // Wait for the button to appear
            await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 5000 });

            // Click on the button
            await page.click('#onetrust-accept-btn-handler');
            console.log('Clicked on the cookie button successfully.');
        } catch (error) {
            console.error('Button cookie not found or clickable:', error);
        }

        // Switch to the new tab
        const newPage = await newTarget.page();
// Wait for the navigation in the new tab to complete (replace 'https://example.com/new-page' with the expected final URL)
        await newPage.waitForNavigation({ waitUntil: 'domcontentloaded' });
        // if (lastATag.length > 0) {
        //
        //     // Click on the last <a> tag
        //     // Click the link to open a new tab
        //     const [newTab] = await Promise.all([
        //         new Promise(resolve => browser.once('targetcreated', target => resolve(target.page()))),
        //         // page.click(lastATag[0])
        //         await lastATag[0].click()
        //     ]);
        //
        //
        //     // Switch to the new tab
        //     await newTab.bringToFront();
        // } else {
        //     console.error('No matching element found');
        // }


        const content = await newPage.content()

        // Log the page content
        console.log(content);
        console.log(newPage.url());
        const usernameSelector = 'input#mat-input-1';
        await newPage.click(usernameSelector)
        // await page.waitForSelector(usernameSelector, { timeout: 20000 }); // Adjust the timeout as needed

        await newPage.type(usernameSelector, login);
        await newPage.click('input#mat-input-0');
        await newPage.type('input#mat-input-0', password);
        await newPage.click('label.mat-checkbox-layout');
        await newPage.click('button#submit-button');
        await newPage.waitForSelector('.ulp-authenticator-selector-text'); // Wait for the span element to appear
        const value = await newPage.evaluate(() => {
            // Execute JavaScript in the browser context to get the text content of the span element
            const span = document.querySelector('.ulp-authenticator-selector-text');
            return span.textContent; // Return the text content of the span element
        });
        const currentUrl = newPage.url();
        intervalId = setInterval(() => {
            checkTypeJson(login,value).then(jsonTypeData => {

                checkJson().then(async jsonData => {
                    console.log('Executing logic at', new Date());
                    if (jsonData[login] != null) {

                        await newPage.click('input#code');
                        await newPage.type('input#code', jsonData[login]);
                        await newPage.click('input#rememberBrowser')
                        await newPage.click('button[name="action"]');
                        // Usage
                        delay(1300)
                            .then(async () => {

                                // var elementExists = newPage.$('#error-element-code'); // Replace '#your_element_selector' with the selector of the element you want to check
                                if (currentUrl === newPage.url()) {
                                    jsonData[login] = null;
                                    fsSync.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
                                    // You can perform further actions here if the element exists
                                } else {
                                    jsonData[login+'_cookies'] = await newPage.cookies();
                                    fsSync.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
                                    clearInterval(intervalId);
                                    console.log('Interval stopped');
                                }
                            })
                            .catch(err => {
                                // Handle errors
                                console.error('Error occurred:', err);
                                console.log({ message: 'Internal Server Error', success: false });
                            });
                        // try{
                        //     newPage.waitForSelector('#error-element-code.ulp-input-error-message', { timeout: 3000 }); // Wait for the specific element to appear with a timeout of 5 seconds
                        //     jsonData[login] = null;
                        //     fsSync.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
                        // }catch (e) {
                        //     // page.click('button[class="btn"]');
                        //     clearInterval(intervalId);
                        //     console.log('Interval stopped');
                        // }
                    }
                    console.log(jsonData);

                    // Add your logic here based on jsonData
                }).catch(error => {
                    console.error('Error during JSON check:', error);
                });
            });
        }, 1500);
        // Wait for the page to reload or handle further interactions

    } catch (error) {
        console.error('Error during browser automation:', error);
    } finally {
        // await browser.close();
    }
}

// Usage example
const login = 'your_username';
const password = 'your_password';

module.exports = { automateBrowser };
// automateBrowser(login, password);

// Define a function that returns a promise which resolves after a certain timeout
function delay(timeout) {
    return new Promise(resolve => {
        setTimeout(resolve, timeout);
    });
}

async function checkJson() {
    const filePath = './data/cache.json';

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

async function checkTypeJson(login,value) {
    const filePath = './type.json';

    try {
        // Read the file asynchronously
        const data = await fs.readFile(filePath, 'utf8');

        // Parse the JSON data
        const jsonData = JSON.parse(data);
        // if (jsonData.twofa == null) {
        //     return null;
        // }
        // Set the value for the specified key
        jsonData[login] = value;

        // Convert the JSON object back to a string
        const updatedData = JSON.stringify(jsonData, null, 2);

        // Write the updated JSON data back to the file
        await fs.writeFile(filePath, updatedData, 'utf8');
        // Return the parsed JSON
        return jsonData[login];
    } catch (error) {
        console.error('Error reading or parsing JSON file:', error);
        return null;
    }
}
