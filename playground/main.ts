import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import "./playground.css";

createApp(App).use(createPinia()).mount("#app");
