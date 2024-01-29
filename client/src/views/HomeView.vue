<script lang="ts" setup>
import {
  FwbButton,
  FwbAccordion,
  FwbAccordionContent,
  FwbAccordionHeader,
  FwbAccordionPanel,
  FwbRating,
  FwbToast,
  FwbTimeline,
  FwbTimelineBody,
  FwbTimelineContent,
  FwbTimelineItem,
  FwbTimelinePoint,
  FwbTimelineTitle,
} from 'flowbite-vue'
</script>

<template>
  <div class="bg-white">
    <section
      class="rounded-3xl bg-gray-900 bg-[url('/src/assets/img-1.png')] bg-cover bg-blend-overlay"
    >
      <div class="mx-auto max-w-screen-xl px-4 py-24 text-center lg:py-56">
        <h1
          class="mb-14 text-4xl font-extrabold leading-none tracking-tight text-white md:text-5xl lg:text-6xl"
        >
          Planning your day has never been easier
        </h1>
        <p class="mb-8 text-lg font-normal text-gray-300 sm:px-16 lg:px-48 lg:text-xl">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis nec aliquet orci. Donec
          sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc,
          quis gravida magna mi a libero.
        </p>
        <div class="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0">
          <div class="flex flex-col gap-5 sm:flex-row sm:justify-center sm:space-y-0">
            <FwbButton
              component="RouterLink"
              tag="router-link"
              size="xl"
              color="yellow"
              :href="{ name: 'Signup' } as any"
            >
              Get started
            </FwbButton>
            <FwbButton
              component="RouterLink"
              tag="router-link"
              size="xl"
              color="alternative"
              :href="{ name: 'Login' } as any"
            >
              Log in
            </FwbButton>
          </div>
        </div>
      </div>
    </section>
    <div class="mx-auto max-w-screen-xl px-4 py-5 lg:py-5">
      <fwb-timeline>
        <fwb-timeline-item>
          <fwb-timeline-point />
          <fwb-timeline-content>
            <fwb-timeline-title> Create your schedule </fwb-timeline-title>
            <fwb-timeline-body>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis nec aliquet orci. Donec
              sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus
              nunc, quis gravida magna mi a libero.
            </fwb-timeline-body>
          </fwb-timeline-content>
        </fwb-timeline-item>
        <fwb-timeline-item>
          <fwb-timeline-point />
          <fwb-timeline-content>
            <fwb-timeline-title> Create appointments </fwb-timeline-title>
            <fwb-timeline-body>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis nec aliquet orci. Donec
              sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus
              nunc, quis gravida magna mi a libero.
            </fwb-timeline-body>
          </fwb-timeline-content>
        </fwb-timeline-item>
        <fwb-timeline-item>
          <fwb-timeline-point />
          <fwb-timeline-content>
            <fwb-timeline-title> Manage your time like a boss </fwb-timeline-title>
            <fwb-timeline-body>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis nec aliquet orci. Donec
              sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus
              nunc, quis gravida magna mi a libero.
            </fwb-timeline-body>
          </fwb-timeline-content>
        </fwb-timeline-item>
      </fwb-timeline>
    </div>
    <div class="bg-white dark:bg-gray-800">
      <fwb-accordion flush>
        <fwb-accordion-panel>
          <fwb-accordion-header>Trusted by many users</fwb-accordion-header>
          <fwb-accordion-content>
            <div>
              <fwb-rating :rating="1" :scale="1" review-link="#" review-text="1713 reviews">
                <template #besideText>
                  <p class="ml-2 text-sm font-bold text-gray-900 dark:text-white">4.95</p>
                </template>
              </fwb-rating>
            </div>
          </fwb-accordion-content>
        </fwb-accordion-panel>
        <fwb-accordion-panel>
          <fwb-accordion-header>Benefits of using Dentist scheduler</fwb-accordion-header>
          <fwb-accordion-content>
            <div>
              <fwb-toast type="warning"> Never lose track of your time. </fwb-toast>
              <fwb-toast type="success"> Lorem ipsum dolor sit amet. </fwb-toast>
              <fwb-toast type="danger"> Lorem ipsum dolor sit amet. </fwb-toast>
            </div>
          </fwb-accordion-content>
        </fwb-accordion-panel>
      </fwb-accordion>
    </div>
  </div>
</template>
