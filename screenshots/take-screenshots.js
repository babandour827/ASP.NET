const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:5173';
const OUT_DIR = path.join(__dirname);

async function login(page) {
  await page.goto(BASE_URL + '/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', 'admin@association.sn');
  await page.fill('input[type="password"]', 'Admin123!');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/');
  await page.waitForLoadState('networkidle');
}

async function screenshot(page, name, url = null) {
  if (url) {
    await page.goto(BASE_URL + url);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);
  }
  const file = path.join(OUT_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log(`✓ ${name}.png`);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // 1. Page Login
  await page.goto(BASE_URL + '/login');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  await screenshot(page, '01-login');

  // 2. Login with wrong credentials to show error
  await page.fill('input[type="email"]', 'test@test.com');
  await page.fill('input[type="password"]', 'wrongpass');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1500);
  await screenshot(page, '02-login-error');

  // Se connecter correctement
  await login(page);

  // 3. Dashboard
  await page.waitForTimeout(1000);
  await screenshot(page, '03-dashboard', '/');

  // 4. Membres liste
  await screenshot(page, '04-membres', '/membres');

  // 5. Modale Ajout Membre — cliquer sur "Nouveau Membre"
  const btnNouveauMembre = page.locator('button', { hasText: /nouveau|ajouter|add/i }).first();
  if (await btnNouveauMembre.isVisible()) {
    await btnNouveauMembre.click();
    await page.waitForTimeout(600);
    await screenshot(page, '05-membres-ajout-modal');
    await page.keyboard.press('Escape');
  }

  // 6. Cotisations
  await screenshot(page, '06-cotisations', '/cotisations');

  // 7. Filtre cotisations — cliquer sur un filtre statut
  const filterBtn = page.locator('button', { hasText: /retard|payé|attente/i }).first();
  if (await filterBtn.isVisible()) {
    await filterBtn.click();
    await page.waitForTimeout(600);
    await screenshot(page, '07-cotisations-filtre');
  }

  // 8. Paiements
  await screenshot(page, '08-paiements', '/paiements');

  // 9. Modale Enregistrer Paiement
  const btnPaiement = page.locator('button', { hasText: /enregistrer|nouveau|paiement/i }).first();
  if (await btnPaiement.isVisible()) {
    await btnPaiement.click();
    await page.waitForTimeout(600);
    await screenshot(page, '09-paiements-modal');
    await page.keyboard.press('Escape');
  }

  // 10. Notifications
  await screenshot(page, '10-notifications', '/notifications');

  // 11. Utilisateurs (Admin)
  await screenshot(page, '11-utilisateurs', '/utilisateurs');

  // 12. Swagger (API Docs)
  await page.goto('http://localhost:5125/swagger');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await screenshot(page, '12-swagger');

  await browser.close();
  console.log('\nToutes les captures sont dans:', OUT_DIR);
})();
