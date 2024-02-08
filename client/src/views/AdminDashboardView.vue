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
            ><FwbButton size="sm" @click="approveUser(user.id)">Approve</FwbButton>
            <FwbButton size="sm" color="red" @click="removeUser(user.id)">Remove</FwbButton>
          </fwb-table-cell>
        </fwb-table-row>
      </fwb-table-body>
    </fwb-table>
  </div>
  <FwbAlert type="success" v-else data-testid="userListEmpty" class="text-center"
    >All clear! There are no users to approve ✅</FwbAlert
  >
  <div class="pt-5">
    <FwbAlert v-if="errorMessage" type="danger" class="text-center">
      {{ errorMessage }}
    </FwbAlert>
  </div>
</template>
