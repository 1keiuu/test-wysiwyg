import Vue from 'vue'
import App from './App.vue'
import VueQuillEditor from 'vue-quill-editor'

import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme
import Quill from "quill";
import ImageResize from "quill-image-resize-module";

Quill.register('modules/imageResize', ImageResize);

Vue.config.productionTip = false
Vue.use(VueQuillEditor, /* { default global options } */)

new Vue({
  render: h => h(App),
}).$mount('#app')


