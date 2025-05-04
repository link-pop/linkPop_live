import {
  Accordion as _Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Keep track of currently open accordion
let currentOpenAccordion = null;

export default function Accordion({
  items = [],
  type = "single",
  collapsible = true,
  className = "w-full",
  closeOthers = true,
}) {
  const handleTriggerClick = (e) => {
    // Only close others if closeOthers prop is true
    if (closeOthers) {
      // If there's a currently open accordion and it's not this one, close it
      if (currentOpenAccordion && currentOpenAccordion !== e.currentTarget) {
        currentOpenAccordion.click();
      }
      // Update the currently open accordion
      currentOpenAccordion = e.currentTarget;
    }
  };

  return (
    <_Accordion type={type} collapsible={collapsible} className={className}>
      {items.map((item, index) => (
        <AccordionItem
          key={item.value || `item-${index + 1}`}
          value={item.value || `item-${index + 1}`}
          className="border-b border-black-200/20 last:border-b-0"
        >
          <AccordionTrigger
            onClick={handleTriggerClick}
            className="f fwn py-6 px-6 font-medium text-lg hover:underline data-[state=open]:underline data-[state=open]:brand transition-colors block w-full text-center sm:text-left"
          >
            {item.trigger}
          </AccordionTrigger>
          <AccordionContent className="px-6 py-4 text-black-100/90">
            {item.content}
          </AccordionContent>
        </AccordionItem>
      ))}
    </_Accordion>
  );
}
