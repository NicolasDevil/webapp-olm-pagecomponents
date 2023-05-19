import Vue from 'vue'
import components from "@config/components"
import App from './App.vue'

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')

const install = function(Vue, opts = {}) {
  if (install.installed) return;
  components.map(component => {
    Vue.component(component.name, component);
  });

  Vue.use(Loading.directive);

  Vue.prototype.$loading = Loading.service;
  Vue.prototype.$msgbox = MessageBox;
  Vue.prototype.$alert = MessageBox.alert;
  Vue.prototype.$confirm = MessageBox.confirm;
  Vue.prototype.$prompt = MessageBox.prompt;
  Vue.prototype.$notify = Notification;
  Vue.prototype.$message = Message;
};