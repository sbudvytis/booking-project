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
    startTime: '10',
    endTime: '13',
    startDate: new Date('2024-01-21'),
    endDate: new Date('2099-02-11'),
  })

  const scheduleGot = await get(scheduleCreated.scheduleId)

  expect(scheduleGot).toMatchObject({
    scheduleId: scheduleCreated.scheduleId,
    userId: user.id,
    startTime: '10',
    endTime: '13',
    startDate: new Date('2024-01-21'),
    endDate: new Date('2099-02-11'),
  })
})

it('should throw an error when schedule is not found', async () => {
  const db = await createTestDatabase()
  const user = await db.getRepository(User).save(fakeUser({ role: 'dentist' }))
  const { get } = scheduleRouter.createCaller(authContext({ db }, user))

  try {
    await get(999)
  } catch (error) {
    expect(error).toMatchObject({
      code: 'NOT_FOUND',
      message: 'Schedule was not found',
    })
  }
})
