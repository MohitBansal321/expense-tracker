import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

  await page.goto('http://localhost:3001/');
  
  // Wait a bit to ensure the React app has time to mount and crash if it's going to
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await browser.close();
})();
