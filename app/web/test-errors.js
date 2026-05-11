const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
    }
  });

  page.on('pageerror', error => {
    console.log('PAGE EXCEPTION:', error.message);
  });

  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    console.log('Page loaded successfully');
    
    // Ayrıca /notes sayfasına git
    await page.goto('http://localhost:3000/notes', { waitUntil: 'networkidle' });
    console.log('/notes loaded');
    
    // Ayrıca /calendar sayfasına git
    await page.goto('http://localhost:3000/calendar', { waitUntil: 'networkidle' });
    console.log('/calendar loaded');
    
  } catch (err) {
    console.error('Navigation error:', err);
  }

  await browser.close();
})();
