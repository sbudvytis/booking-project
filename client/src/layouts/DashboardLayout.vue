<script setup lang="ts">
import { FwbNavbarLink } from 'flowbite-vue'
import StackedLayout from './StackedLayout.vue'
import { logout, canApproveUsers } from '@/stores/user'
import { useRouter } from 'vue-router'

const router = useRouter()

const links = [{ label: 'Dashboard', name: 'Dashboard' }]

function logoutUser() {
  logout()
  router.push({ name: 'Login' })
}

function adminPanel() {
  router.push({ name: 'adminPanel' })
}
</script>

<template>
  <StackedLayout :links="links">
    <template #menu>
      <FwbNavbarLink v-if="canApproveUsers" @click.prevent="adminPanel" link="#"
        >Admin Panel</FwbNavbarLink
      >
      <FwbNavbarLink @click.prevent="logoutUser" link="#">Logout</FwbNavbarLink>
    </template>
  </StackedLayout>
</template>
