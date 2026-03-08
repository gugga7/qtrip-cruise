/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY: string;
  readonly VITE_MAPBOX_TOKEN: string;
  readonly VITE_OPENWEATHER_API_KEY: string;
  readonly VITE_AVIATION_API_KEY: string;
  readonly VITE_APP_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 