import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import PlaceholderView from '../views/PlaceholderView.vue'
import NotFoundView from '../views/NotFoundView.vue'
import SessionsView from '../views/SessionsView.vue'
import CommunityView from '../views/CommunityView.vue'
import RegisterView from '../views/RegisterView.vue'
import LoginView from '../views/LoginView.vue'
import AccountView from '../views/AccountView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { title: 'Home' },
  },
  {
    path: '/about',
    name: 'about',
    component: PlaceholderView,
    props: {
      eyebrow: 'About young carers',
      title: 'Caring for someone should not mean caring alone.',
      description:
        'This page will explain who young carers are, the pressures they may experience, and the kind of wellbeing support CareBloom provides.',
      stage: 'Content and resources will be added in the dynamic data stage.',
    },
    meta: { title: 'About young carers' },
  },
  {
    path: '/support',
    name: 'support',
    component: PlaceholderView,
    props: {
      eyebrow: 'Find nearby support',
      title: 'Discover welcoming support close to you.',
      description:
        'Browse fictional wellbeing services, charity locations, and peer support circles by area and support type.',
      stage: 'Search, filters, and dynamic service cards will be added in a later stage.',
    },
    meta: { title: 'Find nearby support' },
  },
  {
    path: '/sessions',
    name: 'sessions',
    component: SessionsView,
    meta: { title: 'Wellbeing sessions' },
  },
  {
    path: '/community',
    name: 'community',
    component: CommunityView,
    meta: { title: 'Peer community' },
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { title: 'Register' },
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { title: 'Log in' },
  },
  {
    path: '/account',
    name: 'account',
    component: AccountView,
    meta: { title: 'My account', futureAuth: true },
  },
  {
    path: '/admin',
    name: 'admin',
    component: PlaceholderView,
    props: {
      eyebrow: 'Charity staff',
      title: 'CareBloom administration dashboard.',
      description:
        'Authorised charity staff will use this area to review users, bookings, activities, and rating summaries.',
      stage: 'This route will be protected by both authentication and the admin role.',
    },
    meta: { title: 'Admin dashboard', futureRole: 'admin' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
    meta: { title: 'Page not found' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  document.title = `${to.meta.title ?? 'Support'} | CareBloom`
})

export default router
