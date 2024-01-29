import type { ScheduleBare } from '@mono/server/src/shared/entities'

export const isScheduleExpired = (schedule: ScheduleBare) => {
  const lastDayOfSchedule = new Date(schedule.endDate)
  const today = new Date()

  // Checks if the end date is in the past
  if (lastDayOfSchedule.getFullYear() < today.getFullYear()) {
    return true
  }

  // If the years are equal, checks the month
  if (lastDayOfSchedule.getFullYear() === today.getFullYear()) {
    if (lastDayOfSchedule.getMonth() < today.getMonth()) {
      return true
    }

    // If the months are equal, checks the days
    if (lastDayOfSchedule.getMonth() === today.getMonth()) {
      if (lastDayOfSchedule.getDate() < today.getDate()) {
        return true
      }
    }
  }

  return false
}
