const puppeteer = require('puppeteer');
const fs = require('fs').promises;

async function automateBrowser(login, password) {
    const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
    const page = await browser.newPage();
    var passed = false;
    var intervalId;
    try {
        // Navigate to the login page of the other site
        await page.goto('https://www.dat.com/login');

        // Find the login and password input fields and submit button
        // Get the last <a> tag using XPath
        const lastATag = await page.$x('(//ul[@class="list-unstyled list-divider pl-0 mb-0"]/li/a)[last()]');
        // Wait for the new tab to be created
        await lastATag[0].click()

        // await page.click(lastATag[0]);
        const newTarget = await browser.waitForTarget(target => target.opener() === page.target());

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

        setTimeout(() => {},10000)
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

        intervalId = setInterval(() => {
            checkTypeJson(login,value).then(jsonTypeData => {

                checkJson().then(jsonData => {
                    console.log('Executing logic at', new Date());
                    if (jsonData[login] != null) {
                        newPage.click('input#code');
                        newPage.type('input#code', jsonData[login]);
                        newPage.click('input#rememberBrowser')
                        newPage.click('button[name="action"]');
                        // page.click('button[class="btn"]');
                        clearInterval(intervalId);
                        console.log('Interval stopped');
                    }
                    console.log(jsonData);

                    // Add your logic here based on jsonData
                }).catch(error => {
                    console.error('Error during JSON check:', error);
                });
            });
        }, 1000);
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
