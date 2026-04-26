export type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    __wiragroAnalyticsQueue?: Array<{
      event: string;
      payload: AnalyticsPayload;
      timestamp: string;
    }>;
  }
}

export function trackUiEvent(event: string, payload: AnalyticsPayload = {}) {
  if (typeof window === "undefined") {
    return;
  }

  const entry = {
    event,
    payload,
    timestamp: new Date().toISOString(),
  };

  window.__wiragroAnalyticsQueue = window.__wiragroAnalyticsQueue ?? [];
  window.__wiragroAnalyticsQueue.push(entry);
  window.dispatchEvent(new CustomEvent("wiragro:analytics", { detail: entry }));
}
