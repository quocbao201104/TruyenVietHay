/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_API_URL: string;
  readonly VITE_API_URL: string;
  readonly VITE_APP_IMAGE_URL: string;
}

declare module "*.vue" {
  import { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module "vue3-apexcharts" {
  import { DefineComponent } from "vue";
  const component: DefineComponent<{ options?: object; series?: object[]; type?: string; height?: number | string }>;
  export default component;
}
