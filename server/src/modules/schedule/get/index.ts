import {
  DentistSchedule,
  scheduleSchema,
  type ScheduleBare,
} from '@server/entities/dentistSchedule'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import { TRPCError } from '@trpc/server'

export default authenticatedProcedure
  .input(scheduleSchema.shape.scheduleId)
  .query(async ({ input: schId, ctx: { authUser, db } }) => {
    const schedule = (await db.getRepository(DentistSchedule).findOne({
      where: { scheduleId: schId },
    })) as ScheduleBare

    if (!schedule) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `Schedule was not found`,
      })
    }

    if (schedule.userId !== authUser.id) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `You are not allowed to access this schedule.`,
      })
    }

    return schedule
  })
