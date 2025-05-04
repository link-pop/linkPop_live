import { Pencil } from "lucide-react";
import RoundIconButton from "@/components/ui/shared/RoundIconButton/RoundIconButton";

export default function LandingPageEditLink({ landingPageId }) {
  // Create edit URL for this landing page
  const editUrl = `/update/landingpages/${landingPageId}`;

  return (
    <RoundIconButton
      href={editUrl}
      extraClasses="poa t15 r65 justify-end mb-4 !maw600 mxa bg-background/80 backdrop-blur-sm shadow-sm"
      title="Edit Landing Page"
    >
      <Pencil size={16} className="dark:text-white" />
    </RoundIconButton>
  );
}
