const LOGO_PATH = "/branding/Vector.svg";

export function Logo({
  alt = "MealOK",
  className,
}: {
  alt?: string;
  className?: string;
}) {
  return <img src={LOGO_PATH} alt={alt} className={className} />;
}
