const PRODUCT_IMAGE_OVERRIDES: Record<string, string> = {
  "teballo-250-sl-400-ml": "/product-gallery/teballo-250-sl-400ml.png",
  "gamectin-30-ec-500-ml": "/product-gallery/gamectin-30-ec-500ml.png",
  "v-protect-100-ml": "/product-gallery/v-protect-100ml.png",
  "super-kalium": "/product-gallery/super-kalium.png",
  "extra-grow-liquid-500-ml": "/product-gallery/extra-grow-liquid-500ml.png",
  "dimocel-400-sl": "/product-gallery/dimocel-400-sl.png",
  "super-calsium-liquid-500-ml": "/product-gallery/super-calsium-liquid-500ml.png",
  "fostin-610-ec-400-ml": "/product-gallery/fostin-610-ec-400ml.png",
};

export function getProductImageOverride(slug: string) {
  return PRODUCT_IMAGE_OVERRIDES[slug] ?? null;
}
