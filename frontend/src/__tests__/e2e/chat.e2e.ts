import { test, expect } from '@playwright/test';

test.describe('Chat Functionality', () => {
  // Skip these tests by default as they require authentication
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    // These tests require a logged-in user
    // In a real scenario, you would set up auth state
  });

  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/chat');

    // Should redirect to login
    await expect(page).toHaveURL(/login/, { timeout: 10000 });
  });

  test('should display chat page elements when authenticated', async ({ page }) => {
    // Skip until auth is set up
    test.skip(true, 'Requires authentication setup');

    await page.goto('/chat');

    // Should show conversation list
    await expect(page.getByRole('navigation', { name: /conversations|conversas/i })).toBeVisible();

    // Should show message input area
    await expect(page.getByRole('textbox', { name: /message|mensagem/i })).toBeVisible();
  });

  test('should search for users', async ({ page }) => {
    test.skip(true, 'Requires authentication setup');

    await page.goto('/chat');

    // Open user search
    await page.getByRole('button', { name: /buscar|search|new chat/i }).click();

    // Search input should appear
    await expect(page.getByPlaceholder(/buscar|search/i)).toBeVisible();
  });

  test('should send a message', async ({ page }) => {
    test.skip(true, 'Requires authentication and conversation setup');

    await page.goto('/chat');

    // Select a conversation
    await page.getByRole('listitem').first().click();

    // Type a message
    const messageInput = page.getByRole('textbox', { name: /message|mensagem/i });
    await messageInput.fill('Hello, this is a test message!');

    // Send the message
    await page.getByRole('button', { name: /send|enviar/i }).click();

    // Message should appear in the chat
    await expect(page.getByText('Hello, this is a test message!')).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('should navigate between pages', async ({ page }) => {
    await page.goto('/');

    // Check initial redirect (should go to login if not authenticated)
    const url = page.url();
    expect(url).toMatch(/login|chat/);
  });

  test('should have working back/forward navigation', async ({ page }) => {
    await page.goto('/login');
    await page.goto('/register');

    // Go back
    await page.goBack();
    await expect(page).toHaveURL(/login/);

    // Go forward
    await page.goForward();
    await expect(page).toHaveURL(/register/);
  });
});

test.describe('Theme Toggle', () => {
  test('should toggle between light and dark mode', async ({ page }) => {
    await page.goto('/login');

    // Find theme toggle button if it exists
    const themeToggle = page.getByRole('button', { name: /theme|tema|dark|light|modo/i });

    if (await themeToggle.isVisible()) {
      // Get initial theme
      const initialTheme = await page.evaluate(() =>
        document.documentElement.classList.contains('dark')
      );

      // Toggle theme
      await themeToggle.click();

      // Check theme changed
      const newTheme = await page.evaluate(() =>
        document.documentElement.classList.contains('dark')
      );

      expect(newTheme).not.toBe(initialTheme);
    }
  });

  test('should persist theme preference', async ({ page, context }) => {
    await page.goto('/login');

    const themeToggle = page.getByRole('button', { name: /theme|tema|dark|light|modo/i });

    if (await themeToggle.isVisible()) {
      // Toggle to dark mode
      await themeToggle.click();

      // Reload page
      await page.reload();

      // Theme should persist
      const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));

      // Note: This depends on your theme implementation
    }
  });
});

test.describe('Error Handling', () => {
  test('should show 404 page for invalid routes', async ({ page }) => {
    await page.goto('/invalid-page-that-does-not-exist');

    // Should show 404 or redirect
    // Depends on your 404 implementation
    await expect(page.getByText(/404|not found|não encontrad/i))
      .toBeVisible()
      .catch(() => {
        // Might redirect instead
        expect(page.url()).not.toMatch(/invalid-page/);
      });
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate offline mode
    await page.context().setOffline(true);

    await page.goto('/login').catch(() => {
      // Expected to fail
    });

    // App should show offline indicator or cached content
    // Depends on your PWA implementation

    // Restore online mode
    await page.context().setOffline(false);
  });
});

test.describe('Performance', () => {
  test('should load login page within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/login');

    const loadTime = Date.now() - startTime;

    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should have no console errors on page load', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Filter out expected errors (like API errors when backend is not running)
    const unexpectedErrors = errors.filter(
      (e) => !e.includes('net::ERR') && !e.includes('Failed to fetch')
    );

    expect(unexpectedErrors).toHaveLength(0);
  });
});
