import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import PlaceholderView from '../views/PlaceholderView.vue'
import NotFoundView from '../views/NotFoundView.vue'

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
    component: PlaceholderView,
    props: {
      eyebrow: 'Wellbeing support sessions',
      title: 'Choose support that fits around your caring role.',
      description:
        'Young carers will be able to browse online and in-person wellbeing sessions and make a private booking.',
      stage: 'Session data and booking actions will be introduced after authentication.',
    },
    meta: { title: 'Wellbeing sessions' },
  },
  {
    path: '/community',
    name: 'community',
    component: PlaceholderView,
    props: {
      eyebrow: 'Peer community',
      title: 'Meet people who understand the caring journey.',
      description:
        'Explore regular peer support circles designed to be respectful, low-pressure, and welcoming.',
      stage: 'Circle listings, joining, and ratings will be implemented in later A2 stages.',
    },
    meta: { title: 'Peer community' },
  },
  {
    path: '/register',
    name: 'register',
    component: PlaceholderView,
    props: {
      eyebrow: 'Create an account',
      title: 'Start with a private CareBloom account.',
      description:
        'Registration will let young carers manage bookings, join circles, and keep their support information together.',
      stage: 'The validated registration form will be implemented in the authentication stage.',
    },
    meta: { title: 'Register' },
  },
  {
    path: '/login',
    name: 'login',
    component: PlaceholderView,
    props: {
      eyebrow: 'Welcome back',
      title: 'Log in to continue your support journey.',
      description:
        'The login page will provide access to bookings, joined circles, and account details.',
      stage: 'Login, logout, and account persistence will be implemented in the authentication stage.',
    },
    meta: { title: 'Log in' },
  },
  {
    path: '/account',
    name: 'account',
    component: PlaceholderView,
    props: {
      eyebrow: 'My account',
      title: 'Your support activity in one calm place.',
      description:
        'Authenticated users will be able to review their bookings, joined circles, and account details here.',
      stage: 'This route will be protected when authentication is added.',
    },
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
