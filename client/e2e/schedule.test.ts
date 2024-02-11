import { test } from '@playwright/test'

test.describe.serial('Login, manage schedule and appointment sequence', () => {
  test('Login and create a schedule', async ({ page }) => {
    await page.goto('/login')
    await page.locator('input[type="email"]').click()
    await page.locator('input[type="email"]').fill('dentist@fake.com')
    await page.locator('input[type="email"]').press('Tab')
    await page.locator('input[name="password"]').fill('12345678')
    await page.getByRole('button', { name: 'Log in' }).click()
    await page.getByTestId('createSchedule').click()
    await page.getByRole('textbox', { name: 'Start Date' }).fill('2024-02-11')
    await page.getByRole('textbox', { name: 'End Date' }).fill('2024-02-18')
    await page.getByRole('textbox', { name: 'Start Time' }).click()
    await page.getByRole('textbox', { name: 'Start Time' }).fill('11')
    await page.getByRole('textbox', { name: 'End Time' }).click()
    await page.getByRole('textbox', { name: 'End Time' }).fill('15')
    await page.getByRole('button', { name: 'Create Schedule' }).click()
    await page.goto('/dashboard')
  })

  test('Add an appointment', async ({ page }) => {
    await page.goto('/login')
    await page.locator('input[type="email"]').click()
    await page.locator('input[type="email"]').fill('dentist@fake.com')
    await page.locator('input[type="email"]').press('Tab')
    await page.locator('input[name="password"]').fill('12345678')
    await page.getByRole('button', { name: 'Log in' }).click()
    await page.getByTestId('createAppointment').click()
    await page
      .getByLabel(
        'Select DayPlease select oneSunday (11-02)Monday (12-02)Tuesday (13-02)Wednesday (14-02)Thursday (15-02)Friday (16-02)Saturday (17-02)Sunday (18-02)'
      )
      .selectOption('Sunday (11-02)')
    await page
      .locator('div')
      .filter({ hasText: /^Appointment Type$/ })
      .locator('#appointmentType')
      .click()
    await page
      .locator('div')
      .filter({ hasText: /^Appointment Type$/ })
      .locator('#appointmentType')
      .fill('Surgery')
    await page
      .getByLabel('Select Start TimePlease select one11:0011:3012:0012:3013:0013:3014:0014:3015:00')
      .selectOption('11:00')
    await page
      .getByLabel('Select End TimePlease select one11:3012:0012:3013:0013:3014:0014:3015:00')
      .selectOption('13:00')
    await page
      .locator('div')
      .filter({ hasText: /^First Name$/ })
      .locator('#firstName')
      .click()
    await page
      .locator('div')
      .filter({ hasText: /^First Name$/ })
      .locator('#firstName')
      .fill('John')
    await page
      .locator('div')
      .filter({ hasText: /^First Name$/ })
      .locator('#firstName')
      .press('Tab')
    await page
      .locator('div')
      .filter({ hasText: /^Last Name$/ })
      .locator('#lastName')
      .fill('Doe')
    await page
      .locator('div')
      .filter({ hasText: /^Email$/ })
      .locator('#email')
      .click()
    await page
      .locator('div')
      .filter({ hasText: /^Email$/ })
      .locator('#email')
      .fill('dentist@fake.com')
    await page
      .locator('div')
      .filter({ hasText: /^Email$/ })
      .locator('#email')
      .press('Tab')
    await page
      .locator('div')
      .filter({ hasText: /^Phone Number$/ })
      .locator('#contactNumber')
      .fill('12345678')
    await page.getByPlaceholder('Write your message here...').fill('Additional note')
    await page.getByRole('button', { name: 'Add Appointment' }).click()
  })

  test('Manage appointment', async ({ page }) => {
    await page.goto('/login')
    await page.locator('input[type="email"]').click()
    await page.locator('input[type="email"]').fill('dentist@fake.com')
    await page.locator('input[type="email"]').press('Tab')
    await page.locator('input[name="password"]').fill('12345678')
    await page.getByRole('button', { name: 'Log in' }).click()
    await page.getByTestId('scheduleList').getByRole('link', { name: 'Edit' }).click()
    await page.getByLabel('Completed:').check()
    await page.getByRole('button', { name: 'Edit Appointment' }).click()
    await page.getByTestId('scheduleList').getByRole('link', { name: 'Edit' }).click()
    await page.getByRole('button', { name: 'Delete Appointment' }).click()
  })

  test('Delete schedule', async ({ page }) => {
    await page.goto('/login')
    await page.locator('input[type="email"]').click()
    await page.locator('input[type="email"]').fill('dentist@fake.com')
    await page.locator('input[type="email"]').press('Tab')
    await page.locator('input[name="password"]').fill('12345678')
    await page.getByRole('button', { name: 'Log in' }).click()
    await page.getByTestId('editSchedule').click()
    await page.getByRole('button', { name: 'Delete Schedule' }).click()
    await page.getByRole('link', { name: 'Logout' }).click()
  })
})
