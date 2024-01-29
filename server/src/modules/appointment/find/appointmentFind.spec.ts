import { authContext } from '@tests/utils/context'
import { Appointment, User } from '@server/entities'
import { fakeAppointment, fakeUser } from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import router from '..'

it('should return a list of appointments', async () => {
  const db = await createTestDatabase()
  const [user] = await db.getRepository(User).save([fakeUser()])
  const { find } = router.createCaller(authContext({ db }, user))

  await db.getRepository(Appointment).save([
    fakeAppointment({
      id: 1,
      userId: user.id,
      patientId: 1,
      scheduleId: 1,
      appointmentType: 'Checkup',
      startTime: '10',
      endTime: '18',
      status: 'Active',
      email: 'john@doe.com',
      notes: 'checkup',
    }),
  ])

  const userAppointments = await find()

  expect(userAppointments).toHaveLength(1)
  expect(userAppointments[0]).toMatchObject({
    userId: user.id,
    appointmentType: 'Checkup',
    startTime: '10',
    endTime: '18',
    status: 'Active',
    email: 'john@doe.com',
    notes: 'checkup',
  })
})
