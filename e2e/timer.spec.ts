import { expect, test } from '@playwright/test'

test('timer runs to the lobster finish state', async ({ page }) => {
  await page.goto('/timer')

  await expect(page.getByRole('heading', { name: 'RALPHTHON TIMER' })).toBeVisible()
  await expect(page.getByText('Team Attention presented').first()).toBeVisible()
  await expect(page.getByRole('img', { name: 'Ralphthon' })).toBeVisible()
  await expect(page.getByRole('img', { name: 'Toss' })).toBeVisible()

  await page.getByLabel('Timer title').fill('Demo starts')
  await page.getByLabel('Minutes').fill('0')
  await page.getByLabel('Seconds').fill('1')
  await page.getByRole('button', { name: 'RALPH, RUN IT' }).click()

  await expect(page.getByRole('heading', { name: 'Demo starts' })).toBeVisible()
  await expect(page.getByText('00:01')).toBeVisible()
  await expect(page.getByText('LOBSTER ACTIVATED!')).toBeVisible({ timeout: 5000 })
})
