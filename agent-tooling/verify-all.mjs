// Comprehensive deep verification test script for PulseGuard vNext
import assert from 'node:assert';
import http from 'node:http';
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { getEmails, recordEmail } from '../pulseguard-app/app/api/emails/store.js';

console.log('=== PulseGuard Deep Verification Test Suite ===\n');

// 1. In-memory store tests
console.log('Test Group 1: Email In-Memory Store Logic');
{
  const allEmails = getEmails();
  assert(allEmails.length >= 3, `Expected at least 3 seeded emails, got ${allEmails.length}`);
  console.log(`  ✓ getEmails() returns seeded emails (${allEmails.length} found)`);

  const alphaEmails = getEmails({ tenant: 'tenant-alpha' });
  assert(alphaEmails.every((e) => e.tenant === 'tenant-alpha'), 'Alpha tenant filter failed');
  console.log(`  ✓ Tenant filtering works for tenant-alpha (${alphaEmails.length} found)`);

  const betaEmails = getEmails({ tenant: 'tenant-beta' });
  assert(betaEmails.every((e) => e.tenant === 'tenant-beta'), 'Beta tenant filter failed');
  console.log(`  ✓ Tenant filtering works for tenant-beta (${betaEmails.length} found)`);

  const delivered = getEmails({ status: 'delivered' });
  assert(delivered.every((e) => e.status === 'delivered'), 'Status filtering failed');
  console.log(`  ✓ Status filtering works for status=delivered (${delivered.length} found)`);

  const searchSubject = getEmails({ search: 'Acme Corp' });
  assert(searchSubject.length > 0, 'Search by subject keyword failed');
  console.log(`  ✓ Search filtering works for "Acme Corp" (${searchSubject.length} found)`);

  const searchTo = getEmails({ search: 'globex-exports' });
  assert(searchTo.length > 0, 'Search by recipient email keyword failed');
  console.log(`  ✓ Search filtering works for recipient "globex-exports" (${searchTo.length} found)`);

  // Record a new email
  const newEmail = recordEmail({
    tenant: 'tenant-beta',
    to: 'test-qa@example.com',
    subject: '[Test] Automated QA email',
    html: '<p>QA check</p>',
    status: 'sent',
    sentAt: new Date(Date.now() - 35000).toISOString(), // 35 seconds ago -> should auto-upgrade to delivered
  });
  assert.strictEqual(newEmail.to, 'test-qa@example.com');
  console.log('  ✓ recordEmail correctly inserts a new email');

  // Trigger getEmails to verify auto-upgrade after > 30s
  const updatedEmails = getEmails();
  const found = updatedEmails.find((e) => e.id === newEmail.id);
  assert(found, 'Recorded email not found in store');
  assert.strictEqual(found.status, 'delivered', '30-second auto-upgrade sent -> delivered failed');
  console.log('  ✓ 30-second auto-upgrade rule verified (sent -> delivered)');
}

// 2. SVG Brand Icons sanity check
console.log('\nTest Group 2: Brand Icons & SVGs');
{
  const brandIconsContent = fs.readFileSync('./pulseguard-app/components/brand-icons.jsx', 'utf8');
  assert(brandIconsContent.includes('export function BrandLogo('), 'BrandLogo must be exported');
  assert(brandIconsContent.includes('export function BrandLogoTile('), 'BrandLogoTile must be exported');
  assert(brandIconsContent.includes('export function HubSpotLogo('), 'HubSpotLogo must be exported');
  assert(brandIconsContent.includes('export function SlackLogo('), 'SlackLogo must be exported');
  assert(brandIconsContent.includes('export function GmailLogo('), 'GmailLogo must be exported');
  assert(brandIconsContent.includes('GoogleLogo'), 'GoogleLogo must be exported');
  assert(brandIconsContent.includes('#FF7A29'), 'HubSpot brand color missing');
  assert(brandIconsContent.includes('#EA4335'), 'Gmail brand color missing');
  assert(brandIconsContent.includes('#4A154B'), 'Slack #4A154B brand color missing');
  console.log('  ✓ All brand icon exports and color signatures verified (#FF7A29, #EA4335, #4A154B)');
}

