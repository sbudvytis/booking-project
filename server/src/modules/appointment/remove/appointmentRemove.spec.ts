import { authContext } from '@tests/utils/context'
import { fakeUser } from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { User, Appointment } from '@server/entities'
import appointmentRouter from '..'

it('should remove an appointment', async () => {
  const db = await createTestDatabase()
  const user = await db.getRepository(User).save(fakeUser({ role: 'dentist' }))
  const { remove } = appointmentRouter.createCaller(authContext({ db }, user))

  const appointment = await db.getRepository(Appointment).save({
    userId: user.id,
    appointmentType: 'Checkup',
    appointmentDay: 'Sunday (21-01)',
    startTime: '11',
    endTime: '14',
    status: 'Active',
    email: 'john@doe.com',
    notes: 'regular check-up',
  })

  const result = await remove({
    id: appointment.id,
    userId: user.id,
    appointmentType: 'Checkup',
    appointmentDay: 'Sunday (21-01)',
    startTime: '11',
    endTime: '14',
    status: 'Active',
    email: 'john@doe.com',
    notes: 'regular check-up',
  })

  expect(result).toEqual({
    success: true,
    message: 'Appointment deleted successfully',
  })
  expect(
    await db
      .getRepository(Appointment)
      .findOne({ where: { id: appointment.id } })
  )
})

it('should remove an appointment with permission VIEW_ALL_SCHEDULES', async () => {
  const db = await createTestDatabase()
  const user = await db
    .getRepository(User)
    .save(fakeUser({ role: 'staff', permissions: ['VIEW_ALL_SCHEDULES'] }))
  const { remove } = appointmentRouter.createCaller(authContext({ db }, user))

  const appointment = await db.getRepository(Appointment).save({
    userId: user.id,
    appointmentType: 'Checkup',
    appointmentDay: 'Sunday (21-01)',
    startTime: '11',
    endTime: '14',
    status: 'Active',
    email: 'john@doe.com',
    notes: 'regular check-up',
  })

  const result = await remove({
    id: appointment.id,
    userId: user.id,
    appointmentType: 'Checkup',
    appointmentDay: 'Sunday (21-01)',
    startTime: '11',
    endTime: '14',
    status: 'Active',
    email: 'john@doe.com',
    notes: 'regular check-up',
  })

  expect(result).toEqual({
    success: true,
    message: 'Appointment deleted successfully',
  })
  expect(
    await db
      .getRepository(Appointment)
      .findOne({ where: { id: appointment.id } })
  )
})

it('should not allow to remove if appointment not found', async () => {
  const db = await createTestDatabase()
  const user = await db.getRepository(User).save(fakeUser({ role: 'dentist' }))
  const { remove } = appointmentRouter.createCaller(authContext({ db }, user))

  const appointment = await db.getRepository(Appointment).save({
    userId: user.id,
    appointmentType: 'Checkup',
    appointmentDay: 'Sunday (21-01)',
    startTime: '11',
    endTime: '14',
    status: 'Active',
    email: 'john@doe.com',
    notes: 'regular check-up',
  })

  await expect(
    remove({
      id: appointment.id + 1,
      userId: user.id,
      appointmentType: 'Checkup',
      appointmentDay: 'Sunday (21-01)',
      startTime: '11',
      endTime: '14',
      status: 'Active',
      email: 'john@doe.com',
      notes: 'regular check-up',
    })
  ).rejects.toThrow('Appointment not found.')
})

it('should not allow to remove if user does not required role or permissions', async () => {
  const db = await createTestDatabase()
  const user = await db.getRepository(User).save(fakeUser({ role: 'patient' }))
  const { remove } = appointmentRouter.createCaller(authContext({ db }, user))

  const appointment = await db.getRepository(Appointment).save({
    userId: user.id,
    appointmentType: 'Checkup',
    appointmentDay: 'Sunday (21-01)',
    startTime: '11',
    endTime: '14',
    status: 'Active',
    email: 'john@doe.com',
    notes: 'regular check-up',
  })

  await expect(
    remove({
      id: appointment.id,
      userId: user.id,
      appointmentType: 'Checkup',
      appointmentDay: 'Sunday (21-01)',
      startTime: '11',
      endTime: '14',
      status: 'Active',
      email: 'john@doe.com',
      notes: 'regular check-up',
    })
  ).rejects.toThrow(
    'Permission denied. You do not have the required role or permissions to delete an appointment.'
  )
})

it('should not allow to remove if user does not have the right to delete this appointment', async () => {
  const db = await createTestDatabase()
  const user1 = await db.getRepository(User).save(fakeUser({ role: 'dentist' }))
  const user2 = await db.getRepository(User).save(fakeUser({ role: 'dentist' }))

  const { remove } = appointmentRouter.createCaller(authContext({ db }, user2))

  const appointment = await db.getRepository(Appointment).save({
    userId: user1.id,
    appointmentType: 'Checkup',
    appointmentDay: 'Sunday (21-01)',
    startTime: '11',
    endTime: '14',
    status: 'Active',
    email: 'john@doe.com',
    notes: 'regular check-up',
  })

  await expect(
    remove({
      id: appointment.id,
      userId: user1.id,
      appointmentType: 'Checkup',
      appointmentDay: 'Sunday (21-01)',
      startTime: '11',
      endTime: '14',
      status: 'Active',
      email: 'john@doe.com',
      notes: 'regular check-up',
    })
  ).rejects.toThrow('You do not have the right to delete this appointment.')
})
