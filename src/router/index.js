import Vue from 'vue'
import Router from 'vue-router'
import test from '@/views/test.vue'

Vue.use(Router)

export function createRouter() {
  return new Router({
    mode: 'history', // 注意这里也是为history模式
    routes: [
      {
        path: '/',
        name: 'test',
        component: test
      },
      {
        path: '/test',
        name: 'test',
        component: test
      }
      /*
      {
        path: '/test',
        name: 'Test',
        component: () => import('@/components/Test') // 异步组件
      }*/
    ]
  })
}
