"use client";

import type { CommerceTrackingPayload } from "@/lib/growth-commerce";

const EVENT_STORAGE_KEY = "wiragro:commerce-events";
const IMPRESSION_STORAGE_KEY = "wiragro:commerce-impressions";
const MAX_STORED_EVENTS = 30;
const MAX_STORED_IMPRESSIONS = 60;

type StoredCommerceEvent = CommerceTrackingPayload & {
  capturedAt: string;
  event: CommerceTrackingPayload["eventName"];
};

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

function readSessionList(key: string) {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.sessionStorage.getItem(key);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSessionList(key: string, value: unknown[]) {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage failures so commerce CTAs never become brittle.
  }
}

function createTrackingEvent(
  payload: CommerceTrackingPayload,
  eventType: CommerceTrackingPayload["eventType"],
): StoredCommerceEvent {
  const eventName =
    eventType === "impression"
      ? "wiragro_whatsapp_intent_impression"
      : "wiragro_whatsapp_intent_click";

  return {
    ...payload,
    eventName,
    eventType,
    event: eventName,
    capturedAt: new Date().toISOString(),
  };
}

function pushTrackingEvent(eventPayload: StoredCommerceEvent) {
  if (typeof window === "undefined") {
    return;
  }

  const storedEvents = readSessionList(EVENT_STORAGE_KEY);
  const nextEvents = [...storedEvents, eventPayload].slice(-MAX_STORED_EVENTS);
  writeSessionList(EVENT_STORAGE_KEY, nextEvents);

  window.dispatchEvent(
    new CustomEvent("wiragro:commerce", {
      detail: eventPayload,
    }),
  );

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push(eventPayload);
  }
}

function markImpressionOnce(payload: CommerceTrackingPayload) {
  if (typeof window === "undefined") {
    return false;
  }

  const impressionKey = `${payload.leadRef}|${payload.targetUrl}`;
  const storedKeys = readSessionList(IMPRESSION_STORAGE_KEY);

  if (storedKeys.includes(impressionKey)) {
    return false;
  }

  const nextKeys = [...storedKeys, impressionKey].slice(-MAX_STORED_IMPRESSIONS);
  writeSessionList(IMPRESSION_STORAGE_KEY, nextKeys);
  return true;
}

export function trackCommerceIntentImpression(payload: CommerceTrackingPayload) {
  if (typeof window === "undefined") {
    return;
  }

  if (!markImpressionOnce(payload)) {
    return;
  }

  pushTrackingEvent(createTrackingEvent(payload, "impression"));
}

export function trackCommerceIntentClick(payload: CommerceTrackingPayload) {
  if (typeof window === "undefined") {
    return;
  }

  pushTrackingEvent(createTrackingEvent(payload, "click"));
}
