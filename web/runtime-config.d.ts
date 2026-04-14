export {};

declare global {
  interface Window {
    __KIOS_RUNTIME_CONFIG__?: import("@/lib/runtime-config").PublicRuntimeConfig;
  }
}
