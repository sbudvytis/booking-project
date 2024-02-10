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
    dayOfWeek: ['Sunday (21-01)'],
    startTime: '11',
    endTime: '14',
    startDate: '2024-01-21',
    endDate: '2024-02-11',
  })

  const result = await remove({
    scheduleId: schedule.scheduleId,
    userId: user.id,
    dayOfWeek: ['Sunday (21-01)'],
    startTime: '11',
    endTime: '14',
    startDate: '2024-01-21',
    endDate: '2024-02-11',
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
    dayOfWeek: ['Sunday (21-01)'],
    startTime: '11',
    endTime: '14',
    startDate: '2024-01-21',
    endDate: '2024-02-11',
  })

  try {
    await remove({
      scheduleId: schedule.scheduleId,
      userId: user.id,
      dayOfWeek: ['Sunday (21-01)'],
      startTime: '11',
      endTime: '14',
      startDate: '2024-01-21',
      endDate: '2024-02-11',
    })
  } catch (error) {
    expect((error as Error).message).toEqual(
      'Permission denied. You do not have the required permissions to delete a schedule.'
    )
  }
})
