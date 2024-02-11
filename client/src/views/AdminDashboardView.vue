<script lang="ts" setup>
import { trpc } from '@/trpc'
import { onBeforeMount, ref } from 'vue'
import {
  FwbButton,
  FwbAlert,
  FwbTable,
  FwbTableBody,
  FwbTableCell,
  FwbTableHead,
  FwbTableHeadCell,
  FwbTableRow,
  FwbHeading,
} from 'flowbite-vue'
import type { UserBare } from '@mono/server/src/shared/entities'

const users = ref<UserBare[]>([])
const errorMessage = ref<string | null>(null)

onBeforeMount(async () => {
  await loadUsers()
})

const loadUsers = async () => {
  try {
    const response = await trpc.user.find.query()
    const rawUsers = response
    users.value = rawUsers.filter((user) => !user.isApproved)
  } catch (error) {
    console.error('Failed to load users:', error)
  }
}

const approveUser = async (id: number) => {
  try {
    await trpc.user.approve.mutate({ id })
    await loadUsers()
  } catch (error: any) {
    if (error.message.includes('Permission denied')) {
      errorMessage.value =
        '⛔ Permission denied. You do not have the required permissions to approve a user ⛔'
    } else {
      errorMessage.value = 'An error occurred while approving the user.'
    }
  }
}

const removeUser = async (id: number) => {
  try {
    await trpc.user.remove.mutate({ id })
    await loadUsers()
  } catch (error: any) {
    if (error.message.includes('Permission denied')) {
      errorMessage.value =
        '⛔ Permission denied. You do not have the required permissions to remove user ⛔'
    } else {
      errorMessage.value = 'An error occurred while removing the user.'
    }
  }
}
</script>

<template>
  <div v-if="users.length" data-testid="userList">
    <fwb-heading tag="h5" class="pb-8 text-center">Users waiting for approval</fwb-heading>
    <fwb-table hoverable striped>
      <fwb-table-head>
        <fwb-table-head-cell>User ID</fwb-table-head-cell>
        <fwb-table-head-cell>Email address</fwb-table-head-cell>
        <fwb-table-head-cell></fwb-table-head-cell>
      </fwb-table-head>
      <fwb-table-body>
        <fwb-table-row v-for="user in users" :key="user.id">
          <fwb-table-cell>{{ user.id }}</fwb-table-cell>
          <fwb-table-cell>{{ user.email }}</fwb-table-cell>
          <fwb-table-cell class="space-x-2 space-y-2"
            ><FwbButton size="sm" @click="approveUser(user.id)"
              ><svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                class="bi bi-check-circle-fill"
                viewBox="0 0 16 16"
              >
                <path
                  d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"
                /></svg
            ></FwbButton>
            <FwbButton size="sm" color="red" @click="removeUser(user.id)"
              ><svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                class="bi bi-x-circle-fill"
                viewBox="0 0 16 16"
              >
                <path
                  d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z"
                />
              </svg>
            </FwbButton>
          </fwb-table-cell>
        </fwb-table-row>
      </fwb-table-body>
    </fwb-table>
  </div>
  <FwbAlert type="success" v-else data-testid="userListEmpty" class="text-center"
    >✅ All clear! There are no users to approve.
    <RouterLink
      :to="{ name: 'Dashboard' }"
      class="font-semibold leading-6 text-green-700 hover:text-green-500"
      >Go back</RouterLink
    ></FwbAlert
  >
  <div class="pt-5">
    <FwbAlert v-if="errorMessage" type="danger" class="text-center">
      {{ errorMessage }}
    </FwbAlert>
  </div>
</template>
