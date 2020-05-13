import Vue from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import 'leaflet/dist/leaflet.css';
import HighchartsVue from 'highcharts-vue'

Vue.config.productionTip = false;

Vue.use(HighchartsVue)

new Vue({
  vuetify,
  render: h => h(App)
}).$mount("#app");