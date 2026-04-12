import { createRouter, createWebHashHistory } from 'vue-router';
import OffboardingView from './views/OffboardingView.vue';
import OnboardingView from './views/OnboardingView.vue';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/offboarding'
    },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: OnboardingView
    },
    {
      path: '/offboarding',
      name: 'offboarding',
      component: OffboardingView
    }
  ]
});

export default router;
