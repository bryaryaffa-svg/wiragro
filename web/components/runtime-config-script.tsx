import { unstable_noStore as noStore } from "next/cache";

import { serializePublicRuntimeConfig } from "@/lib/runtime-config";

export function RuntimeConfigScript() {
  noStore();

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `window.__KIOS_RUNTIME_CONFIG__ = ${serializePublicRuntimeConfig()};`,
      }}
      id="kios-runtime-config"
    />
  );
}
