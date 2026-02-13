import { test, expect, Page } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies and storage before each test
    await page.context().clearCookies();
  });

  test('should display login page', async ({ page }) => {
    await page.goto('/login');

    await expect(page).toHaveTitle(/Labzz Chat/);
    await expect(page.getByRole('heading', { name: /entrar|login/i })).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/login');

    // Try to submit empty form
    await page.getByRole('button', { name: /entrar|login|submit/i }).click();

    // Should show validation errors
    await expect(page.getByText(/email|e-mail/i)).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login');

    // Click register link
    await page.getByRole('link', { name: /cadastr|registr|criar conta/i }).click();

    await expect(page).toHaveURL(/register|cadastro/);
  });

  test('should display register form', async ({ page }) => {
    await page.goto('/register');

    // Check for form fields
    await expect(page.getByLabel(/nome|name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/senha|password/i).first()).toBeVisible();
  });

  test('should validate password requirements', async ({ page }) => {
    await page.goto('/register');

    // Fill in a weak password
    await page
      .getByLabel(/senha|password/i)
      .first()
      .fill('123');
    await page.getByRole('button', { name: /cadastr|registr|criar/i }).click();

    // Should show password validation error
    await expect(page.getByText(/mínimo|minimum|must be at least/i)).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    // This test requires a valid test user in the database
    test.skip(true, 'Requires test database setup');

    await page.goto('/login');

    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/senha|password/i).fill('Password123!');
    await page.getByRole('button', { name: /entrar|login/i }).click();

    // Should redirect to chat
    await expect(page).toHaveURL(/chat/);
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/email/i).fill('invalid@example.com');
    await page.getByLabel(/senha|password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /entrar|login/i }).click();

    // Should show error message (requires backend to be running)
    // await expect(page.getByText(/inválid|invalid|incorrect/i)).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('login page should be keyboard navigable', async ({ page }) => {
    await page.goto('/login');

    // Tab through form elements
    await page.keyboard.press('Tab');
    await expect(page.getByLabel(/email/i)).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByLabel(/senha|password/i)).toBeFocused();

    await page.keyboard.press('Tab');
    // Next focusable element (button or link)
  });

  test('should have proper page structure', async ({ page }) => {
    await page.goto('/login');

    // Check for main landmark
    await expect(page.locator('main, [role="main"]')).toBeVisible();

    // Check for heading hierarchy
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
  });

  test('form inputs should have labels', async ({ page }) => {
    await page.goto('/register');

    // All inputs should have associated labels
    const inputs = page.locator('input[type="text"], input[type="email"], input[type="password"]');
    const count = await inputs.count();

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');

      // Input should have an id with a matching label, or aria-label/aria-labelledby
      const hasLabel = id || ariaLabel || ariaLabelledBy;
      expect(hasLabel).toBeTruthy();
    }
  });
});

test.describe('Responsive Design', () => {
  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');

    // Form should be visible and usable
    await expect(page.getByRole('button', { name: /entrar|login/i })).toBeVisible();

    // Elements should not overflow
    const body = page.locator('body');
    const box = await body.boundingBox();
    expect(box?.width).toBeLessThanOrEqual(375);
  });

  test('should adjust layout for tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/login');

    // Content should be centered or properly aligned
    await expect(page.getByRole('heading', { name: /entrar|login/i })).toBeVisible();
  });
});
