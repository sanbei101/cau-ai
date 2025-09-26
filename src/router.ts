import { createRouter, createWebHistory } from 'vue-router';
const Index = () => import('@/pages/index.vue');
const routes = [{ path: '/', component: Index }];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
