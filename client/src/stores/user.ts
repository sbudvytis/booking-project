import {
  clearStoredAccessToken,
  clearSelectedId,
  clearActiveTab,
  getStoredAccessToken,
  getUserIdFromToken,
  storeAccessToken,
  getUserFromToken,
} from '@/utils/auth'
import { trpc } from '@/trpc'
import { computed, ref } from 'vue'

const authToken = ref(getStoredAccessToken(localStorage))

export const authUserId = computed(() =>
  authToken.value ? getUserIdFromToken(authToken.value) : null
)

export const isLoggedIn = computed(() => !!authToken.value)

export async function login(userLogin: { email: string; password: string }) {
  const { accessToken } = await trpc.user.login.mutate(userLogin)

  authToken.value = accessToken
  storeAccessToken(localStorage, accessToken)
}

export function logout() {
  authToken.value = null
  clearStoredAccessToken(localStorage)
  clearSelectedId(localStorage)
  clearActiveTab(localStorage)
}

export const signup = trpc.user.signup.mutate

export const canApproveUsers = computed(() =>
  authToken.value ? getUserFromToken(authToken.value).permissions.includes('APPROVE_USERS') : false
)

export const canViewAllSchedules = computed(() =>
  authToken.value
    ? getUserFromToken(authToken.value).permissions.includes('VIEW_ALL_SCHEDULES')
    : false
)

export const isDentist = computed(() =>
  authToken.value ? getUserFromToken(authToken.value).role === 'dentist' : false
)
