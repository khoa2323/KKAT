import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:8000';

test.describe('KKAT form E2E', () => {
  test('Render dynamic fields', async ({ page }) => {
    await page.goto(BASE);
    // Ensure form root exists
    await expect(page.locator('#form-root')).toBeVisible();
    // Check fields
    await expect(page.locator('#input-nguoi-nhan')).toBeVisible();
    await expect(page.locator('#input-loi-chuc')).toBeVisible();
    await expect(page.locator('#input-anh-nen')).toBeVisible();
    // type checks
    const loiChucTag = await page.locator('#input-loi-chuc').evaluate(e => e.tagName.toLowerCase());
    expect(loiChucTag).toBe('textarea');
    const anhNenType = await page.locator('#input-anh-nen').evaluate(e => e.type || e.tagName.toLowerCase());
    // anh_nen should be input[type=url]
    expect(anhNenType).toBe('url');
  });

  test('Required validation and focus', async ({ page }) => {
    await page.goto(BASE);
    // Clear inputs
    await page.fill('#input-nguoi-nhan', '');
    await page.fill('#input-loi-chuc', '');
    // Submit
    await page.click('button[type="submit"]');
    // Expect error messages displayed
    const errNguoi = page.locator('#input-nguoi-nhan-error');
    const errLoi = page.locator('#input-loi-chuc-error');
    await expect(errNguoi).toBeVisible();
    await expect(errLoi).toBeVisible();
    // First invalid should be focused
    const active = await page.evaluate(() => document.activeElement && document.activeElement.id);
    expect(active === 'input-nguoi-nhan' || active === 'input-loi-chuc').toBeTruthy();
  });

  test('MaxLength and pattern validation', async ({ page }) => {
    await page.goto(BASE);
    // Make loi_chuc too long (600 chars > maxLength)
    const long = 'a'.repeat(600);
    await page.fill('#input-loi-chuc', long);
    // invalid image URL (not a valid URL)
    await page.fill('#input-anh-nen', 'not-a-valid-url');
    await page.click('button[type="submit"]');
    await expect(page.locator('#input-loi-chuc-error')).toBeVisible();
    await expect(page.locator('#input-anh-nen-error')).toBeVisible();
  });

  test('Accessibility attributes present and set on error', async ({ page }) => {
    await page.goto(BASE);
    // Cause an error on nguoi_nhan
    await page.fill('#input-nguoi-nhan', '');
    await page.click('button[type="submit"]');
    const aria = await page.getAttribute('#input-nguoi-nhan', 'aria-describedby');
    expect(aria).toBeTruthy();
    const ariaInvalid = await page.getAttribute('#input-nguoi-nhan', 'aria-invalid');
    expect(ariaInvalid).toBe('true');
  });

  test('Success payload triggers alert and logs payload', async ({ page }) => {
    await page.goto(BASE);
    // Intercept dialog
    const dialogs = [];
    page.on('dialog', d => {
      dialogs.push(d.message());
      d.accept();
    });
    const consoleMessages = [];
    page.on('console', msg => consoleMessages.push(msg.text()));

    await page.fill('#input-nguoi-nhan', 'Nguyen Van A');
    await page.fill('#input-loi-chuc', 'Chuc mung');
    await page.fill('#input-anh-nen', 'https://example.com/photo.jpg?auto=format');
    await page.click('button[type="submit"]');

    // Expect alert was shown
    expect(dialogs.length).toBeGreaterThan(0);
    // Expect console logged payload
    const hasPayloadLog = consoleMessages.some(m => m.includes('Form valid. Payload'));
    expect(hasPayloadLog).toBeTruthy();
  });
});
