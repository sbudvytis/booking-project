<script lang="ts" setup>
import { trpc } from '@/trpc'
import { onBeforeMount, ref } from 'vue'
import { FwbAlert, FwbHeading, FwbPagination, FwbButton } from 'flowbite-vue'
import type { ScheduleBare } from '@mono/server/src/shared/entities'
import Schedule from '@/components/Schedule.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const schedules = ref<ScheduleBare[]>([])
const currentPage = ref(1)
const pageSize = ref(2)

const totalSchedules = ref(0)

onBeforeMount(async () => {
  const response = await trpc.schedule.find.query({
    page: currentPage.value - 1,
    pageSize: pageSize.value,
  })
  schedules.value = response.schedules
  totalSchedules.value = response.total
  totalPages.value = Math.ceil(totalSchedules.value / pageSize.value)
})

const updatePage = async (page: number) => {
  currentPage.value = page
  const response = await trpc.schedule.find.query({
    page: currentPage.value - 1,
    pageSize: pageSize.value,
  })
  schedules.value = response.schedules
  totalSchedules.value = response.total
  totalPages.value = Math.ceil(totalSchedules.value / pageSize.value)
}

const totalPages = ref(0)

const cancelForm = () => {
  router.push({ name: 'Dashboard' })
}
</script>

<template>
  <div class="DashboardView">
    <div v-if="schedules.length > 0">
      <div v-for="schedule in schedules" :key="schedule.scheduleId">
        <FwbHeading tag="h5" class="mb-2 ml-7 mt-10">
          🗓️ {{ schedule.startDate }} - {{ schedule.endDate }}
        </FwbHeading>
        <Schedule :schedule="schedule" :displayExpired="true" />
      </div>
    </div>
    <FwbAlert v-else data-testid="scheduleListEmpty" class="text-center">
      Looks like you have not created your schedule yet.
      <RouterLink
        :to="{ name: 'scheduleCreate' }"
        class="font-semibold leading-6 text-blue-700 hover:text-indigo-500"
        >You can create one by clicking this link</RouterLink
      >
    </FwbAlert>
    <div class="mt-4 flex justify-center space-x-4">
      <FwbPagination
        v-model="currentPage"
        :total-pages="totalPages"
        @update:modelValue="updatePage"
        show-icons
      ></FwbPagination>
    </div>
    <div class="mt-4 flex justify-center space-x-4">
      <FwbButton @click="cancelForm" type="button" color="default" size="lg">Go back</FwbButton>
    </div>
  </div>
</template>
