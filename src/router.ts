import { createRouter, createWebHistory } from 'vue-router';
const Laundry = () => import('@/pages/laundry/Laundry.vue');
const Food = () => import('@/pages/food/Food.vue');
const routes = [
  { path: '/', component: Food },
  { path: '/laundry', component: Laundry },
  { path: '/food', component: Food }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
