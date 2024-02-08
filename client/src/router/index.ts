import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { authenticate } from './guards'
import HomeLayout from '@/layouts/HomeLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/dashboard',
      component: DashboardLayout,
      beforeEnter: [authenticate],
      children: [
        {
          path: '',
          name: 'Dashboard',
          component: () => import('../views/DashboardView.vue'),
        },
        {
          path: 'schedule/create',
          name: 'scheduleCreate',
          component: () => import('../views/ScheduleCreateView.vue'),
        },
        {
          path: 'schedule/edit/:scheduleId',
          name: 'scheduleEdit',
          component: () => import('../views/ScheduleEditView.vue'),
          props: true,
        },
        {
          path: 'appointment/create',
          name: 'appointmentCreate',
          component: () => import('../views/AppointmentCreateView.vue'),
          props: true,
        },
        {
          path: 'appointment/edit/:id',
          name: 'appointmentEdit',
          component: () => import('../views/AppointmentEditView.vue'),
        },
        {
          path: 'schedule/all',
          name: 'scheduleAll',
          component: () => import('../views/AllSchedulesView.vue'),
        },
        {
          path: 'adminpanel',
          name: 'adminPanel',
          component: () => import('../views/AdminDashboardView.vue'),
        },
      ],
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/signup',
      name: 'Signup',
      component: () => import('../views/SignupView.vue'),
    },
    {
      path: '',
      component: HomeLayout,
      children: [
        {
          path: '',
          name: 'Home',
          component: HomeView,
        },
      ],
    },
  ],
})

export default router
