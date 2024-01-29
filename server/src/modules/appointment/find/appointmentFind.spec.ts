import { authContext } from '@tests/utils/context'
import { Appointment, User } from '@server/entities'
import { fakeAppointment, fakeUser } from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import router from '..'

it('should return a list of all appointments if user has VIEW_ALL_SCHEDULES permission', async () => {
  const db = await createTestDatabase()
  const user1 = await db.getRepository(User).save(fakeUser({ role: 'dentist' }))
  const user2 = await db
    .getRepository(User)
    .save(fakeUser({ role: 'dentist', permissions: ['VIEW_ALL_SCHEDULES'] }))

  const { find } = router.createCaller(authContext({ db }, user2))

  await db.getRepository(Appointment).save([
    fakeAppointment({
      id: 1,
      userId: user1.id,
      patientId: 1,
      scheduleId: 1,
      appointmentType: 'Checkup',
      startTime: '10',
      endTime: '18',
      status: 'Active',
      email: 'john@doe.com',
      notes: 'checkup',
    }),
    fakeAppointment({
      id: 2,
      userId: user2.id,
      patientId: 2,
      scheduleId: 2,
      appointmentType: 'Surgery',
      startTime: '11',
      endTime: '19',
      status: 'Active',
      email: 'jane@doe.com',
      notes: 'surgery',
    }),
  ])

  const userAppointments = await find()

  expect(userAppointments).toHaveLength(2)
  expect(userAppointments).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        userId: user1.id,
        appointmentType: 'Checkup',
        startTime: '10',
        endTime: '18',
        status: 'Active',
        email: 'john@doe.com',
        notes: 'checkup',
      }),
      expect.objectContaining({
        userId: user2.id,
        appointmentType: 'Surgery',
        startTime: '11',
        endTime: '19',
        status: 'Active',
        email: 'jane@doe.com',
        notes: 'surgery',
      }),
    ])
  )
})

it('should return only the appointments of the authenticated user if user does not have VIEW_ALL_SCHEDULES permission', async () => {
  const db = await createTestDatabase()
  const user1 = await db.getRepository(User).save(fakeUser({ role: 'dentist' }))
  const user2 = await db.getRepository(User).save(fakeUser({ role: 'dentist' }))

  const { find } = router.createCaller(authContext({ db }, user1))

  await db.getRepository(Appointment).save([
    fakeAppointment({
      id: 1,
      userId: user1.id,
      patientId: 1,
      scheduleId: 1,
      appointmentType: 'Checkup',
      startTime: '10',
      endTime: '18',
      status: 'Active',
      email: 'john@doe.com',
      notes: 'checkup',
    }),
    fakeAppointment({
      id: 2,
      userId: user2.id,
      patientId: 2,
      scheduleId: 2,
      appointmentType: 'Surgery',
      startTime: '11',
      endTime: '19',
      status: 'Active',
      email: 'jane@doe.com',
      notes: 'surgery',
    }),
  ])

  const userAppointments = await find()

  expect(userAppointments).toHaveLength(1)
  expect(userAppointments).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        userId: user1.id,
        appointmentType: 'Checkup',
        startTime: '10',
        endTime: '18',
        status: 'Active',
        email: 'john@doe.com',
        notes: 'checkup',
      }),
    ])
  )
})
