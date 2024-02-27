import { authContext } from '@tests/utils/context'
import {
  fakeUser,
  fakePatient,
  fakeSchedule,
} from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { User, Patient, DentistSchedule } from '@server/entities'
import appointmentRouter from '..'

it('should edit a dentists appointment', async () => {
  const db = await createTestDatabase()
  const user = await db.getRepository(User).save(fakeUser({ role: 'dentist' }))
  const schedule = await db
    .getRepository(DentistSchedule)
    .save(fakeSchedule({ userId: user.id }))
  const patient = await db.getRepository(Patient).save(fakePatient())
  const { create, edit } = appointmentRouter.createCaller(
    authContext({ db }, user)
  )

  const appointmentData = {
    appointmentType: 'Checkup',
    appointmentDay: 'Sunday (21-01)',
    startTime: '10',
    endTime: '18',
    notes: 'checkup',
    email: 'john@doe.com',
    status: 'Active',
    scheduleId: schedule.scheduleId,
    patientData: {
      firstName: patient.firstName,
      lastName: patient.lastName,
      contactNumber: patient.contactNumber,
      email: patient.email,
    },
    schedule: {
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      startDate: schedule.startDate,
      endDate: schedule.endDate,
    },
  }

  const appointmentCreated = await create(appointmentData)

  const editedAppointmentData = {
    id: appointmentCreated.id,
    userId: user.id,
    appointmentType: 'Surgery',
    appointmentDay: 'Sunday (21-01)',
    startTime: '11',
    endTime: '19',
    notes: 'checkup',
    email: 'john@doe.com',
    status: 'Active',
  }

  const editedAppointment = await edit(editedAppointmentData)

  expect(editedAppointment).toMatchObject({
    id: appointmentCreated.id,
    userId: user.id,
    appointmentType: 'Surgery',
    appointmentDay: 'Sunday (21-01)',
    startTime: '11',
    endTime: '19',
    notes: 'checkup',
    email: 'john@doe.com',
    status: 'Active',
  })
})

it('should not allow to edit if appointment not found', async () => {
  const db = await createTestDatabase()
  const user = await db.getRepository(User).save(fakeUser({ role: 'dentist' }))
  const { edit } = appointmentRouter.createCaller(authContext({ db }, user))

  const editedAppointmentData = {
    id: 1,
    userId: user.id,
    appointmentType: 'Surgery',
    appointmentDay: 'Sunday (21-01)',
    startTime: '11',
    endTime: '19',
    notes: 'checkup',
    email: 'john@doe.com',
    status: 'Active',
  }

  await expect(edit(editedAppointmentData)).rejects.toThrow(
    'Appointment not found.'
  )
})

it('should not allow to edit if user does not required role or permissions', async () => {
  const db = await createTestDatabase()
  const user = await db.getRepository(User).save(fakeUser({ role: 'patient' }))
  const { edit } = appointmentRouter.createCaller(authContext({ db }, user))

  const editedAppointmentData = {
    id: 1,
    userId: user.id,
    appointmentType: 'Surgery',
    appointmentDay: 'Sunday (21-01)',
    startTime: '11',
    endTime: '19',
    notes: 'checkup',
    email: 'john@doe.com',
    status: 'Active',
  }

  await expect(edit(editedAppointmentData)).rejects.toThrow(
    'Permission denied. You do not have the required role or permissions to edit an appointment.'
  )
})
