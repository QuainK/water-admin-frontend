import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Welcome',
    component() {
      return import('../views/Welcome')
    }
  },
  {
    path: '/TableLocation',
    name: 'TableLocation',
    component() {
      return import('../views/TableLocation')
    }
  },
  {
    path: '/TableRecord',
    name: 'TableRecord',
    component() {
      return import('../views/TableRecord')
    }
  },
  {
    path: '/Map',
    name: 'Map',
    component() {
      return import('../views/Map')
    }
  },
]

const router = new VueRouter({
  routes
})

export default router
