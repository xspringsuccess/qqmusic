<template>
  <div id="app">
    <router-view></router-view>
    <play-fixed></play-fixed>
    <!-- <component :is="showlist && 'listview'"></component> -->
  </div>
</template>

<script>
	import store from './store';
  import { mapState } from 'vuex';
export default {
  name: 'app',
  data() {
    return {
      prevRoutes: []
    }
  },
  components: {
  	playFixed(resolve) {
  		require(['@/components/play-fixed.vue'], resolve);//懒加载
  	}
  }
}
</script>


