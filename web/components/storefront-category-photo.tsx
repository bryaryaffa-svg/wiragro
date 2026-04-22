import Image from "next/image";

export function StorefrontCategoryPhoto({
  alt,
  className,
  sizes,
  src,
}: {
  alt: string;
  className?: string;
  sizes: string;
  src: string;
}) {
  return (
    <div className={className ? `storefront-category-photo ${className}` : "storefront-category-photo"}>
      <Image
        alt={alt}
        className="storefront-category-photo__image"
        fill
        sizes={sizes}
        src={src}
      />
    </div>
  );
}
