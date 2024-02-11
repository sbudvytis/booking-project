import { Chance } from 'chance'

export const random = process.env.CI ? Chance(1) : Chance()

export const fakeUser = () => ({
  firstName: random.first(),
  lastName: random.last(),
  email: random.email(),
  password: 'password.123',
  role: 'dentist',
  permissions: ['VIEW_APPOINTMENTS', 'MANAGE_APPOINTMENTS', 'VIEW_SCHEDULE', 'MANAGE_SCHEDULE'],
  isApproved: true,
})
