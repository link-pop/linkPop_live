import { Alert as _Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Alert({
  icon = null,
  title = "",
  description = "",
  variant = "default",
  className = "",
}) {
  return (
    <_Alert variant={variant} className={className}>
      {icon && icon}
      {title && <AlertTitle>{title}</AlertTitle>}
      {description && <AlertDescription>{description}</AlertDescription>}
    </_Alert>
  );
}
