/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';

  const component: DefineComponent<Record<string, never>, Record<string, never>, unknown>;
  export default component;
}

interface GoogleAppsScriptRunner {
  withSuccessHandler(handler: (value: unknown) => void): GoogleAppsScriptRunner;
  withFailureHandler(handler: (error: Error) => void): GoogleAppsScriptRunner;
  [functionName: string]: ((...args: unknown[]) => void) | unknown;
}

interface GoogleAppsScriptApi {
  run: GoogleAppsScriptRunner;
}

declare global {
  interface Window {
    google?: {
      script?: GoogleAppsScriptApi;
    };
  }

  const google:
    | {
        script?: GoogleAppsScriptApi;
      }
    | undefined;
}

export {};
