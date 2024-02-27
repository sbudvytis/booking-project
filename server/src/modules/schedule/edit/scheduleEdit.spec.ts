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
    startTime: '10',
    endTime: '13',
    startDate: new Date('2024-01-21'),
    endDate: new Date('2099-02-11'),
  })

  const scheduleEdited = await edit({
    scheduleId: scheduleCreated.scheduleId,
    userId: user.id,
    startTime: '12',
    endTime: '15',
    startDate: new Date('2024-01-21'),
    endDate: new Date('2099-02-11'),
  })

  expect(scheduleEdited).toMatchObject({
    scheduleId: scheduleCreated.scheduleId,
    userId: user.id,
    startTime: '12',
    endTime: '15',
    startDate: new Date('2024-01-21'),
    endDate: new Date('2099-02-11'),
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
    startTime: '10',
    endTime: '13',
    startDate: new Date('2024-01-21'),
    endDate: new Date('2099-02-11'),
  })

  const { edit: editSchedule } = scheduleRouter.createCaller(
    authContext({ db }, staffUser)
  )

  try {
    await editSchedule({
      scheduleId: scheduleCreated.scheduleId,
      userId: staffUser.id,
      startTime: '12',
      endTime: '15',
      startDate: new Date('2024-01-21'),
      endDate: new Date('2099-02-11'),
    })
  } catch (error) {
    expect((error as Error).message).toEqual(
      'Permission denied. You do not have the required permissions to edit a schedule.'
    )
  }
})
