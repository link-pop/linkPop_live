import ResponsiveTextClassesDemo from "./ResponsiveTextClassesDemo";
import { Slider } from "../ui/shared/Slider/Slider";
import SelectMulti from "../ui/shared/Select/SelectMulti";
import Carousel from "../ui/shared/Carousel/Carousel";
import { SmartDatetimeInput } from "../ui/shared/SmartDatetimeInput/SmartDatetimeInput";

// show new components here that are not in the Shadcn ui library by default
export default function NewShadcnComponentDemos() {
  return (
    <div className="p-4 md:p-8 space-y-8">
      <SmartDatetimeInput
        name="datetime"
        label="Select Date and Time"
        placeholder="e.g. tomorrow at 3pm"
      />
      <SelectMulti
        name="tags"
        // ! 1
        availableOptions={[
          { value: "todo", label: "Todo" },
          { value: "in progress", label: "In Progress" },
          { value: "done", label: "Done" },
          { value: "canceled", label: "Canceled" },
        ]}
        // ! 2
        selectedValues={[{ value: "backlog", label: "Backlog" }]}
      />
      <Slider />
      <Carousel
        className="w500"
        files={[
          { fileUrl: "https://picsum.photos/400/400?random=1" },
          { fileUrl: "https://picsum.photos/400/400?random=2" },
          { fileUrl: "https://picsum.photos/400/400?random=3" },
        ]}
      />
      <ResponsiveTextClassesDemo />
    </div>
  );
}
