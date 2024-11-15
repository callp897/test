const puppeteer = require('puppeteer');
const fs = require('fs').promises;

async function automateBrowser(login, password) {
    const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
    const page = await browser.newPage();
    var passed = false;
    var intervalId;
    try {
        // Navigate to the login page of the other site
        await page.goto('https://csadmin.org/account/auth');

        await page.click('input#login')
        await page.type('input#login', login);
        // Find the login and password input fields and submit button
        await page.click('input#password')
        await page.type('input#password', password);
        await page.evaluate(() => {
            // Replace 'Авторизация' with the text content of your button
            const button = Array.from(document.querySelectorAll('button')).find(b => b.textContent === 'Авторизация');
            if (button) {
                button.click();
            }
        });

        const linkText = '◄     AKIMOFF YouTube ►';
        await page.waitForSelector(`a:contains('${linkText}')`);
        const link = await page.$(`a:contains('${linkText}')`);
        if (link) {
            console.log(link);
            console.log(linkText);
            await link.click();
        }
        // await page.click('')
//         // Get the last <a> tag using XPath
//         const lastATag = await page.$x('(//ul[@class="list-unstyled list-divider pl-0 mb-0"]/li/a)[last()]');
//         // Wait for the new tab to be created
//         await lastATag[0].click()
//
//         // await page.click(lastATag[0]);
//         const newTarget = await browser.waitForTarget(target => target.opener() === page.target());
//
//         // Switch to the new tab
//         const newPage = await newTarget.page();
// // Wait for the navigation in the new tab to complete (replace 'https://example.com/new-page' with the expected final URL)
//         await newPage.waitForNavigation({ waitUntil: 'domcontentloaded' });
//         setTimeout(() => {},10000)
//         const content = await newPage.content()
//
//         // Log the page content
//         console.log(content);
//         console.log(newPage.url());
//         const usernameSelector = 'input#mat-input-1';
//         await newPage.click(usernameSelector)
//         // await page.waitForSelector(usernameSelector, { timeout: 20000 }); // Adjust the timeout as needed
//
//         await newPage.type(usernameSelector, login);
//         await newPage.click('input#mat-input-0')
//         await newPage.type('input#mat-input-0', password);
//         // await page.click('button[class="btn"]');
//         await newPage.click('label.mat-checkbox-layout')
//         intervalId = setInterval(() => {
//             checkJson().then(jsonData => {
//                 console.log('Executing logic at', new Date());
//                 if (jsonData.twofa != null) {
//                     // page.type('input[name="login"]', 'test2');
//                     // page.type('input[name="password"]', 'test2');
//                     // page.click('button[class="btn"]');
//                     // clearInterval(intervalId);
//                     console.log('Interval stopped');
//                 }
//                 console.log(jsonData);
//
//                 // Add your logic here based on jsonData
//             }).catch(error => {
//                 console.error('Error during JSON check:', error);
//             });
//         }, 1000);
//         // Wait for the page to reload or handle further interactions

    } catch (error) {
        console.error('Error during browser automation:', error);
    } finally {
        // await browser.close();
    }
}

// Usage example
const login = 'Akimoff1';
const password = 'rh45hHRHE354erf';

module.exports = { automateBrowser };
automateBrowser(login, password);

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
