const puppeteer = require('../video-project/node_modules/puppeteer');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'video-project', 'public', 'frames');
fs.mkdirSync(outDir, { recursive: true });

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
  console.log('Launching Chrome to capture high-res application frames...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 1 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // 1. Initial Dashboard with Welcome strip
  console.log('1. Capturing Initial Dashboard...');
  await page.goto('http://localhost:3210/?tenant=tenant-alpha', { waitUntil: 'networkidle2' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle2' });
  await sleep(1000);
  await page.screenshot({ path: path.join(outDir, '01_dashboard_initial.png') });

  // 2. Dismiss welcome strip if present, hover over Acme Corp
  console.log('2. Dismissing welcome strip...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('.welcome-strip button, button'));
    const btn = btns.find(b => b.textContent.includes('Explore on my own') || b.textContent.includes('Explore'));
    if (btn) btn.click();
  });
  await sleep(500);
  await page.screenshot({ path: path.join(outDir, '02_dashboard_clean.png') });

  // 3. Click Sync Telemetry
  console.log('3. Triggering Sync Telemetry...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(x => x.textContent.includes('Sync Telemetry'));
    if (b) b.click();
  });
  await sleep(700);
  await page.screenshot({ path: path.join(outDir, '03_dashboard_syncing.png') });
  await sleep(2500); // Wait for sync stages to complete
  await page.screenshot({ path: path.join(outDir, '04_dashboard_synced.png') });

  // 4. Open AI Assistant dock
  console.log('4. Opening AI Assistant...');
  await page.evaluate(() => {
    const fab = document.querySelector('.assistant-fab');
    if (fab) fab.click();
  });
  await sleep(700);
  await page.screenshot({ path: path.join(outDir, '05_assistant_dock_open.png') });

  // Click suggestion chip: "Which account needs attention?"
  console.log('5. Clicking "Which account needs attention?"...');
  await page.evaluate(() => {
    const chips = Array.from(document.querySelectorAll('.chat-suggestions button, .suggestion-chip, button'));
    const target = chips.find(c => c.textContent.includes('Which account') || c.textContent.includes('attention'));
    if (target) target.click();
  });
  await sleep(2000);
  await page.screenshot({ path: path.join(outDir, '06_assistant_risk_analysis.png') });

  // Click suggestion chip: "Acknowledge the Acme Corp risk" or type it
  console.log('6. Requesting Acknowledge Risk tool card...');
  const chipFound = await page.evaluate(() => {
    const chips = Array.from(document.querySelectorAll('.chat-suggestions button, .suggestion-chip, button'));
    const target = chips.find(c => c.textContent.includes('Acknowledge') || c.textContent.includes('Acme'));
    if (target) {
      target.click();
      return true;
    }
    return false;
  });

  if (!chipFound) {
    await page.type('.composer-input', 'Acknowledge the Acme Corp risk');
    await page.keyboard.press('Enter');
  }
  await sleep(2200);
  await page.screenshot({ path: path.join(outDir, '07_assistant_tool_card.png') });

  // Click Approve button in tool card if available
  console.log('7. Approving Fastn Workflow execution...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, .chat-tool-btn, .chat-tool-actions button'));
    const approve = btns.find(b => b.textContent.includes('Approve') || b.textContent.includes('Execute'));
    if (approve) approve.click();
  });
  await sleep(2500);
  await page.screenshot({ path: path.join(outDir, '08_assistant_closed_loop_complete.png') });

  // 8. Integrations Catalog
  console.log('8. Capturing Integrations Page...');
  await page.goto('http://localhost:3210/integrations?tenant=tenant-alpha', { waitUntil: 'networkidle2' });
  await sleep(1000);
  await page.screenshot({ path: path.join(outDir, '09_integrations_catalog.png') });

  // Click diagnostic test ping on Slack
  console.log('9. Triggering Slack ping...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const pingBtn = btns.find(b => b.textContent.includes('Test') || b.title?.includes('ping') || b.textContent.includes('Ping'));
    if (pingBtn) pingBtn.click();
  });
  await sleep(600);
  await page.screenshot({ path: path.join(outDir, '10_integrations_ping_toast.png') });

  // 10. Email Operations
  console.log('10. Capturing Emails Page...');
  await page.goto('http://localhost:3210/emails?tenant=tenant-alpha', { waitUntil: 'networkidle2' });
  await sleep(1000);
  await page.screenshot({ path: path.join(outDir, '11_emails_table.png') });

  // Open top email modal
  console.log('11. Opening Email Reader Modal...');
  await page.evaluate(() => {
    const rows = document.querySelectorAll('tbody tr, .email-row, .table-row');
    if (rows.length > 0) rows[0].click();
  });
  await sleep(800);
  await page.screenshot({ path: path.join(outDir, '12_emails_modal.png') });

  // 12. Activity & Audit Telemetry
  console.log('12. Capturing Activity Page...');
  await page.goto('http://localhost:3210/runs?tenant=tenant-alpha', { waitUntil: 'networkidle2' });
  await sleep(1000);
  await page.screenshot({ path: path.join(outDir, '13_runs_table.png') });

  // Expand platform details
  console.log('13. Expanding Platform details...');
  await page.evaluate(() => {
    const details = document.querySelector('details, .platform-details-summary, .details-toggle');
    if (details) details.click();
  });
  await sleep(600);
  await page.screenshot({ path: path.join(outDir, '14_runs_expanded.png') });

  // 13. Tenant Beta Isolation check
  console.log('14. Capturing Tenant Beta...');
  await page.goto('http://localhost:3210/?tenant=tenant-beta', { waitUntil: 'networkidle2' });
  await sleep(1000);
  await page.screenshot({ path: path.join(outDir, '15_tenant_beta_isolated.png') });

  await browser.close();
  console.log('ALL FRAMES SUCCESSFULLY CAPTURED!');
})();
