import { authContext } from '@tests/utils/context'
import {
  fakeUser,
  fakeSchedule,
  fakePatient,
} from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { User, DentistSchedule, Patient } from '@server/entities'
import appointmentRouter from '..'

it('should create an appointment', async () => {
  const db = await createTestDatabase()
  const user = await db.getRepository(User).save(fakeUser({ role: 'dentist' }))
  const schedule = await db
    .getRepository(DentistSchedule)
    .save(fakeSchedule({ userId: user.id }))
  const patient = await db.getRepository(Patient).save(fakePatient())

  const { create } = appointmentRouter.createCaller(authContext({ db }, user))

  const appointmentData = {
    appointmentType: 'Checkup',
    appointmentDay: 'Sunday (21-01)',
    startTime: '10',
    endTime: '18',
    notes: 'checkup',
    email: 'john@doe.com',
    status: 'Active',
    patientData: {
      firstName: patient.firstName,
      lastName: patient.lastName,
      contactNumber: patient.contactNumber,
      email: patient.email,
    },
  }

  const appointmentCreated = await create(appointmentData)

  expect(appointmentCreated).toMatchObject({
    id: expect.any(Number),
    userId: user.id,
    appointmentType: 'Checkup',
    appointmentDay: 'Sunday (21-01)',
    startTime: '10',
    endTime: '18',
    notes: 'checkup',
    email: 'john@doe.com',
    status: 'Active',
    patient: {
      firstName: patient.firstName,
      lastName: patient.lastName,
      contactNumber: patient.contactNumber,
      email: patient.email,
    },
    schedule: {
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      startDate: schedule.startDate,
      endDate: schedule.endDate,
    },
  })
})
