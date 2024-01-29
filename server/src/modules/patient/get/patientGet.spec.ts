import { authContext } from '@tests/utils/context'
import { createTestDatabase } from '@tests/utils/database'
import patientRouter from '..'

it('should get a patient by id', async () => {
  const db = await createTestDatabase()
  const { create, get } = patientRouter.createCaller(authContext({ db }))

  const patientCreated = await create({
    firstName: 'John',
    lastName: 'Doe',
    contactNumber: '1234567890',
    email: 'john@doe.com',
  })

  const patientGot = await get(patientCreated.patientId)

  expect(patientGot).toMatchObject({
    patientId: patientCreated.patientId,
    firstName: 'John',
    lastName: 'Doe',
    contactNumber: '1234567890',
    email: 'john@doe.com',
  })
})
