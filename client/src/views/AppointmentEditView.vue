<script setup lang="ts">
import { trpc } from '@/trpc'
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import useErrorMessage from '@/composables/useErrorMessage'
import AlertError from '@/components/AlertError.vue'
import AppointmentForm from '@/components/AppointmentForm.vue'
import type { AppointmentBare } from '@mono/server/src/shared/entities'
import { filterBookedTimes } from '../utils/filterBookedTimes'
import { FwbInput, FwbButton, FwbSelect } from 'flowbite-vue'
import { getDaysBetweenDates } from '@/utils/validation'

const router = useRouter()
const route = useRoute()

const id = ref<number>(0)

const appointmentForm = ref({
  appointmentType: '',
  status: '',
  startTime: '',
  endTime: '',
  appointmentDay: '',
  email: '',
  id: 0,
  userId: 0,
  notes: '',
})

const availableDays = ref()
const availableStartTimes = ref()
const availableEndTimes = ref()
const originalEndTimes = ref()
const appointments = ref<AppointmentBare[]>([])

const completedCheckbox = ref(false)

const updateStatus = () => {
  appointmentForm.value.status = completedCheckbox.value ? 'Completed' : 'Active'
}

onMounted(async () => {
  try {
    const scheduleIdFromRoute = Number(route.params.scheduleId)
    const existingAppointments = await trpc.appointment.find.query({
      scheduleId: scheduleIdFromRoute,
    })
    const respone = await trpc.schedule.find.query({ scheduleId: scheduleIdFromRoute })
    const schedules = respone.schedules

    appointments.value = existingAppointments

    const appointmentIdFromUrl = Number(route.params.id)

    const existingAppointment = existingAppointments.find(
      (appointment) => appointment.id === appointmentIdFromUrl
    )

    id.value = existingAppointment?.id || 0

    // Populates the form with existing appointment data (looks ugly, I know)
    appointmentForm.value = {
      appointmentType: existingAppointment?.appointmentType || '',
      status: existingAppointment?.status || '',
      startTime: existingAppointment?.startTime || '',
      endTime: existingAppointment?.endTime || '',
      appointmentDay: existingAppointment?.appointmentDay || '',
      email: existingAppointment?.email || '',
      id: existingAppointment?.id || 0,
      userId: existingAppointment?.userId || 0,
      notes: existingAppointment?.notes || '',
    }

    completedCheckbox.value = appointmentForm.value.status === 'Completed'

    // Dynamically populate availableDays based on the schedule's start and end dates
    const startDate = new Date(schedules[0]?.startDate)
    const endDate = new Date(schedules[0]?.endDate)

    const days = getDaysBetweenDates(startDate, endDate).map((date) => ({
      value: date,
      name: date,
    }))

    availableDays.value = days

    const allStartTimes: string[] = []
    const allEndTimes: string[] = []

    schedules.forEach((schedule) => {
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

    availableStartTimes.value = [...new Set(allStartTimes)].map((time) => ({
      value: time,
      name: time,
    }))
    availableEndTimes.value = [...new Set(allEndTimes)].map((time) => ({
      value: time,
      name: time,
    }))
    originalEndTimes.value = [...new Set(allEndTimes)].map((time) => ({
      value: time,
      name: time,
    }))
  } catch (error) {
    console.error('Error fetching available data:', error)
  }
})

watch(
  () => appointmentForm.value.startTime,
  (newStartTime) => {
    const selectedDay = appointmentForm.value.appointmentDay
    const existingAppointmentsOnDay = appointments.value.filter(
      (appointment) =>
        appointment.appointmentDay === selectedDay && appointment.id !== appointmentForm.value.id
    )
    // Filters out end times that overlap with existing appointments
    availableEndTimes.value = originalEndTimes.value.filter((endTime: { value: string }) => {
      return (
        endTime.value > newStartTime &&
        !existingAppointmentsOnDay.some(
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

const [editAppointment, errorMessage] = useErrorMessage(async () => {
  await trpc.appointment.edit.mutate(appointmentForm.value)

  router.push({ name: 'Dashboard' })
})

const [deleteAppointment] = useErrorMessage(async () => {
  if (id.value) {
    await trpc.appointment.remove.mutate(appointmentForm.value)
    router.push({ name: 'Dashboard' })
  }
})

const cancelForm = () => {
  router.push({ name: 'Dashboard' })
}
</script>

<template>
  <AppointmentForm heading="Edit appointment" formLabel="edit">
    <div class="space-y-6 sm:mx-auto sm:w-full sm:max-w-sm">
      <form @submit.prevent="editAppointment" class="grid space-y-4">
        <FwbSelect
          v-model="appointmentForm.appointmentDay"
          id="appointmentDay"
          required
          :options="availableDays"
          label="Select Day"
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
          v-model="appointmentForm.appointmentType"
          id="appointmentType"
          label="Appointment Type"
          maxlength="20"
          required
        />

        <div class="flex items-center justify-center space-x-2">
          <label for="completed">Completed:</label>
          <input
            v-model="completedCheckbox"
            type="checkbox"
            id="completed"
            @change="updateStatus"
            class="m-3 rounded border-gray-300 p-2.5 text-blue-500 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
          />
        </div>

        <AlertError :message="errorMessage" />

        <FwbButton type="submit">Edit Appointment</FwbButton>
        <FwbButton @click="deleteAppointment" type="button" color="red"
          >Delete Appointment</FwbButton
        >
        <FwbButton @click="cancelForm" type="button" color="alternative">Cancel</FwbButton>
      </form>
    </div>
  </AppointmentForm>
</template>
