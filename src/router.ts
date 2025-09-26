import { createRouter, createWebHistory } from 'vue-router';
const Laundry = () => import('@/pages/laundry/Laundry.vue');
const routes = [
  { path: '/', component: Laundry },
  { path: '/laundry', component: Laundry }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
