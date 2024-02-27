import { authContext } from '@tests/utils/context'
import {
  fakeUser,
  fakeSchedule,
  fakePatient,
} from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { User, DentistSchedule, Patient } from '@server/entities'
import { TRPCError } from '@trpc/server'
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
    scheduleId: schedule.scheduleId,
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
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      startDate: schedule.startDate,
      endDate: schedule.endDate,
    },
  })
})

it('should not create a new patient if the patient already exists', async () => {
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
    email: patient.email,
    status: 'Active',
    scheduleId: schedule.scheduleId,
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
    email: patient.email,
    status: 'Active',
    patient: {
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
  })

  const patients = await db.getRepository(Patient).find()
  expect(patients.length).toBe(1)
})

it('should throw an error when unauthorized person creates appointment', async () => {
  const db = await createTestDatabase()
  const user = await db.getRepository(User).save(fakeUser({ role: 'staff' }))
  const patient = await db.getRepository(Patient).save(fakePatient())
  const { create } = appointmentRouter.createCaller(authContext({ db }, user))

  try {
    await create({
      appointmentType: 'Checkup',
      appointmentDay: 'Sunday (21-01)',
      startTime: '10',
      endTime: '18',
      notes: 'checkup',
      email: 'john@doe.com',
      status: 'Active',
      scheduleId: 1,
      patientData: {
        firstName: patient.firstName,
        lastName: patient.lastName,
        contactNumber: patient.contactNumber,
        email: patient.email,
      },
    })
  } catch (error) {
    expect((error as Error).message).toEqual(
      'Permission denied. You do not have the required role or permissions to add an appointment.'
    )
  }
})

it('should throw an error when patient data is not provided', async () => {
  const db = await createTestDatabase()
  const user = await db.getRepository(User).save(fakeUser({ role: 'dentist' }))
  const { create } = appointmentRouter.createCaller(authContext({ db }, user))

  try {
    await create({
      appointmentType: 'Checkup',
      appointmentDay: 'Sunday (21-01)',
      startTime: '10',
      endTime: '18',
      notes: 'checkup',
      email: 'john@doe.com',
      status: 'Active',
      scheduleId: 1,
      patientData: {
        firstName: '',
        lastName: '',
        contactNumber: '',
        email: '',
      },
    })
  } catch (error) {
    expect((error as TRPCError).code).toEqual('BAD_REQUEST')
  }
})

it('should throw an error when dentist schedule is not found', async () => {
  const db = await createTestDatabase()
  const user = await db.getRepository(User).save(fakeUser({ role: 'dentist' }))
  const patient = await db.getRepository(Patient).save(fakePatient())
  const { create } = appointmentRouter.createCaller(authContext({ db }, user))

  try {
    await create({
      appointmentType: 'Checkup',
      appointmentDay: 'Sunday (21-01)',
      startTime: '10',
      endTime: '18',
      notes: 'checkup',
      email: 'john@doe.com',
      status: 'Active',
      scheduleId: 1,
      patientData: {
        firstName: patient.firstName,
        lastName: patient.lastName,
        contactNumber: patient.contactNumber,
        email: patient.email,
      },
    })
  } catch (error) {
    expect((error as TRPCError).code).toEqual('NOT_FOUND')
  }
})
