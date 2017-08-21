// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import Vuex from 'Vuex';
import App from './App';
import router from './router';
import store from './store';
import './filters';
import './mixin';
import Mint from 'mint-Ui';
import 'mint-ui/lib/style.css';
import VueAwesomeSwiper from 'vue-awesome-swiper';
Vue.config.productionTip = false

Vue.use(Mint);
Vue.use(VueAwesomeSwiper);
//Vue.use(Vuex);
Vue.component('fallback', resolve => resolve(require('./components/fallback')));
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
