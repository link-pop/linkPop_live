import { Card, CardContent } from "@/components/ui/card";
import StarRating from "@/components/ui/shared/StarRating/StarRating";
import { QuoteIcon } from "./QuoteIcon";

export default function Testimonial({
  quote,
  author,
  location,
  rating,
  className = "",
  createdBy,
}) {
  return (
    <Card className={`relative bg-card pt15 ${className}`}>
      <QuoteIcon className="absolute t20 l25 opacity-[0.08]" />
      <QuoteIcon className="absolute r20 b20 rotate-180 opacity-10" />
      <CardContent className="p-6 space-y-4">
        <p className="text-muted-foreground fsi fz15">{quote}</p>
        <div className="space-y-2">
          {rating > 0 && (
            <div className="flex items-center gap-2">
              <StarRating readonly={true} rating={rating} totalStars={5} />
              <span className="font-medium">{rating}.0</span>
            </div>
          )}
          {createdBy ? (
            <div className="f aic g5">
              {createdBy}-
              <div className="text-sm text-muted-foreground">{location}</div>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="font-semibold">{author}</div>
            </div>
          )}
          {!createdBy && (
            <div className="text-sm text-muted-foreground">{location}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
