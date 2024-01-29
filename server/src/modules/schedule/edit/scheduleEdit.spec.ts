import { authContext } from '@tests/utils/context'
import { fakeUser } from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { User } from '@server/entities'
import scheduleRouter from '..'

it('should edit a dentists schedule', async () => {
  const db = await createTestDatabase()
  const user = await db.getRepository(User).save(fakeUser({ role: 'dentist' }))
  const { create, edit } = scheduleRouter.createCaller(
    authContext({ db }, user)
  )

  const scheduleCreated = await create({
    dayOfWeek: ['Monday (22-01)'],
    startTime: '10',
    endTime: '13',
    startDate: '2024-01-22',
    endDate: '2024-02-12',
  })

  const scheduleEdited = await edit({
    scheduleId: scheduleCreated.scheduleId,
    userId: user.id,
    dayOfWeek: ['Tuesday (23-01)'],
    startTime: '12',
    endTime: '15',
    startDate: '2024-01-23',
    endDate: '2024-02-13',
  })

  expect(scheduleEdited).toMatchObject({
    scheduleId: scheduleCreated.scheduleId,
    userId: user.id,
    dayOfWeek: ['Tuesday (23-01)'],
    startTime: '12',
    endTime: '15',
    startDate: '2024-01-23',
    endDate: '2024-02-13',
  })
})

it("should deny a staff member from editing a dentist's schedule", async () => {
  const db = await createTestDatabase()
  const dentistUser = await db
    .getRepository(User)
    .save(fakeUser({ role: 'dentist' }))
  const staffUser = await db
    .getRepository(User)
    .save(fakeUser({ role: 'staff' }))
  const { create } = scheduleRouter.createCaller(
    authContext({ db }, dentistUser)
  )

  const scheduleCreated = await create({
    dayOfWeek: ['Monday (22-01)'],
    startTime: '10',
    endTime: '13',
    startDate: '2024-01-22',
    endDate: '2024-02-12',
  })

  const { edit: editSchedule } = scheduleRouter.createCaller(
    authContext({ db }, staffUser)
  )

  try {
    await editSchedule({
      scheduleId: scheduleCreated.scheduleId,
      userId: staffUser.id,
      dayOfWeek: ['Tuesday (23-01)'],
      startTime: '12',
      endTime: '15',
      startDate: '2024-01-23',
      endDate: '2024-02-13',
    })
  } catch (error) {
    expect((error as Error).message).toEqual(
      'Permission denied. You do not have the required role or permissions to edit an schedule.'
    )
  }
})
