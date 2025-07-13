const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const imagePath = process.argv[2];
  const motionPrompt = process.argv[3];
  const outputPath = path.join(process.cwd(), 'glif_output.mp4');

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  await page.goto('https://glif.app/', { waitUntil: 'networkidle2' });
  await page.waitForSelector('input[type="file"]');
  await page.$('input[type="file"]')
    .then(input => input.uploadFile(imagePath));

  await page.waitForTimeout(5000);
  await page.focus('textarea');
  await page.keyboard.type(motionPrompt);
  const [btn] = await page.$x("//button[contains(., 'Generate')]");
  if (!btn) throw new Error("Generate button not found");
  await btn.click();
  await page.waitForSelector('video', { timeout: 60000 });

  const src = await page.$eval('video', v => v.src);
  const res = await page.goto(src);
  fs.writeFileSync(outputPath, await res.buffer());

  console.log("✅ Video downloaded to", outputPath);
  await browser.close();
})();
