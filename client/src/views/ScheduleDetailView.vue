<script lang="ts" setup>
import { trpc } from '@/trpc'
import { onBeforeMount, ref } from 'vue'
import { FwbAlert } from 'flowbite-vue'
import type { ScheduleBare } from '@mono/server/src/shared/entities'
import Schedule from '@/components/Schedule.vue'
import { isScheduleExpired } from '../utils/scheduleUtils'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const schedules = ref<ScheduleBare[]>([])

onBeforeMount(async () => {
  const scheduleIdFromRoute = Number(route.params.scheduleId)
  const response = await trpc.schedule.find.query({ latest: false })
  const rawSchedules = response.schedules
  schedules.value = rawSchedules.filter((schedule) => !isScheduleExpired(schedule))
})
</script>

<template>
  <div class="DashboardView">
    <div v-if="schedules.length && !isScheduleExpired(schedules[0])" data-testid="">
      <Schedule :key="schedules[0].scheduleId" :schedule="schedules[0]" :displayExpired="false" />
    </div>
    <FwbAlert v-else data-testid="scheduleListEmpty" class="text-center"
      >Looks like you have not created your schedule yet 😔</FwbAlert
    >
  </div>
</template>
