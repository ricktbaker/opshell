import Vue from 'vue';
import axios from 'axios';

import App from './App';
import router from './router';
import store from './store';

import db from './datastore';

import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/css/font-awesome.css';
import 'jquery/dist/jquery.min.js';
import 'bootstrap/dist/js/bootstrap.js';
import 'xterm/dist/xterm.js';

if (!process.env.IS_WEB) Vue.use(require('vue-electron'));
Vue.http = Vue.prototype.$http = axios;
Vue.prototype.$db = db;
Vue.config.productionTip = false;

global.jQuery = require('jquery');
var $ = global.jQuery;
window.$ = $;

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app');
