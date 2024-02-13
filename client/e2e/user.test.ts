import { test, expect } from '@playwright/test'
import { fakeUser } from 'utils/fakeData'

const { email, password, firstName, lastName, role } = fakeUser()

test.describe.serial('signup and login sequence', () => {
  test('visitor can signup', async ({ page }) => {
    // Given (ARRANGE)
    await page.goto('/signup')
    const successMessage = page.getByTestId('successMessage')
    await expect(successMessage).toBeHidden() // sanity check

    // When (ACT)
    const form = page.getByRole('form', { name: 'Signup' })

    await form.locator('input#firstName').fill(firstName)
    await form.locator('input#lastName').fill(lastName)
    await form.locator('input[type="email"]').fill(email)
    await form.locator('input[type="password"]').fill(password)
    await form.locator('select').selectOption(role)
    await form.locator('button[type="submit"]').click()

    // Then (ASSERT)
    await expect(successMessage).toBeVisible()
  })

  test('visitor can not access dashboard before login', async ({ page }) => {
    await page.goto('/dashboard')

    // user is redirected to login page
    await page.waitForURL('/login')
  })

  test('visitor should see Your account is pending approval', async ({ page }) => {
    // Given (ARRANGE)
    await page.goto('/login')
    const errorMessage = page.getByTestId('errorMessage')
    const dashboardLink = page.getByRole('link', { name: 'Dashboard' })
    await expect(dashboardLink).toBeHidden()

    // When (ACT)
    const form = page.getByRole('form', { name: 'Login' })
    await form.locator('input[type="email"]').fill(email)
    await form.locator('input[type="password"]').fill(password)
    await form.locator('button[type="submit"]').click()

    // Then (ASSERT)
    await expect(errorMessage).toBeVisible()
  })
})
