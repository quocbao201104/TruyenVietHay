// src/main.ts
import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import router from "./router/index";
import { ToastPlugin } from "./plugins/toast";
import vue3GoogleLogin from "vue3-google-login";

import "./assets/styles/global.css";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(ToastPlugin);
app.use(vue3GoogleLogin, {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || ""
});

app.mount("#app");