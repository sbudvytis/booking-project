import { Appointment, appointmentSchema } from '@server/entities/appointment'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import { TRPCError } from '@trpc/server'

export default authenticatedProcedure
  .input(appointmentSchema)
  .mutation(
    async ({ input: updatedAppointmentData, ctx: { authUser, db } }) => {
      // Check if the authenticated user has the required role and permissions
      const userPermissions = authUser.permissions || []
      const userRole = authUser.role || ''

      // Check if the user has the required permission to add an appointment
      const canCreateAppointment =
        userRole === 'dentist' || userPermissions.includes('VIEW_ALL_SCHEDULES')

      if (!authUser || !canCreateAppointment) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message:
            'Permission denied. You do not have the required role or permissions to edit an appointment.',
        })
      }

      // Fetch the existing appointment from the database
      const existingAppointment = await db.getRepository(Appointment).findOne({
        where: { id: updatedAppointmentData.id },
      })

      if (!existingAppointment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Appointment not found.',
        })
      }

      // Check if the authenticated user has the right to edit this appointment
      if (existingAppointment.userId !== authUser.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have the right to edit this appointment.',
        })
      }

      // Update the existing appointment with the new data
      const updatedAppointment = db
        .getRepository(Appointment)
        .merge(existingAppointment, updatedAppointmentData)

      // Save the updated appointment to the database
      const appointmentEdited = await db
        .getRepository(Appointment)
        .save(updatedAppointment)

      return appointmentEdited
    }
  )
