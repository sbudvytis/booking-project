import { authContext } from '@tests/utils/context'
import { fakeUser } from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { User, DentistSchedule } from '@server/entities'
import scheduleRouter from '..'

it('should remove a dentists schedule', async () => {
  const db = await createTestDatabase()
  const user = await db.getRepository(User).save(fakeUser({ role: 'dentist' }))
  const { remove } = scheduleRouter.createCaller(authContext({ db }, user))

  const schedule = await db.getRepository(DentistSchedule).save({
    userId: user.id,
    startTime: '11',
    endTime: '14',
    startDate: new Date('2024-01-21'),
    endDate: new Date('2099-02-11'),
  })

  const result = await remove({
    scheduleId: schedule.scheduleId,
    userId: user.id,
    startTime: '11',
    endTime: '14',
    startDate: new Date('2024-01-21'),
    endDate: new Date('2099-02-11'),
  })

  expect(result).toEqual({
    success: true,
    message: 'Schedule deleted successfully',
  })
  expect(
    await db
      .getRepository(DentistSchedule)
      .findOne({ where: { scheduleId: schedule.scheduleId } })
  )
})

it('should throw an error when staff tries to delete a schedule', async () => {
  const db = await createTestDatabase()
  const user = await db.getRepository(User).save(fakeUser({ role: 'staff' }))
  const { remove } = scheduleRouter.createCaller(authContext({ db }, user))

  const schedule = await db.getRepository(DentistSchedule).save({
    userId: user.id,
    startTime: '11',
    endTime: '14',
    startDate: new Date('2024-01-21'),
    endDate: new Date('2099-02-11'),
  })

  try {
    await remove({
      scheduleId: schedule.scheduleId,
      userId: user.id,
      startTime: '11',
      endTime: '14',
      startDate: new Date('2024-01-21'),
      endDate: new Date('2099-02-11'),
    })
  } catch (error) {
    expect((error as Error).message).toEqual(
      'Permission denied. You do not have the required permissions to delete a schedule.'
    )
  }
})

it('should throw an error when the schedule does not exist', async () => {
  const db = await createTestDatabase()
  const user = await db.getRepository(User).save(fakeUser({ role: 'dentist' }))
  const { remove } = scheduleRouter.createCaller(authContext({ db }, user))

  try {
    await remove({
      scheduleId: 999,
      userId: user.id,
      startTime: '11',
      endTime: '14',
      startDate: new Date('2024-01-21'),
      endDate: new Date('2099-02-11'),
    })
  } catch (error) {
    expect((error as Error).message).toEqual('Schedule not found.')
  }
})

it('should throw an error when the user does not have the right to delete the schedule', async () => {
  const db = await createTestDatabase()
  const user = await db.getRepository(User).save(fakeUser({ role: 'dentist' }))
  const user2 = await db.getRepository(User).save(fakeUser({ role: 'dentist' }))
  const { remove } = scheduleRouter.createCaller(authContext({ db }, user))

  const schedule = await db.getRepository(DentistSchedule).save({
    userId: user2.id,
    startTime: '11',
    endTime: '14',
    startDate: new Date('2024-01-21'),
    endDate: new Date('2099-02-11'),
  })

  try {
    await remove({
      scheduleId: schedule.scheduleId,
      userId: user.id,
      startTime: '11',
      endTime: '14',
      startDate: new Date('2024-01-21'),
      endDate: new Date('2099-02-11'),
    })
  } catch (error) {
    expect((error as Error).message).toEqual(
      'You do not have the right to delete this schedule.'
    )
  }
})
