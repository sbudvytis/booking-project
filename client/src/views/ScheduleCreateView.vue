<script setup lang="ts">
import { trpc } from '@/trpc'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { FwbButton, FwbInput } from 'flowbite-vue'
import useErrorMessage from '@/composables/useErrorMessage'
import AlertError from '@/components/AlertError.vue'
import PageForm from '@/components/PageForm.vue'
import { validateHours } from '@/utils/validation'

const router = useRouter()

const scheduleForm = ref({
  startTime: '',
  endTime: '',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
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
    errorMessage.value = ''
    return true
  }
}

const [createSchedule] = useErrorMessage(async () => {
  if (!scheduleForm.value.startDate || !scheduleForm.value.endDate) {
    errorMessage.value = 'You must select a date range.'
    return
  }

  if (!validateForm()) {
    return
  }

  try {
    await trpc.schedule.create.mutate({
      ...scheduleForm.value,
      startDate: new Date(scheduleForm.value.startDate),
      endDate: new Date(scheduleForm.value.endDate),
    })

    router.push({ name: 'Dashboard' })
  } catch (error) {
    errorMessage.value = (error as Error).message || 'An unknown error occurred.'
  }
})

const hourValidation = (event: InputEvent) => {
  const inputElement = event.target as HTMLInputElement
  validateHours(event)
  inputElement.reportValidity()
}

const cancelForm = () => {
  router.push({ name: 'Dashboard' })
}
</script>

<template>
  <PageForm heading="Create a new schedule" formLabel="edit">
    <div>
      <form aria-label="Project" @submit.prevent="createSchedule" class="mx-auto">
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
                label="Start Time"
                placeholder="08"
                @input="hourValidation"
                required
              />

              <FwbInput
                aria-label="End Time"
                v-model="scheduleForm.endTime"
                :minlength="2"
                label="End Time"
                placeholder="05"
                @input="hourValidation"
                required
              />
            </div>
          </div>
        </div>
        <div class="grid space-y-4 py-4 sm:mx-auto sm:w-full sm:max-w-sm">
          <AlertError :message="errorMessage" />
          <FwbButton type="submit">Create Schedule</FwbButton>
          <FwbButton @click="cancelForm" type="button" color="alternative">Cancel</FwbButton>
        </div>
      </form>
    </div>
  </PageForm>
</template>
