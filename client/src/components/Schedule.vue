<script setup lang="ts">
import type { ScheduleBare, AppointmentBare } from '@mono/server/src/shared/entities'
import { ref, onMounted, type Ref } from 'vue'
import { trpc } from '@/trpc'
import {
  FwbTable,
  FwbTableBody,
  FwbTableCell,
  FwbTableHead,
  FwbTableHeadCell,
  FwbTableRow,
  FwbTab,
  FwbTabs,
  FwbButton,
} from 'flowbite-vue'
import { getDaysBetweenDates } from '@/utils/validation'

const props = withDefaults(
  defineProps<{
    schedule: ScheduleBare
    displayExpired: boolean
  }>(),
  {
    schedule: () => ({}) as ScheduleBare,
    displayExpired: false,
  }
)

const currentDate = new Date()
const currentDay = getDaysBetweenDates(currentDate.toISOString(), currentDate.toISOString())[0]

const activeTab = ref(
  props.schedule.dayOfWeek.includes(currentDay) ? currentDay : props.schedule.dayOfWeek[0]
)

const appointments: Ref<Record<string, Record<string, AppointmentBare>>> = ref({})

const generateTimeSlots = (
  startTime: string,
  endTime: string,
  appointments: Record<string, AppointmentBare>
) => {
  const startHour = parseInt(startTime.split(':')[0], 10)
  const endHour = parseInt(endTime.split(':')[0], 10)

  const timeSlots = []

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const formattedHour = hour.toString().padStart(2, '0')
      const formattedMinute = minute.toString().padStart(2, '0')
      const time = `${formattedHour}:${formattedMinute}`

      const appointment = Object.values(appointments).find(
        (appt) => appt.startTime < time && appt.endTime > time
      )

      if (!appointment || appointment.endTime <= time) {
        timeSlots.push(time)
      }
    }
  }

  return timeSlots
}

const isScheduleValid = () => {
  const endDay = new Date(props.schedule.endDate)

  // Create a new Date object for tomorrow
  const today = new Date()
  today.setDate(today.getDate() - 1)

  return props.displayExpired || endDay >= today
}

onMounted(async () => {
  // Check if the schedule is valid before fetching appointments
  if (isScheduleValid()) {
    const appts = await trpc.appointment.find.query()
    appointments.value = appts.reduce(
      (acc, appt) => {
        acc[appt.appointmentDay] = acc[appt.appointmentDay] || {}
        acc[appt.appointmentDay][appt.startTime] = appt
        return acc
      },
      {} as typeof appointments.value
    )
  }
})
</script>

<template>
  <fwb-tabs v-model="activeTab" v-if="isScheduleValid()" directive="show">
    <fwb-tab v-for="day in schedule.dayOfWeek" :key="day" :name="day" :title="day">
      <fwb-table hoverable striped>
        <fwb-table-head>
          <fwb-table-head-cell>Time</fwb-table-head-cell>
          <fwb-table-head-cell class="text-center">Appointment</fwb-table-head-cell>
          <fwb-table-head-cell class="text-center">End Time</fwb-table-head-cell>
          <fwb-table-head-cell class="text-center"><span></span></fwb-table-head-cell>
        </fwb-table-head>
        <fwb-table-body>
          <fwb-table-row
            v-for="timeSlot in generateTimeSlots(
              schedule.startTime.toString(),
              schedule.endTime.toString(),
              appointments[day] || {}
            )"
            :key="timeSlot"
          >
            <fwb-table-cell
              :class="{
                'line-through dark:text-white':
                  appointments[day]?.[timeSlot]?.status === 'Completed',
              }"
              >{{ timeSlot }}</fwb-table-cell
            >
            <fwb-table-cell
              v-if="appointments[day]?.[timeSlot]"
              :class="{
                'line-through dark:text-white':
                  appointments[day]?.[timeSlot]?.status === 'Completed',
              }"
              class="text-center"
            >
              <span
                class="cursor-pointer"
                v-tooltip="{
                  content: `<p>👤 <b>${appointments[day][timeSlot].patient?.firstName} ${appointments[day][timeSlot].patient?.lastName}</b></p>
            <p>📱 Phone number: <b>${appointments[day][timeSlot].patient?.contactNumber}</b></p>
            <p>📝 Status: <b>${appointments[day][timeSlot].status}</b></p>
            <p>📆 Day: <b>${appointments[day][timeSlot].appointmentDay}</b></p>
            <p>🕓 Time: <b>${appointments[day][timeSlot].startTime} - ${appointments[day][timeSlot].endTime}</b></p>`,
                  html: true,
                  placement: 'bottom-start',
                  defaultClass: 'custom-tooltip',
                }"
              >
                {{ appointments[day][timeSlot].appointmentType }}
              </span>
            </fwb-table-cell>
            <fwb-table-cell v-else></fwb-table-cell>
            <fwb-table-cell
              v-if="appointments[day]?.[timeSlot]"
              :class="{
                'line-through dark:text-white':
                  appointments[day]?.[timeSlot]?.status === 'Completed',
              }"
              class="text-center"
            >
              {{ appointments[day][timeSlot].endTime }}
            </fwb-table-cell>
            <fwb-table-cell v-else></fwb-table-cell>
            <fwb-table-cell class="edit-cell">
              <span v-if="appointments[day]?.[timeSlot]">
                <FwbButton
                  component="RouterLink"
                  tag="router-link"
                  :href="
                    {
                      name: 'appointmentEdit',
                      params: { id: appointments[day][timeSlot].id },
                    } as any
                  "
                  size="sm"
                  color="alternative"
                >
                  Edit
                </FwbButton>
              </span>
            </fwb-table-cell>
          </fwb-table-row>
        </fwb-table-body>
      </fwb-table>
    </fwb-tab>
  </fwb-tabs>
</template>

<style scoped>
.edit-cell {
  min-width: 7rem;
}
</style>
