import { Appointment, type AppointmentBare } from '@server/entities/appointment'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'

export default authenticatedProcedure.query(
  async ({ ctx: { authUser, db } }) => {
    const userId = authUser.id
    const userPermissions = authUser.permissions || []

    let appointments

    if (userPermissions.includes('VIEW_ALL_SCHEDULES')) {
      appointments = (await db
        .getRepository(Appointment)
        .createQueryBuilder('Appointment')
        .leftJoinAndSelect('Appointment.patient', 'Patient')
        .orderBy('Appointment.id', 'DESC')
        .getMany()) as AppointmentBare[]
    } else {
      appointments = (await db
        .getRepository(Appointment)
        .createQueryBuilder('Appointment')
        .leftJoinAndSelect('Appointment.patient', 'Patient')
        .where('Appointment.userId = :userId', { userId })
        .orderBy('Appointment.id', 'DESC')
        .getMany()) as AppointmentBare[]
    }

    return appointments
  }
)
