import { authContext } from '@tests/utils/context'
import {
  fakeAppointment,
  fakeSchedule,
  fakeUser,
} from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { User, Appointment, DentistSchedule } from '@server/entities'
import appointmentRouter from '..'

it('should find appointments if user has right permissions or role', async () => {
  const db = await createTestDatabase()
  const user = await db
    .getRepository(User)
    .save(fakeUser({ role: 'dentist', permissions: ['VIEW_ALL_SCHEDULES'] }))
  const { find } = appointmentRouter.createCaller(authContext({ db }, user))

  const [schedule] = await db.getRepository(DentistSchedule).save([
    fakeSchedule({
      scheduleId: 1,
      userId: user.id,
      dayOfWeek: ['Sunday (21-01)'],
      startTime: '10',
      endTime: '18',
      startDate: new Date('2024-01-21'),
      endDate: new Date('2099-02-11'),
    }),
  ])

  await db.getRepository(Appointment).save([
    fakeAppointment({
      schedule,
      userId: user.id,
      appointmentType: 'Checkup',
      appointmentDay: 'Sunday (21-01)',
      startTime: '11',
      endTime: '14',
      status: 'Active',
      email: 'john@doe.com',
      notes: 'regular check-up',
    }),
    fakeAppointment({
      schedule,
      userId: user.id,
      appointmentType: 'Surgery',
      appointmentDay: 'Sunday (28-01)',
      startTime: '15',
      endTime: '16',
      status: 'Active',
      email: 'john@doe.com',
      notes: 'Basic surgery',
    }),
  ])

  const result = await find({ scheduleId: schedule.scheduleId })

  const expectedAppointments = [
    {
      id: 1,
      userId: user.id,
      appointmentType: 'Checkup',
      appointmentDay: 'Sunday (21-01)',
      startTime: '11',
      endTime: '14',
      status: 'Active',
      email: 'john@doe.com',
      notes: 'regular check-up',
    },
    {
      id: 2,
      userId: user.id,
      appointmentType: 'Surgery',
      appointmentDay: 'Sunday (28-01)',
      startTime: '15',
      endTime: '16',
      status: 'Active',
      email: 'john@doe.com',
      notes: 'Basic surgery',
    },
  ]
  expect(result).toHaveLength(2)
  expect(result).toEqual(
    expect.arrayContaining([
      expect.objectContaining(expectedAppointments[0]),
      expect.objectContaining(expectedAppointments[1]),
    ])
  )
})

it('should throw FORBIDDEN error if user does not have right permissions or role', async () => {
  const db = await createTestDatabase()
  const user = await db.getRepository(User).save(fakeUser({ role: 'patient' }))
  const { find } = appointmentRouter.createCaller(authContext({ db }, user))

  const [schedule] = await db.getRepository(DentistSchedule).save([
    fakeSchedule({
      scheduleId: 1,
      userId: user.id,
      dayOfWeek: ['Sunday (21-01)'],
      startTime: '10',
      endTime: '18',
      startDate: new Date('2024-01-21'),
      endDate: new Date('2099-02-11'),
    }),
  ])

  await db.getRepository(Appointment).save([
    fakeAppointment({
      schedule,
      userId: user.id,
      appointmentType: 'Checkup',
      appointmentDay: 'Sunday (21-01)',
      startTime: '11',
      endTime: '14',
      status: 'Active',
      email: 'john@doe.com',
      notes: 'regular check-up',
    }),
    fakeAppointment({
      schedule,
      userId: user.id,
      appointmentType: 'Surgery',
      appointmentDay: 'Sunday (28-01)',
      startTime: '15',
      endTime: '16',
      status: 'Active',
      email: 'john@doe.com',
      notes: 'Basic surgery',
    }),
  ])

  await expect(find({ scheduleId: schedule.scheduleId })).rejects.toThrow(
    'Permission denied. You do not have the required role or permissions to find appointments.'
  )
})
