import Vue from 'vue'
import TestCom from '@/test/index.js'
import App from './App.vue'

Vue.config.productionTip = false
Vue.use(TestCom)

new Vue({
  render: h => h(App),
}).$mount('#app')
