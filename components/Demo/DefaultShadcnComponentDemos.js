import Accordion from "../ui/shared/Accordion/Accordion";
import Alert from "../ui/shared/Alert/Alert";

export default function DefaultShadcnComponentDemos() {
  return (
    <>
      <Accordion
        className="maw500 wf mxa my15"
        items={[
          { trigger: "Title 1", content: "Content 1" },
          { trigger: "Title 2", content: "Content 2" },
          { trigger: "Title 3", content: "Content 3" },
        ]}
      />
      <Alert
        className="maw500 wf mxa my15"
        icon={"👋"}
        title="Title"
        description="Description"
        // variant="destructive"
      />
    </>
  );
}
