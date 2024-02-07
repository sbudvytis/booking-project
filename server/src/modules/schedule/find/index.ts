import {
  DentistSchedule,
  type ScheduleBare,
} from '@server/entities/dentistSchedule'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import { z } from 'zod'

const inputSchema = z.object({
  page: z.number().optional(),
  pageSize: z.number().optional(),
  latest: z.boolean().optional(),
})

export default authenticatedProcedure
  .input(inputSchema)
  .query(async ({ input, ctx: { authUser, db } }) => {
    const { page = 0, pageSize = 2, latest = false } = input
    const userId = authUser.id

    const userPermissions = authUser.permissions || []
    const userRole = authUser.role || ''

    const canViewAllSchedules = userPermissions.includes('VIEW_ALL_SCHEDULES')

    let schedules

    if (canViewAllSchedules || userRole === 'dentist') {
      schedules = (await db.getRepository(DentistSchedule).find({
        where: canViewAllSchedules ? {} : { userId },
        order: { scheduleId: 'DESC' },
        skip: latest ? 0 : page * pageSize,
        take: latest ? 1 : pageSize,
      })) as ScheduleBare[]
    } else {
      schedules = (await db.getRepository(DentistSchedule).find({
        where: { userId },
        order: { scheduleId: 'DESC' },
        skip: latest ? 0 : page * pageSize,
        take: latest ? 1 : pageSize,
      })) as ScheduleBare[]
    }

    const total = await db.getRepository(DentistSchedule).count({
      where: canViewAllSchedules ? {} : { userId },
    })

    return { schedules, total }
  })
