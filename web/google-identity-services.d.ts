export {};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            use_fedcm_for_prompt?: boolean;
            context?: "signin" | "signup" | "use";
            ux_mode?: "popup" | "redirect";
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: "standard" | "icon";
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              text?:
                | "signin_with"
                | "signup_with"
                | "continue_with"
                | "signin";
              shape?: "rectangular" | "pill" | "circle" | "square";
              width?: number;
              logo_alignment?: "left" | "center";
            },
          ) => void;
          prompt: (
            momentListener?: (notification: GooglePromptMomentNotification) => void,
          ) => void;
          cancel: () => void;
          disableAutoSelect: () => void;
        };
      };
      maps: {
        importLibrary: (
          name: "places",
        ) => Promise<google.maps.PlacesLibrary>;
      };
    };
  }

  interface GoogleCredentialResponse {
    credential?: string;
    select_by?: string;
  }

  interface GooglePromptMomentNotification {
    isNotDisplayed?: () => boolean;
    isSkippedMoment?: () => boolean;
    isDismissedMoment?: () => boolean;
    getNotDisplayedReason?: () => string;
    getSkippedReason?: () => string;
    getDismissedReason?: () => string;
  }

  namespace google.maps {
    interface PlacesLibrary {
      PlaceAutocompleteElement: typeof google.maps.places.PlaceAutocompleteElement;
    }
  }

  namespace google.maps.places {
    class PlaceAutocompleteElement extends HTMLElement {}

    interface PlaceAutocompleteSelectEvent extends Event {
      placePrediction: PlacePrediction;
    }

    interface PlacePrediction {
      toPlace(): Place;
    }

    interface Place {
      formattedAddress?: string;
      displayName?: string;
      addressComponents?: AddressComponent[];
      fetchFields: (request: { fields: string[] }) => Promise<void>;
    }

    interface AddressComponent {
      longText?: string;
      shortText?: string;
      types: string[];
    }
  }
}
