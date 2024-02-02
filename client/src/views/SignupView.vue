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
})

const roles = [
  { value: 'dentist', name: 'Dentist' },
  { value: 'staff', name: 'Staff' },
]

const hasSucceeded = ref(false)

const errorMessage = ref('')
async function submitSignup() {
  try {
    await signup(userForm.value)

    errorMessage.value = ''

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

      <FwbAlert v-if="hasSucceeded" data-testid="successMessage" type="success">
        You have successfully signed up! You can now log in.
        <RouterLink
          :to="{ name: 'Login' }"
          class="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
          >Go to the login page</RouterLink
        >
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
