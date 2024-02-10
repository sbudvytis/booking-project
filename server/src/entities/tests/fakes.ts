import type { User } from '@server/entities/user'
import type { DentistSchedule } from '@server/entities/dentistSchedule'
import type { Patient } from '@server/entities/patient'
import type { Appointment } from '@server/entities/appointment'
import { random } from '@tests/utils/random'

const randomId = () => random.integer({ min: 1, max: 2147483647 })

/**
 * Generates a fake user with some default test data.
 * @param overrides Any properties that should be different from default fake data.
 */
export const fakeUser = <T extends Partial<User>>(overrides: T = {} as T) => ({
  id: randomId(),
  email: random.email(),
  password: 'Password.123!',
  role: 'dentist',
  permissions: ['VIEW_APPOINTMENTS'],
  isApproved: true,
  ...overrides,
})

/**
 * Generates a fake project with some default test data.
 * @param overrides Any properties that should be different from default fake data.
 */
export const fakeSchedule = <T extends Partial<DentistSchedule>>(
  overrides: T = {} as T
) => ({
  scheduleId: randomId(),
  userId: randomId(),
  dayOfWeek: ['Sunday (21-01)'],
  startTime: '10',
  endTime: '18',
  startDate: '2024-01-21',
  endDate: '2024-02-11',
  ...overrides,
})

/**
 * Generates a fake project with some default test data.
 * @param overrides Any properties that should be different from default fake data.
 */
export const fakePatient = <T extends Partial<Patient>>(
  overrides: T = {} as T
) => ({
  patientId: randomId(),
  firstName: 'John',
  lastName: 'Doe',
  contactNumber: '1234567890',
  email: 'john@doe.com',
  ...overrides,
})

/**
 * Generates a fake project with some default test data.
 * @param overrides Any properties that should be different from default fake data.
 */
export const fakeAppointment = <T extends Partial<Appointment>>(
  overrides: T = {} as T
) => ({
  id: 1,
  userId: randomId(),
  patientId: randomId(),
  scheduleId: 1,
  appointmentType: 'Checkup',
  appointmentDay: 'Sunday (21-01)',
  startTime: '10',
  endTime: '18',
  notes: 'checkup',
  email: 'john@doe.com',
  status: 'Active',
  ...overrides,
})
