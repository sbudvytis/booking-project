import { type Ref } from 'vue'
import type { AppointmentBare } from '@mono/server/src/shared/entities'

export function filterBookedTimes(
  appointments: Ref<AppointmentBare[]>,
  appointmentForm: Ref<any>,
  originalEndTimes: Ref<any[]>,
  availableStartTimes: Ref<any[]>,
  availableEndTimes: Ref<any[]>,
  day: string
): void {
  const bookedTimes = appointments.value
    .filter(
      (appointment) =>
        appointment.appointmentDay === day && appointment.id !== appointmentForm.value.id
    )
    .flatMap((appointment) => {
      const startHour = parseInt(appointment.startTime.split(':')[0], 10)
      const startMinute = parseInt(appointment.startTime.split(':')[1], 10)
      const endHour = parseInt(appointment.endTime.split(':')[0], 10)
      const endMinute = parseInt(appointment.endTime.split(':')[1], 10)
      const times: string[] = []

      for (let i = startHour; i <= endHour; i++) {
        for (let j = 0; j < 60; j += 30) {
          if (
            (i > startHour || (i === startHour && j >= startMinute)) &&
            (i < endHour || (i === endHour && j < endMinute))
          ) {
            times.push(`${i.toString().padStart(2, '0')}:${j.toString().padStart(2, '0')}`)
          }
        }
      }

      return times
    })

  // If there are no booked times for the selected day, reset the available times
  if (bookedTimes.length === 0) {
    availableStartTimes.value = [...originalEndTimes.value].filter((time) => time.value)
    availableEndTimes.value = [...originalEndTimes.value]
  } else {
    // Filter available times based on booked times
    availableStartTimes.value = availableStartTimes.value.filter(
      (time: { value: string }) => !bookedTimes.includes(time.value) && time.value
    )
    availableEndTimes.value = availableEndTimes.value.filter(
      (time: { value: string }) => !bookedTimes.includes(time.value)
    )
  }
}
