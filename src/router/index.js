import Vue from 'vue'
import Router from 'vue-router'
import store from '../store'
//首页
import Index from '@/components/index'
//import { Indicator } from 'mint-ui'

Vue.use(Router)
export default new Router({
	mode:'history',  //mode设置为"history"时，链接中没有#
  routes: [
    {
      path: '/',
      name: 'index',
      component: Index
    }
  ]
})
