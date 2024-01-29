import {
  DentistSchedule,
  scheduleSchema,
} from '@server/entities/dentistSchedule'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import { TRPCError } from '@trpc/server'

export default authenticatedProcedure
  .input(scheduleSchema)
  .mutation(async ({ input: updatedScheduleData, ctx: { authUser, db } }) => {
    // Check if the authenticated user has the required role and permissions
    if (!authUser || authUser.role !== 'dentist') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message:
          'Permission denied. You do not have the required role or permissions to edit an schedule.',
      })
    }

    // Fetch the existing schedule from the database
    const existingSchedule = await db.getRepository(DentistSchedule).findOne({
      where: { scheduleId: updatedScheduleData.scheduleId },
    })

    if (!existingSchedule) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'schedule not found.',
      })
    }

    // Check if the authenticated user has the right to edit this schedule
    if (existingSchedule.userId !== authUser.id) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have the right to edit this schedule.',
      })
    }

    // Update the existing schedule with the new data
    const updatedSchedule = db
      .getRepository(DentistSchedule)
      .merge(existingSchedule, updatedScheduleData)

    // Save the updated schedule to the database
    const scheduleEdited = await db
      .getRepository(DentistSchedule)
      .save(updatedSchedule)

    return scheduleEdited
  })
