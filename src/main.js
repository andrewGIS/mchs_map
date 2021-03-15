import Vue from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import 'leaflet/dist/leaflet.css';
import HighchartsVue from 'highcharts-vue'
import PortalVue from 'portal-vue'


Vue.config.productionTip = false;

Vue.use(HighchartsVue)
Vue.use(PortalVue)

new Vue({
  vuetify,
  render: h => h(App)
}).$mount("#app");
