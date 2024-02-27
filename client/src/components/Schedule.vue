<script setup lang="ts">
import type { ScheduleBare, AppointmentBare } from '@mono/server/src/shared/entities'
import { ref, onMounted, computed, type Ref, watch } from 'vue'
import { trpc } from '@/trpc'
import {
  FwbTable,
  FwbTableBody,
  FwbTableCell,
  FwbTableHead,
  FwbTableHeadCell,
  FwbTableRow,
  FwbButton,
} from 'flowbite-vue'
import { getDaysBetweenDates } from '@/utils/validation'
import { isScheduleExpired } from '../utils/scheduleUtils'
import VueHorizontal from 'vue-horizontal'

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
const currentDay = getDaysBetweenDates(currentDate, currentDate)[0]

const generatedDays = computed(() => {
  return getDaysBetweenDates(props.schedule.startDate, props.schedule.endDate)
})

let activeTabValue =
  localStorage.getItem('activeTab') ||
  (getDaysBetweenDates(props.schedule.startDate, props.schedule.endDate).includes(currentDay)
    ? currentDay
    : getDaysBetweenDates(props.schedule.startDate, props.schedule.endDate)[0])

// Validating the active tab against the generated days list
if (
  !getDaysBetweenDates(props.schedule.startDate, props.schedule.endDate).includes(activeTabValue)
) {
  activeTabValue = getDaysBetweenDates(props.schedule.startDate, props.schedule.endDate)[0]
  localStorage.setItem('activeTab', activeTabValue)
}

const activeTab = ref(activeTabValue)

// using Watch for changes to activeTab and save to localStorage
watch(activeTab, (newVal) => {
  localStorage.setItem('activeTab', newVal)
})

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

  const today = new Date()
  today.setDate(today.getDate() - 1)

  return props.displayExpired || endDay >= today
}

type VueHorizontalInstance = InstanceType<typeof VueHorizontal>

const horizontal = ref<VueHorizontalInstance | null>(null)

onMounted(async () => {
  await loadAppointments()
  const todayIndex = generatedDays.value.indexOf(currentDay)
  if (todayIndex !== -1 && horizontal.value) {
    horizontal.value.scrollToIndex(todayIndex)
  }
})

watch(
  () => props.schedule.scheduleId,
  async (newScheduleId) => {
    await loadAppointments(newScheduleId)

    const currentActualDay = getDaysBetweenDates(currentDate, currentDate)[0]
    activeTab.value = generatedDays.value.includes(currentActualDay)
      ? currentActualDay
      : generatedDays.value[0]
  }
)

async function loadAppointments(scheduleId = props.schedule.scheduleId) {
  if (isScheduleValid()) {
    const appts = await trpc.appointment.find.query({ scheduleId })
    appointments.value = appts.reduce(
      (acc, appt) => {
        acc[appt.appointmentDay] = acc[appt.appointmentDay] || {}
        acc[appt.appointmentDay][appt.startTime] = appt
        return acc
      },
      {} as typeof appointments.value
    )
  }
}

const visibleDays = computed(() => {
  return generatedDays.value.filter((day) => day === activeTab.value)
})

const isTodayInTabs = computed(() => {
  return generatedDays.value.includes(currentDay)
})

function setActiveTabToToday() {
  const today = getDaysBetweenDates(new Date(), new Date())[0]

  if (generatedDays.value.includes(today)) {
    activeTab.value = today
  } else {
    activeTab.value = generatedDays.value[0]
  }

  localStorage.setItem('activeTab', activeTab.value)

  // Scrolls to the "today" tab
  const todayIndex = generatedDays.value.indexOf(activeTab.value)
  if (todayIndex !== -1 && horizontal.value) {
    horizontal.value.scrollToIndex(todayIndex)
  }
}
</script>

