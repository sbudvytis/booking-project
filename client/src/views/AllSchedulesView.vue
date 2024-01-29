<script lang="ts" setup>
import { trpc } from '@/trpc'
import { onBeforeMount, ref } from 'vue'
import { FwbAlert, FwbHeading, FwbButton } from 'flowbite-vue'
import type { ScheduleBare } from '@mono/server/src/shared/entities'
import Schedule from '@/components/Schedule.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const schedules = ref<ScheduleBare[]>([])

onBeforeMount(async () => {
  schedules.value = await trpc.schedule.find.query()
})

const cancelForm = () => {
  router.push({ name: 'Dashboard' })
}
</script>

<template>
  <div class="DashboardView">
    <div v-if="schedules.length > 0">
      <div v-for="schedule in schedules" :key="schedule.scheduleId">
        <FwbHeading tag="h5" class="mb-7 ml-7 mt-7">
          {{ schedule.startDate }} - {{ schedule.endDate }}
        </FwbHeading>
        <Schedule :schedule="schedule" :displayExpired="true" />
      </div>
    </div>
    <FwbAlert v-else data-testid="scheduleListEmpty" class="text-center">
      There are no schedules yet.
    </FwbAlert>
    <div class="mt-4 flex justify-center space-x-4">
      <FwbButton @click="cancelForm" type="button" color="default" size="lg">Go back</FwbButton>
    </div>
  </div>
</template>
