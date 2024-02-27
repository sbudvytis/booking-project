<script setup lang="ts">
import { ref, onBeforeMount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { FwbButton, FwbInput } from 'flowbite-vue'
import useErrorMessage from '@/composables/useErrorMessage'
import AlertError from '@/components/AlertError.vue'
import PageForm from '@/components/PageForm.vue'
import { clearActiveTab, clearSelectedId } from '@/utils/auth'
import { validateHours } from '@/utils/validation'
import { trpc } from '@/trpc'

const router = useRouter()
const route = useRoute()

const scheduleForm = ref({
  startTime: '',
  endTime: '',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
  scheduleId: 0,
  userId: 0,
})

onBeforeMount(async () => {
  try {
    const respone = await trpc.schedule.find.query({ latest: true })
    const existingSchedules = respone.schedules
    const scheduleIdFromUrl = Number(route.params.scheduleId)

    const existingSchedule = existingSchedules.find(
      (schedule) => schedule.scheduleId === scheduleIdFromUrl
    )

    // Populates the form with existing schedule data
    scheduleForm.value = {
      startTime: existingSchedule?.startTime || '',
      endTime: existingSchedule?.endTime || '',
      startDate: existingSchedule?.startDate
        ? new Date(existingSchedule.startDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      endDate: existingSchedule?.endDate
        ? new Date(existingSchedule.endDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      scheduleId: existingSchedule?.scheduleId || 0,
      userId: existingSchedule?.userId || 0,
    }
  } catch (error) {
    console.error('Error fetching schedule data:', error)
  }
})

const errorMessage = ref('')

const validateForm = () => {
  const startDate = new Date(scheduleForm.value.startDate)
  const endDate = new Date(scheduleForm.value.endDate)

  if (scheduleForm.value.startDate && scheduleForm.value.endDate) {
    if (endDate < startDate) {
      errorMessage.value = 'End date cannot be before start date.'
      return false
    } else {
      errorMessage.value = ''
      return true
    }
  } else {
    errorMessage.value = 'You must select a date range.'
    return false
  }
}

const [editSchedule] = useErrorMessage(async () => {
  if (!validateForm()) {
    return
  }

  try {
    await trpc.schedule.edit.mutate({
      ...scheduleForm.value,
      startDate: new Date(scheduleForm.value.startDate),
      endDate: new Date(scheduleForm.value.endDate),
    })

    router.push({ name: 'Dashboard' })
  } catch (error) {
    errorMessage.value = (error as Error).message || 'An unknown error occurred.'
  }
})

const [deleteSchedule] = useErrorMessage(async () => {
  try {
    const scheduleId = Number(route.params.scheduleId)
    const existingAppointments = await trpc.appointment.get.query(scheduleId)

    // Checks if the list of appointments is empty
    if (existingAppointments.length > 0) {
      errorMessage.value = 'Cannot delete schedule with existing appointments.'
      return
    }

    await trpc.schedule.remove.mutate({
      ...scheduleForm.value,
      startDate: new Date(scheduleForm.value.startDate),
      endDate: new Date(scheduleForm.value.endDate),
    })
    router.push({ name: 'Dashboard' })
  } catch (error) {
    errorMessage.value = (error as Error).message || 'An unknown error occurred.'
  }
  clearSelectedId(localStorage)
  clearActiveTab(localStorage)
})

const hourValidation = (event: InputEvent) => {
  validateHours(event)
}

const cancelForm = () => {
  router.push({ name: 'Dashboard' })
}
</script>

<template>
  <PageForm heading="Edit Schedule" formLabel="edit">
    <div>
      <form aria-label="Schedule" @submit.prevent="editSchedule" class="mx-auto">
        <div class="space-y-10">
          <div class="space-y-10">
            <div class="space-y-6 sm:mx-auto sm:w-full sm:max-w-sm">
              <FwbInput
                aria-label="Start Date"
                v-model="scheduleForm.startDate"
                type="date"
                label="Start Date"
                required
              />

              <FwbInput
                aria-label="End Date"
                v-model="scheduleForm.endDate"
                type="date"
                label="End Date"
                required
              />

              <FwbInput
                aria-label="Start Time"
                v-model="scheduleForm.startTime"
                :minlength="2"
                label="Start Hour"
                placeholder="08"
                @input="hourValidation"
                required
              />

              <FwbInput
                aria-label="End Time"
                v-model="scheduleForm.endTime"
                :minlength="2"
                label="End Hour"
                placeholder="05"
                @input="hourValidation"
                required
              />
            </div>
          </div>
        </div>
        <div class="grid space-y-4 py-4 sm:mx-auto sm:w-full sm:max-w-sm">
          <AlertError :message="errorMessage" />
          <FwbButton type="submit">Edit Schedule</FwbButton>
          <FwbButton @click="deleteSchedule" type="button" color="red">Delete Schedule</FwbButton>
          <FwbButton @click="cancelForm" type="button" color="alternative">Cancel</FwbButton>
        </div>
      </form>
    </div>
  </PageForm>
</template>
