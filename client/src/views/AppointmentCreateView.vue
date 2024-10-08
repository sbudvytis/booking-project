<script setup lang="ts">
import { trpc } from '@/trpc'
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import useErrorMessage from '@/composables/useErrorMessage'
import AlertError from '@/components/AlertError.vue'
import AppointmentForm from '@/components/AppointmentForm.vue'
import { FwbInput, FwbButton, FwbSelect, FwbTextarea } from 'flowbite-vue'
import type { AppointmentBare } from '@mono/server/src/shared/entities'
import { isScheduleExpired } from '../utils/scheduleUtils'
import { getDaysBetweenDates } from '@/utils/validation'
import { filterBookedTimes } from '../utils/filterBookedTimes'

const router = useRouter()
const route = useRoute()

const appointmentForm = ref({
  appointmentType: '',
  status: 'Active',
  startTime: '',
  endTime: '',
  appointmentDay: '',
  email: '',
  firstName: '',
  lastName: '',
  contactNumber: '',
  notes: '',
})

const availableDays = ref()
const availableStartTimes = ref()
const availableEndTimes = ref()
const originalEndTimes = ref()
const appointments = ref<AppointmentBare[]>([])

onMounted(async () => {
  try {
    const scheduleIdFromRoute = Number(route.params.scheduleId)
    const response = await trpc.schedule.find.query({ scheduleId: scheduleIdFromRoute })
    const schedules = response.schedules
    const activeSchedules = schedules.filter((schedule) => !isScheduleExpired(schedule))

    appointments.value = await trpc.appointment.find.query({ scheduleId: scheduleIdFromRoute })

    // Dynamically populate availableDays based on the schedule's start and end dates
    const startDate = new Date(activeSchedules[0]?.startDate)
    const endDate = new Date(activeSchedules[0]?.endDate)

    const days = getDaysBetweenDates(startDate, endDate).map((date) => ({
      value: date,
      name: date,
    }))

    availableDays.value = days

    const allStartTimes: string[] = []
    const allEndTimes: string[] = []

    activeSchedules.forEach((schedule) => {
      const startHour = parseInt(schedule.startTime.split(':')[0], 10)
      const endHour = parseInt(schedule.endTime.split(':')[0], 10)

      // Populates start times array with 30-minute intervals
      for (let i = startHour; i < endHour; i++) {
        for (let j = 0; j < 60; j += 30) {
          allStartTimes.push(`${i.toString().padStart(2, '0')}:${j.toString().padStart(2, '0')}`)
        }
      }

      // Populates end times array with 30-minute intervals, up to the schedule's end time
      for (let i = startHour; i <= endHour; i++) {
        for (let j = 0; j < 60; j += 30) {
          const endTime = `${i.toString().padStart(2, '0')}:${j.toString().padStart(2, '0')}`
          if (i < endHour || (i === endHour && j === 0)) {
            allEndTimes.push(endTime)
          }
        }
      }
    })

    // Uses only active schedules for availableStartTimes
    availableStartTimes.value = [...new Set(allStartTimes)].map((time) => ({
      value: time,
      name: time,
    }))

    // Uses only active schedules for availableEndTimes
    availableEndTimes.value = [...new Set(allEndTimes)].map((time) => ({ value: time, name: time }))

    // Uses only active schedules for originalEndTimes
    originalEndTimes.value = [...new Set(allEndTimes)].map((time) => ({ value: time, name: time }))
  } catch (error) {
    console.error('Error fetching available data:', error)
  }
})

const [createAppointment, errorMessage] = useErrorMessage(async () => {
  const scheduleIdFromRoute = Number(route.params.scheduleId)
  const respone = await trpc.schedule.find.query({ scheduleId: scheduleIdFromRoute })
  const schedules = respone.schedules

  const existingSchedule = schedules.find((schedule) => schedule.scheduleId === scheduleIdFromRoute)

  const appointmentData = {
    ...appointmentForm.value,
    scheduleId: existingSchedule?.scheduleId || 0,
    patientData: {
      firstName: appointmentForm.value.firstName,
      lastName: appointmentForm.value.lastName,
      contactNumber: appointmentForm.value.contactNumber,
      email: appointmentForm.value.email,
      notes: appointmentForm.value.notes,
    },
  }

  await trpc.appointment.create.mutate(appointmentData)

  router.push({ name: 'Dashboard' })
})

const cancelForm = () => {
  router.push({ name: 'Dashboard' })
}

watch(
  () => appointmentForm.value.startTime,
  (newStartTime) => {
    // Filter out end times that overlap with existing appointments
    availableEndTimes.value = originalEndTimes.value.filter((endTime: { value: string }) => {
      return (
        endTime.value > newStartTime &&
        !appointments.value.some(
          (appointment) =>
            newStartTime < appointment.endTime && endTime.value > appointment.startTime
        )
      )
    })
  }
)

watch(
  () => appointmentForm.value.appointmentDay,
  (newDay) => {
    filterBookedTimes(
      appointments,
      appointmentForm,
      originalEndTimes,
      availableStartTimes,
      availableEndTimes,
      newDay
    )
  }
)
</script>

<template>
  <AppointmentForm heading="Add an appointment" formLabel="addAppointment">
    <div>
      <form @submit.prevent="createAppointment" class="mx-auto">
        <div class="grid grid-cols-2 gap-6">
          <FwbSelect
            v-model="appointmentForm.appointmentDay"
            id="appointmentDay"
            required
            :options="availableDays"
            label="Select Day"
          />

          <FwbInput
            v-model="appointmentForm.appointmentType"
            id="appointmentType"
            label="Appointment Type"
            required
          />

          <FwbSelect
            v-model="appointmentForm.startTime"
            id="startTime"
            required
            :options="availableStartTimes"
            label="Select Start Time"
          />

          <FwbSelect
            v-model="appointmentForm.endTime"
            id="endTime"
            required
            :options="availableEndTimes"
            label="Select End Time"
          />

          <FwbInput
            v-model="appointmentForm.firstName"
            id="firstName"
            label="First Name"
            required
          />

          <FwbInput v-model="appointmentForm.lastName" id="lastName" label="Last Name" required />
          <FwbInput v-model="appointmentForm.email" type="text" id="email" label="Email" required />
          <FwbInput
            v-model="appointmentForm.contactNumber"
            id="contactNumber"
            label="Phone Number"
            required
          />
        </div>
        <div class="mt-6">
          <FwbTextarea
            v-model="appointmentForm.notes"
            id="notes"
            label="Additional Notes"
            required
          />
        </div>
        <AlertError :message="errorMessage" />
        <div class="col-span-2 flex justify-center space-x-4 py-4">
          <FwbButton @submit="createAppointment">Add Appointment</FwbButton>
          <FwbButton @click="cancelForm" type="button" color="alternative">Cancel</FwbButton>
        </div>
      </form>
    </div>
  </AppointmentForm>
</template>
