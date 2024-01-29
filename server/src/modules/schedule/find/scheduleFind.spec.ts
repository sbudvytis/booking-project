import { authContext } from '@tests/utils/context'
import { DentistSchedule, User } from '@server/entities'
import { fakeSchedule, fakeUser } from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import router from '..'

it('should return a list of schedules', async () => {
  const db = await createTestDatabase()
  const [user] = await db.getRepository(User).save([fakeUser()])
  const { find } = router.createCaller(authContext({ db }, user))

  await db.getRepository(DentistSchedule).save([
    fakeSchedule({
      scheduleId: 1,
      userId: user.id,
      dayOfWeek: ['Sunday (21-01)'],
      startTime: '10',
      endTime: '18',
      startDate: '2024-01-21',
      endDate: '2024-02-11',
    }),
  ])

  const userSchedules = await find()

  expect(userSchedules).toHaveLength(1)
  expect(userSchedules[0]).toMatchObject({
    scheduleId: expect.any(Number),
    userId: user.id,
    dayOfWeek: ['Sunday (21-01)'],
    startTime: '10',
    endTime: '18',
    startDate: '2024-01-21',
    endDate: '2024-02-11',
  })
})