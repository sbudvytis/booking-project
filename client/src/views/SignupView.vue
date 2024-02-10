<script lang="ts" setup>
import { signup } from '@/stores/user'
import { ref } from 'vue'
import PageForm from '@/components/PageForm.vue'
import { FwbAlert, FwbButton, FwbInput, FwbSelect } from 'flowbite-vue'
import { DEFAULT_SERVER_ERROR } from '@/consts'
import AlertError from '@/components/AlertError.vue'

const userForm = ref({
  email: '',
  password: '',
  role: '',
  firstName: '',
  lastName: '',
})

const roles = [
  { value: 'dentist', name: 'Dentist' },
  { value: 'staff', name: 'Staff' },
]

const errorMessage = ref('')
const hasSucceeded = ref(false)
const successMessage = ref('')

async function submitSignup() {
  try {
    const response = await signup(userForm.value)

    errorMessage.value = ''

    // Check if the user is the first user
    if (response.id === 1) {
      successMessage.value =
        'You have successfully signed up! This profile will be used as the admin'
    } else {
      successMessage.value =
        'You have successfully signed up! Hang in there while we approve your profile'
    }

    hasSucceeded.value = true
  } catch (error) {
    console.log('ERROR WHILE SIGNING UP: ', error)
    errorMessage.value = error instanceof Error ? error.message : DEFAULT_SERVER_ERROR
  }
}
</script>

<template>
  <PageForm heading="Sign up for an account" formLabel="Signup" @submit="submitSignup">
    <template #default>
      <FwbInput label="First name" type="text" v-model="userForm.firstName" :required="true" />

      <FwbInput label="Last name" type="text" v-model="userForm.lastName" :required="true" />

      <FwbInput label="Email" type="email" v-model="userForm.email" :required="true" />

      <FwbInput
        label="Password"
        id="password"
        name="password"
        type="password"
        autocomplete="current-password"
        v-model="userForm.password"
        :required="true"
      />

      <FwbSelect
        label="Select your role"
        v-model="userForm.role"
        :options="roles"
        :required="true"
      />

      <FwbAlert v-if="hasSucceeded" data-testid="successMessage" type="success" class="text-center">
        {{ successMessage }}
      </FwbAlert>
      <AlertError :message="errorMessage">
        {{ errorMessage }}
      </AlertError>

      <div class="grid">
        <FwbButton color="default" type="submit" size="xl">Sign up</FwbButton>
      </div>
    </template>

    <template #footer>
      <FwbAlert class="bg-transparent text-center">
        Already a member?
        {{ ' ' }}
        <RouterLink
          :to="{ name: 'Login' }"
          class="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
          >Log in</RouterLink
        >
      </FwbAlert>
    </template>
  </PageForm>
</template>
