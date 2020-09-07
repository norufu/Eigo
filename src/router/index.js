import Vue from 'vue'
import Router from 'vue-router'
import axios from 'axios'
import HelloWorld from '@/components/HelloWorld'
import Login from '@/components/Login'
import Register from '@/components/Register'
import Study from '@/components/Study'
import UserBoard from '@/components/UserBoard'
import Admin from '@/components/Admin'
import Updateqs from '@/components/Updateqs'
import Learn from '@/components/Learn'
import Profile from '@/components/Profile'
import Words from '@/components/Words'

Vue.use(Router)

let router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: {
        guest: true
      }
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
      meta: {
        guest: true
      }
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/words',
      name: 'words',
      component: Words,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/dashboard',
      name: 'userboard',
      component: UserBoard,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/study',
      name: 'study',
      component: Study,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/learn',
      name: 'learn',
      component: Learn,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/admin',
      name: 'admin',
      component: Admin,
      meta: {
        requiresAuth: true,
        isadmin: true
      }
    },
    {
      path: '/updateqs',
      name: 'updateqs',
      component: Updateqs,
      meta: {
        requiresAuth: true
      }
    }
  ]
})

// if(to.meta.requiresAuth)
router.beforeEach(async (to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (localStorage.getItem('jwt') === null) {
      next({
        path: '/login',
        params: { nextUrl: to.fullPath }
      })
    } else if (await tokenOK() === false) {
      localStorage.clear()
      next({
        path: '/login',
        params: { nextUrl: to.fullPath }
      })
    } else {
      let user = JSON.parse(localStorage.getItem('user'))
      if (to.matched.some(record => record.meta.isadmin)) {
        if (user.isadmin === 1) {
          next()
        } else {
          next({name: 'userboard'})
        }
      } else {
        next()
      }
    }
  } else if (to.matched.some(record => record.meta.guest)) {
    if (localStorage.getItem('jwt') === null) {
      next()
    } else {
      next({name: 'userboard'})
    }
  } else {
    next()
  }
})

async function tokenOK () {
  let tokenValid = await axios.get('http://localhost:3000/checkUserToken', {params: {token: localStorage.getItem('jwt')}
  }).then(function (response) {
    return response.data
  }).catch(error => {
    console.log(error)
  })
  return tokenValid != null
}

export default router
