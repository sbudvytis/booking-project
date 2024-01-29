import {
  DentistSchedule,
  type ScheduleBare,
} from '@server/entities/dentistSchedule'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'

export default authenticatedProcedure.query(
  async ({ ctx: { authUser, db } }) => {
    // Check if the authenticated user is available

    const userId = authUser.id

    const userPermissions = authUser.permissions || []
    const userRole = authUser.role || ''

    // Check if the user has the required permission to view all schedules
    const canViewAllSchedules = userPermissions.includes('VIEW_ALL_SCHEDULES')

    let schedules

    if (canViewAllSchedules) {
      // If the user has the permission to view all schedules, retrieve all schedules
      schedules = (await db.getRepository(DentistSchedule).find({
        order: { scheduleId: 'DESC' },
      })) as ScheduleBare[]
    } else if (userRole === 'dentist') {
      // If the user is a dentist, retrieve only their own schedule
      schedules = (await db.getRepository(DentistSchedule).find({
        where: { userId },
        order: { scheduleId: 'DESC' },
      })) as ScheduleBare[]
    } else {
      // If the user doesn't have the permission to view all schedules, restrict to their own schedules
      schedules = (await db.getRepository(DentistSchedule).find({
        where: { userId },
        order: { scheduleId: 'DESC' },
      })) as ScheduleBare[]
    }

    return schedules
  }
)