<template>
  <div>
    <div class="border-b border-gray-200 pt-5 text-sm font-medium text-gray-500">
      <div class="flex justify-end pb-5">
        <fwbButton v-if="isTodayInTabs" @click="setActiveTabToToday" color="alternative"
          >Back to Today</fwbButton
        >
      </div>
      <vue-horizontal
        ref="horizontal"
        class="horizontal"
        :displacement="0.5"
        :button-between="false"
      >
        <template v-slot:btn-prev>
          <button
            class="flex h-full items-center justify-center rounded-tl-lg bg-gradient-to-l from-transparent via-white to-gray-50 p-6 hover:text-blue-600"
          >
            <svg
              class="h-6 w-6"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 8 14"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 1 1.3 6.326a.91.91 0 0 0 0 1.348L7 13"
              />
            </svg>
          </button>
        </template>

        <template v-slot:btn-next>
          <button
            class="flex h-full items-center justify-center rounded-tr-lg bg-gradient-to-r from-transparent via-white to-gray-50 p-6 hover:text-blue-600"
          >
            <svg
              class="h-6 w-6"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 8 14"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m1 13 5.7-5.326a.909.909 0 0 0 0-1.348L1 1"
              />
            </svg>
          </button>
        </template>

        <div v-for="day in generatedDays" :key="day">
          <div
            class="cursor-pointer rounded-t-lg px-6 py-4 hover:bg-gray-50"
            :class="{
              'rounded-t-lg bg-gray-50 text-blue-600': activeTab === day,
            }"
            @click="activeTab = day"
          >
            {{ day }}
          </div>
        </div>
      </vue-horizontal>
    </div>

    <main>
      <div v-for="day in visibleDays" :key="day">
        <fwb-table hoverable striped class="max-h-144">
          <fwb-table-head class="pt-10">
            <fwb-table-head-cell>Time</fwb-table-head-cell>
            <fwb-table-head-cell class="text-center">Appointment</fwb-table-head-cell>
            <fwb-table-head-cell class="text-center">End Time</fwb-table-head-cell>
            <fwb-table-head-cell class="text-right"><span></span></fwb-table-head-cell>
          </fwb-table-head>
          <fwb-table-body>
            <fwb-table-row
              v-for="timeSlot in generateTimeSlots(
                schedule.startTime.toString(),
                schedule.endTime.toString(),
                appointments[day] || {}
              )"
              :key="timeSlot"
              :class="{
                'line-through': appointments[day]?.[timeSlot]?.status === 'Completed',
              }"
            >
              <fwb-table-cell>{{ timeSlot }}</fwb-table-cell>
              <fwb-table-cell v-if="appointments[day]?.[timeSlot]" class="text-center">
                <span
                  class="cursor-pointer"
                  v-tooltip="{
                    content: `
                    <p>👤 <b>${appointments[day][timeSlot].patient?.firstName} ${appointments[day][timeSlot].patient?.lastName}</b></p>
                    <p>📱 Phone number: <b>${appointments[day][timeSlot].patient?.contactNumber}</b></p>
                    <p>👀 Status: <b>${appointments[day][timeSlot].status}</b></p>
                    <p>📆 Day: <b>${appointments[day][timeSlot].appointmentDay}</b></p>
                    <p>🕓 Time: <b>${appointments[day][timeSlot].startTime} - ${appointments[day][timeSlot].endTime}</b></p>
                    <p>📝 Additional notes: <b>${appointments[day][timeSlot].notes}</b></p>`,
                    html: true,
                    placement: 'bottom-start',
                    defaultClass: 'custom-tooltip',
                  }"
                >
                  {{ appointments[day][timeSlot].appointmentType }}
                </span>
              </fwb-table-cell>
              <fwb-table-cell v-else></fwb-table-cell>
              <fwb-table-cell v-if="appointments[day]?.[timeSlot]" class="text-center">
                {{ appointments[day][timeSlot].endTime }}
              </fwb-table-cell>
              <fwb-table-cell v-else></fwb-table-cell>
              <fwb-table-cell class="edit-cell">
                <span v-if="appointments[day]?.[timeSlot]">
                  <template v-if="!isScheduleExpired(schedule)">
                    <FwbButton
                      component="RouterLink"
                      tag="router-link"
                      :href="
                        {
                          name: 'appointmentEdit',
                          params: {
                            scheduleId: schedule.scheduleId,
                            id: appointments[day][timeSlot].id,
                          },
                        } as any
                      "
                      size="sm"
                      color="alternative"
                    >
                      Edit
                    </FwbButton>
                  </template>
                </span>
              </fwb-table-cell>
            </fwb-table-row>
          </fwb-table-body>
        </fwb-table>
      </div>
    </main>
  </div>
</template>

<style scoped>
.edit-cell {
  min-width: 7rem;
}
</style>
