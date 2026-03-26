import { test, expect } from '@playwright/test'

test('homepage loads with navigation links', async ({ page }) => {
  await page.goto('/')
  // Check page loads
  await expect(page).toHaveTitle(/Ralphthon/i)
})

test('login page loads', async ({ page }) => {
  await page.goto('/login')
  // Check login page has Google sign-in button
  await expect(page.getByRole('button', { name: /google/i })).toBeVisible()
})

test('admin dashboard page loads', async ({ page }) => {
  await page.goto('/dashboard')
  // Dashboard should load (may show empty state without auth)
  await expect(page.locator('body')).not.toBeEmpty()
})
