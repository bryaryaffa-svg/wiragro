"use client";

import Script from "next/script";
import { useEffect, useEffectEvent, useRef, useState } from "react";

import { googleMapsApiKey } from "@/lib/config";

export interface GoogleAddressSelection {
  formattedAddress: string;
  addressLine: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
  destinationQuery: string;
}

function pickAddressComponent(
  components: google.maps.places.AddressComponent[] | undefined,
  candidates: string[],
) {
  const match = components?.find((component) =>
    component.types.some((type) => candidates.includes(type)),
  );

  return match?.longText?.trim() ?? match?.shortText?.trim() ?? "";
}

function joinNonEmpty(parts: Array<string | null | undefined>, separator = ", ") {
  return parts.map((part) => part?.trim()).filter(Boolean).join(separator);
}

function mapPlaceToSelection(place: google.maps.places.Place): GoogleAddressSelection | null {
  const formattedAddress = place.formattedAddress?.trim() ?? "";
  const components = place.addressComponents;

  const streetNumber = pickAddressComponent(components, ["street_number"]);
  const route = pickAddressComponent(components, ["route"]);
  const premise = pickAddressComponent(components, ["premise"]);
  const subpremise = pickAddressComponent(components, ["subpremise"]);
  const neighborhood = pickAddressComponent(components, [
    "neighborhood",
    "sublocality_level_2",
    "sublocality_level_1",
  ]);
  const village = pickAddressComponent(components, [
    "administrative_area_level_4",
    "administrative_area_level_5",
    "colloquial_area",
  ]);
  const district = pickAddressComponent(components, [
    "administrative_area_level_3",
    "administrative_area_level_4",
  ]);
  const city = pickAddressComponent(components, [
    "administrative_area_level_2",
    "locality",
  ]);
  const province = pickAddressComponent(components, ["administrative_area_level_1"]);
  const postalCode = pickAddressComponent(components, ["postal_code"]);

  const addressLine =
    joinNonEmpty([joinNonEmpty([streetNumber, route], " "), premise, subpremise, neighborhood, village]) ||
    formattedAddress;
  const destinationQuery =
    joinNonEmpty([village || neighborhood, district, city, province], " ") ||
    joinNonEmpty([district, city, province], " ") ||
    formattedAddress;

  if (!formattedAddress && !destinationQuery) {
    return null;
  }

  return {
    formattedAddress,
    addressLine,
    district,
    city,
    province,
    postalCode,
    destinationQuery,
  };
}

export function GooglePlacesAddressAssist({
  disabled = false,
  onSelect,
}: {
  disabled?: boolean;
  onSelect: (selection: GoogleAddressSelection) => void;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const autocompleteRef = useRef<google.maps.places.PlaceAutocompleteElement | null>(null);
  const selectHandlerRef = useRef<((event: Event) => void) | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handlePlaceSelect = useEffectEvent(async (event: Event) => {
    const selectEvent = event as google.maps.places.PlaceAutocompleteSelectEvent;
    const placePrediction = selectEvent.placePrediction;

    if (!placePrediction) {
      setStatusMessage("Alamat belum berhasil dipilih. Coba pilih ulang.");
      return;
    }

    try {
      const place = placePrediction.toPlace();
      await place.fetchFields({
        fields: ["formattedAddress", "addressComponents", "displayName"],
      });

      const selection = mapPlaceToSelection(place);
      if (!selection) {
        setStatusMessage("Alamat ditemukan, tetapi detailnya belum cukup untuk checkout.");
        return;
      }

      onSelect(selection);
      setStatusMessage(
        "Alamat terpilih. Form diisi otomatis dan tujuan RajaOngkir sedang disiapkan.",
      );
    } catch {
      setStatusMessage("Detail alamat Google belum berhasil dimuat. Anda masih bisa isi manual.");
    }
  });

  const mountAutocomplete = useEffectEvent(async () => {
    if (
      disabled ||
      !hostRef.current ||
      !googleMapsApiKey ||
      !window.google?.maps?.importLibrary
    ) {
      return;
    }

    try {
      await window.google.maps.importLibrary("places");

      hostRef.current.innerHTML = "";

      const element = document.createElement(
        "gmp-place-autocomplete",
      ) as unknown as google.maps.places.PlaceAutocompleteElement;

      element.setAttribute("included-region-codes", "id");
      element.setAttribute("requested-language", "id");
      element.setAttribute("requested-region", "id");

      const handleEvent = (event: Event) => {
        void handlePlaceSelect(event);
      };

      element.addEventListener("gmp-select", handleEvent);

      autocompleteRef.current = element;
      selectHandlerRef.current = handleEvent;
      hostRef.current.appendChild(element);
      setStatusMessage(null);
    } catch {
      setScriptError("Google Places belum berhasil diaktifkan. Anda masih bisa isi alamat manual.");
    }
  });

  useEffect(() => {
    if (!scriptReady || disabled) {
      return;
    }

    void mountAutocomplete();

    return () => {
      if (autocompleteRef.current && selectHandlerRef.current) {
        autocompleteRef.current.removeEventListener(
          "gmp-select",
          selectHandlerRef.current,
        );
      }
      autocompleteRef.current = null;
      selectHandlerRef.current = null;
    };
  }, [disabled, mountAutocomplete, scriptReady]);

  return (
    <div className="places-assist">
      {googleMapsApiKey ? (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places&loading=async&language=id&region=ID&v=weekly`}
          strategy="afterInteractive"
          onError={() => {
            setScriptError("Script Google Maps gagal dimuat. Anda masih bisa isi alamat manual.");
          }}
          onLoad={() => {
            setScriptReady(true);
            setScriptError(null);
          }}
        />
      ) : null}
      <div className="places-assist__header">
        <span className="eyebrow-label">Google Places</span>
        <strong>Cari alamat lebih cepat</strong>
      </div>
      {!googleMapsApiKey ? (
        <p className="inline-note">
          Autocomplete alamat Google belum aktif. Isi `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
          untuk menyalakannya.
        </p>
      ) : (
        <div className="places-assist__field">
          <div className="places-assist__widget" ref={hostRef} />
          <p className="inline-note">
            Pilih alamat dari Google Maps, lalu kecamatan, kota, dan kode pos akan terisi
            otomatis.
          </p>
        </div>
      )}
      {scriptError ? <p className="form-error">{scriptError}</p> : null}
      {statusMessage ? <p className="inline-note">{statusMessage}</p> : null}
    </div>
  );
}