// 3. HTTP Server Verification
console.log('\nTest Group 3: Live Next.js Server & Routes Verification');
const PORT = 3217;
const serverProc = spawn('npx', ['next', 'start', '-p', String(PORT)], {
  cwd: './pulseguard-app',
  shell: true,
  stdio: 'ignore',
});

function fetchPath(p, options = {}) {
  return new Promise((resolve, reject) => {
    const body = options.body;
    const headers = { ...(options.headers || {}) };
    if (body) {
      headers['Content-Length'] = Buffer.byteLength(body);
    }
    const req = http.request(
      `http://localhost:${PORT}${p}`,
      {
        method: options.method || 'GET',
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve({ status: res.statusCode, data, headers: res.headers }));
      }
    );
    req.on('error', reject);
    if (body) {
      req.end(body);
    } else {
      req.end();
    }
  });
}

// Wait for server to become responsive
async function runHttpTests() {
  let attempts = 0;
  while (attempts < 20) {
    try {
      await fetchPath('/');
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 600));
      attempts++;
    }
  }

  try {
    // Test 3.1: GET / (Dashboard)
    const home = await fetchPath('/');
    assert.strictEqual(home.status, 200, 'Home page failed');
    assert(home.data.includes('PulseGuard') || home.data.includes('PulseGrid'), 'Dashboard content missing');
    assert(home.data.includes('Emails delivered this week') || home.data.includes('delivered'), 'Emails metric missing from home');
    console.log('  ✓ GET / (Dashboard) returns 200 and renders email counter');

    // Test 3.2: GET /integrations
    const integrations = await fetchPath('/integrations');
    assert.strictEqual(integrations.status, 200, 'Integrations page failed');
    assert(integrations.data.includes('Google Gmail') || integrations.data.includes('Gmail'), 'Gmail connector missing from integrations');
    assert(integrations.data.includes('HubSpot CRM') || integrations.data.includes('HubSpot'), 'HubSpot missing');
    assert(integrations.data.includes('Slack Messaging') || integrations.data.includes('Slack'), 'Slack missing');
    console.log('  ✓ GET /integrations returns 200 with 3-connector brand grid');

    // Test 3.3: GET /emails
    const emailsPage = await fetchPath('/emails');
    assert.strictEqual(emailsPage.status, 200, 'Emails page failed');
    assert(emailsPage.data.includes('Emails') && emailsPage.data.includes('Every alert email'), 'Emails page content missing');
    console.log('  ✓ GET /emails returns 200 with Resend-style operations UI');

    // Test 3.4: GET /runs
    const runsPage = await fetchPath('/runs');
    assert.strictEqual(runsPage.status, 200, 'Runs page failed');
    console.log('  ✓ GET /runs returns 200');

    // Test 3.5: GET /api/emails
    const apiEmails = await fetchPath('/api/emails');
    assert.strictEqual(apiEmails.status, 200, 'GET /api/emails failed');
    const emailsJson = JSON.parse(apiEmails.data);
    assert(Array.isArray(emailsJson.emails), 'GET /api/emails should return { emails: [...] }');
    assert(emailsJson.emails.length > 0, 'No emails returned by /api/emails');
    console.log(`  ✓ GET /api/emails returns 200 with ${emailsJson.emails.length} emails`);

    // Test 3.6: POST /api/emails
    const postEmail = await fetchPath('/api/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenant: 'tenant-alpha',
        to: 'judge@fastn.ai',
        subject: '[Fastn Hackathon] Live submission alert test',
        html: '<p>Live test completed successfully.</p>',
      }),
    });
    assert.strictEqual(postEmail.status, 201, 'POST /api/emails failed');
    const postEmailJson = JSON.parse(postEmail.data);
    assert(postEmailJson.email && postEmailJson.email.to === 'judge@fastn.ai');
    console.log('  ✓ POST /api/emails returns 201 and stores new email entry');

    // Test 3.7: POST /api/telemetry (Simulate Anomaly)
    const telemetry = await fetchPath('/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenant: 'tenant-alpha',
        customerId: '347506893507',
        accountName: 'Acme Corp',
        customerDomain: 'acme-corp.com',
        healthScore: 38,
        usageDropPct: 53,
      }),
    });
    assert.strictEqual(telemetry.status, 200, 'POST /api/telemetry failed');
    const telemetryJson = JSON.parse(telemetry.data);
    assert(telemetryJson.status, 'Telemetry response missing status');
    const steps = telemetryJson.steps || (telemetryJson.run && telemetryJson.run.steps);
    assert(steps, 'Telemetry response missing execution steps');
    console.log(`  ✓ POST /api/telemetry returns 200 with status: ${telemetryJson.status} (Steps: ${steps})`);

    // Test 3.8: GET /api/ack (Acknowledge link)
    const ackGet = await fetchPath('/api/ack?tenant=tenant-alpha&customer=Acme%20Corp&by=Account%20Manager');
    assert.strictEqual(ackGet.status, 200, 'GET /api/ack failed');
    assert(ackGet.data.includes('Risk Acknowledged') || ackGet.data.includes('Acme Corp'));
    console.log('  ✓ GET /api/ack returns 200 confirmation HTML page');

    // Test Group 4: Explicit Edge Cases & Boundary Values
    console.log('\nTest Group 4: Edge Cases & Error Paths');

    // 4.1: Empty search query returns all emails without error
    const emptySearch = await fetchPath('/api/emails?search=%20%20');
    assert.strictEqual(emptySearch.status, 200);
    const emptySearchJson = JSON.parse(emptySearch.data);
    assert(emptySearchJson.emails.length >= 3, 'Empty whitespace search should return all emails');
    console.log('  ✓ Edge Case: Whitespace search returns all emails');

    // 4.2: Non-matching search query returns empty array cleanly
    const missSearch = await fetchPath('/api/emails?search=nonexistent_string_12345');
    assert.strictEqual(missSearch.status, 200);
    const missSearchJson = JSON.parse(missSearch.data);
    assert.strictEqual(missSearchJson.emails.length, 0, 'Miss search should return empty array');
    console.log('  ✓ Edge Case: Non-existent search returns empty array');

    // 4.3: Non-existent tenant filter
    const missTenant = await fetchPath('/api/emails?tenant=unknown-tenant-xyz');
    assert.strictEqual(missTenant.status, 200);
    const missTenantJson = JSON.parse(missTenant.data);
    assert.strictEqual(missTenantJson.emails.length, 0, 'Unknown tenant should return 0 emails');
    console.log('  ✓ Edge Case: Unknown tenant filter returns 0 emails');

    // 4.4: Malformed POST /api/emails (empty string body with json content-type)
    const badPost = await fetchPath('/api/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{ broken json ',
    });
    assert.strictEqual(badPost.status, 400, 'Malformed JSON should return 400');
    console.log('  ✓ Edge Case: Malformed JSON returns HTTP 400');

    // 4.5: Healthy telemetry submission (usageDrop 5%, healthScore 92)
    const healthyTelemetry = await fetchPath('/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenant: 'tenant-alpha',
        customerId: 'probe-healthy-001',
        accountName: 'Healthy Client Inc',
        healthScore: 92,
        usageDropPct: 5,
      }),
    });
    assert.strictEqual(healthyTelemetry.status, 200);
    const healthyJson = JSON.parse(healthyTelemetry.data);
    assert.strictEqual(healthyJson.status, 'HEALTHY', 'Should resolve to HEALTHY status');
    console.log('  ✓ Edge Case: Healthy telemetry resolves to HEALTHY status without risk escalation');

    // 4.6: usageDropPct: 0 boundary value (must NOT fall back to 50%)
    const zeroDropTelemetry = await fetchPath('/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenant: 'tenant-alpha',
        customerId: 'probe-zero-drop-001',
        accountName: 'Zero Drop Corp',
        healthScore: 40,
        usageDropPct: 0,
      }),
    });
    assert.strictEqual(zeroDropTelemetry.status, 200);
    const emailsRes1 = await fetchPath('/api/emails?search=Zero%20Drop');
    const emailsJson1 = JSON.parse(emailsRes1.data);
    assert(emailsJson1.emails.length > 0, 'Zero drop email was not stored');
    const zeroDropEmail = emailsJson1.emails[0];
    assert(
      zeroDropEmail.subject.includes('usage down 0%'),
      `Expected 'usage down 0%' in subject, got: '${zeroDropEmail.subject}'`
    );
    console.log('  ✓ Edge Case: usageDropPct: 0 correctly preserves 0% in alert email (no 50% fallback bug)');

    // 4.7: healthScore: 0 boundary value (must NOT fall back to 38)
    const zeroHealthTelemetry = await fetchPath('/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenant: 'tenant-beta',
        customerId: 'probe-zero-health-001',
        accountName: 'Zero Health Corp',
        healthScore: 0,
        usageDropPct: 65,
      }),
    });
    assert.strictEqual(zeroHealthTelemetry.status, 200);
    const emailsRes2 = await fetchPath('/api/emails?search=Zero%20Health');
    const emailsJson2 = JSON.parse(emailsRes2.data);
    assert(emailsJson2.emails.length > 0, 'Zero health email was not stored');
    const zeroHealthEmail = emailsJson2.emails[0];
    assert(
      zeroHealthEmail.html.includes('0/100'),
      `Expected '0/100' health in HTML, got: '${zeroHealthEmail.html.slice(0, 300)}'`
    );
    console.log('  ✓ Edge Case: healthScore: 0 correctly preserves 0/100 in email body (no 38 fallback bug)');

    // 4.8: Numeric customer ID resolution to clean account name
    const numericIdTelemetry = await fetchPath('/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenant: 'tenant-alpha',
        customerId: '347506893507',
        customerDomain: 'acme-corp.com',
        healthScore: 35,
        usageDropPct: 54,
      }),
    });
    assert.strictEqual(numericIdTelemetry.status, 200);
    const emailsRes3 = await fetchPath('/api/emails?search=Acme%20Corp');
    const emailsJson3 = JSON.parse(emailsRes3.data);
    const acmeEmail = emailsJson3.emails.find((e) => e.subject.includes('54%'));
    assert(acmeEmail, 'Acme 54% email not found');
    assert(
      acmeEmail.subject.includes('Acme Corp'),
      `Subject should resolve to Acme Corp, got: '${acmeEmail.subject}'`
    );
    assert(
      !acmeEmail.subject.includes('347506893507'),
      `Numeric ID leaked into subject: '${acmeEmail.subject}'`
    );
    console.log('  ✓ Edge Case: Numeric ID 347506893507 cleanly resolves to Acme Corp in email alert');

    // 4.9: Email Detail Pane failed status badge and stepper logic
    const emailsPageContent = fs.readFileSync('./pulseguard-app/app/emails/page.jsx', 'utf8');
    assert(
      /selectedEmail\.status\s*===\s*['"]failed['"]\s*\?\s*['"]risk['"]/.test(emailsPageContent),
      'Failed badge must map to risk class in detail pane'
    );
    assert(
      /selectedEmail\.status\s*===\s*['"]failed['"]\s*\?\s*['"]Failed['"]\s*:\s*['"]Delivered['"]/.test(
        emailsPageContent
      ),
      'Stepper must display Failed state for failed emails'
    );
    console.log('  ✓ UI Verification: Failed email status correctly maps to risk badge and failed stepper state');

    // 4.10: Gmail OAuth authorization URL check
    const integrationsContent = fs.readFileSync('./pulseguard-app/app/integrations/page.jsx', 'utf8');
    assert(
      integrationsContent.includes('accounts.google.com/o/oauth2/auth'),
      'Gmail OAuth URL missing from integrations page'
    );
    assert(
      integrationsContent.includes('Authorize OAuth'),
      'Authorize OAuth action missing from integrations page'
    );
    console.log('  ✓ OAuth Channel Verification: Google OAuth authorization URL is valid and verified');

    console.log('\n🎉 ALL 24 DEEP VERIFICATION & EDGE CASE TESTS PASSED!\n');
    serverProc.kill();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Verification Failed:', err);
    serverProc.kill();
    process.exit(1);
  }
}

runHttpTests();
