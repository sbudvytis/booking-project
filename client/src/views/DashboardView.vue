<script lang="ts" setup>
import { trpc } from '@/trpc'
import { onBeforeMount, ref, computed } from 'vue'
import { FwbAlert, FwbButton, FwbSelect } from 'flowbite-vue'
import type { ScheduleWithUser } from '@mono/server/src/shared/entities'
import Schedule from '@/components/Schedule.vue'
import { isScheduleExpired } from '../utils/scheduleUtils'
import { isDentist, canViewAllSchedules } from '@/stores/user'

const schedules = ref<ScheduleWithUser[]>([])

onBeforeMount(async () => {
  const response = await trpc.schedule.find.query({
    all: true,
    latest: isDentist.value,
  })
  const rawSchedules = response.schedules
  schedules.value = rawSchedules.filter((schedule) => !isScheduleExpired(schedule))
  selectedScheduleId.value = schedules.value[0]?.scheduleId?.toString() || ''
})

const selectedScheduleId = ref<string>('')

const selectedSchedule = computed(() =>
  schedules.value.find((schedule) => String(schedule.scheduleId) === selectedScheduleId.value)
)

const schedulesOptions = computed(() =>
  schedules.value.map((schedule) => ({
    value: String(schedule.scheduleId),
    name: `${schedule.user.firstName}'s (${schedule.user.email}) schedule from ${schedule.startDate} to ${schedule.endDate}`,
  }))
)
</script>

<template>
  <div class="DashboardView">
    <div class="mt-3">
      <FwbSelect
        v-if="!isDentist"
        v-model="selectedScheduleId"
        id="scheduleSelect"
        :options="schedulesOptions"
        label="Select Schedule"
      />
    </div>
    <div v-if="selectedSchedule && !isScheduleExpired(selectedSchedule)" data-testid="scheduleList">
      <Schedule :schedule="selectedSchedule" :displayExpired="false" />
    </div>
    <FwbAlert v-else data-testid="scheduleListEmpty" class="text-center"
      >Looks like you have not created your schedule yet 😔</FwbAlert
    >

    <div class="mt-4 flex justify-center space-x-4">
      <FwbButton
        v-if="selectedSchedule && !isScheduleExpired(selectedSchedule) && !canViewAllSchedules"
        component="RouterLink"
        tag="router-link"
        :href="{ name: 'scheduleEdit', params: { scheduleId: selectedSchedule.scheduleId } } as any"
        data-testid="editSchedule"
        size="lg"
      >
        Edit Schedule
      </FwbButton>

      <FwbButton
        v-else-if="!canViewAllSchedules"
        component="RouterLink"
        tag="router-link"
        :href="{ name: 'scheduleCreate' } as any"
        data-testid="createSchedule"
        size="lg"
      >
        Create a new schedule
      </FwbButton>

      <FwbButton
        v-if="selectedSchedule && !isScheduleExpired(selectedSchedule)"
        component="RouterLink"
        tag="router-link"
        :href="
          { name: 'appointmentCreate', params: { scheduleId: selectedSchedule.scheduleId } } as any
        "
        data-testid="createAppointment"
        size="lg"
        color="yellow"
      >
        Add appointment
      </FwbButton>

      <FwbButton
        v-if="!canViewAllSchedules"
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
