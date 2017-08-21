import Vue from 'vue'
import Router from 'vue-router'
import store from '../store'
//首页

//import { Indicator } from 'mint-ui'

Vue.use(Router)
export default new Router({
	mode:'history',  
	routes: [
	  {
	    path: '/',
	    name: 'index',
	    component(resolve) {
	  		require(['@/components/index'],resolve);//懒加载
	    }
	  },
	  {
      	path: '/topList',
      	name: 'topList',
      	component(resolve) {
        	require(['@/components/topList'], resolve);
      	}
      },
	  {
	  	path: '/rankList/:id',
	  	name: 'rankList',
	  	component(resolve) {
	  		require(['@/components/rankList'],resolve)
	  	}
	  },
	  {
      	path: '/recommend/:id',
      	name: 'recommend',
      	component(resolve) {
        	require(['@/components/recommend'], resolve)
      	}
      },
	  /*{
      	path: '/playing',
      	name: 'playing',
      	meta: {
        	noPageAnimation: true
      	},
      	beforeEnter(to, from, next) {
        	store.state.playing.songlist.length > 0 && next();
      	},
      	component(resolve) {
        	require(['@/components/playing'], resolve)
       	}
      }*/
	]
})
