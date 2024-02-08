<script lang="ts" setup>
import { trpc } from '@/trpc'
import { onBeforeMount, ref } from 'vue'
import { FwbAlert, FwbButton } from 'flowbite-vue'
import type { ScheduleBare } from '@mono/server/src/shared/entities'
import Schedule from '@/components/Schedule.vue'
import { isScheduleExpired } from '../utils/scheduleUtils'

const schedules = ref<ScheduleBare[]>([])

onBeforeMount(async () => {
  const response = await trpc.schedule.find.query({ latest: true })
  const rawSchedules = response.schedules
  schedules.value = rawSchedules.filter((schedule) => !isScheduleExpired(schedule))
})
</script>

<template>
  <div class="DashboardView">
    <div v-if="schedules.length && !isScheduleExpired(schedules[0])" data-testid="scheduleList">
      <Schedule
        v-for="schedule in schedules"
        :key="schedule.scheduleId"
        :schedule="schedule"
        :displayExpired="false"
      />
    </div>
    <FwbAlert v-else data-testid="scheduleListEmpty" class="text-center"
      >Looks like you have not created your schedule yet 😔</FwbAlert
    >

    <div class="mt-4 flex justify-center space-x-4">
      <FwbButton
        v-if="schedules.length && !isScheduleExpired(schedules[0])"
        component="RouterLink"
        tag="router-link"
        :href="{ name: 'scheduleEdit', params: { scheduleId: schedules[0].scheduleId } } as any"
        data-testid="editSchedule"
        size="lg"
      >
        Edit Schedule
      </FwbButton>

      <FwbButton
        v-else
        component="RouterLink"
        tag="router-link"
        :href="{ name: 'scheduleCreate' } as any"
        data-testid="createSchedule"
        size="lg"
      >
        Create a new schedule
      </FwbButton>

      <FwbButton
        v-if="schedules.length && !isScheduleExpired(schedules[0])"
        component="RouterLink"
        tag="router-link"
        :href="{ name: 'appointmentCreate' } as any"
        data-testid="createAppointment"
        size="lg"
        color="yellow"
      >
        Add appointment
      </FwbButton>

      <FwbButton
        component="RouterLink"
        tag="router-link"
        :href="{ name: 'scheduleAll' } as any"
        data-testid="scheduleAll"
        size="lg"
        color="alternative"
      >
        View previous schedules
      </FwbButton>
    </div>
  </div>
</template>
