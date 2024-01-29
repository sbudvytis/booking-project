import { authContext } from '@tests/utils/context'
import { fakeUser } from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { User } from '@server/entities'
import scheduleRouter from '..'

it('should get a dentists schedule by id', async () => {
  const db = await createTestDatabase()
  const user = await db.getRepository(User).save(fakeUser({ role: 'dentist' }))
  const { create, get } = scheduleRouter.createCaller(authContext({ db }, user))

  const scheduleCreated = await create({
    dayOfWeek: ['Monday (22-01)'],
    startTime: '10',
    endTime: '13',
    startDate: '2024-01-22',
    endDate: '2024-02-12',
  })

  const scheduleGot = await get(scheduleCreated.scheduleId)

  expect(scheduleGot).toMatchObject({
    scheduleId: scheduleCreated.scheduleId,
    userId: user.id,
    dayOfWeek: ['Monday (22-01)'],
    startTime: '10',
    endTime: '13',
    startDate: '2024-01-22',
    endDate: '2024-02-12',
  })
})
