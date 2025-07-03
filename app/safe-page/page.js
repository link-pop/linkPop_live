import ClickForSupport from "@/components/ui/shared/ClickForSupport/ClickForSupport";
import Image from "next/image";

export default function SafePage() {
  return (
    <div className="min-h-[80dvh] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Using a cute robot SVG from public folder */}
        <div className="relative w-48 h-48 mx-auto">
          <Image
            src="/img/safe-robot.svg"
            alt="Friendly Robot"
            fill
            priority
            className="object-contain"
          />
        </div>

        <h1 className="text-2xl font-semibold text-foreground">
          You are on the safe page
        </h1>

        <p className="text-muted-foreground">
          Because we think you might be a bot. If you think this is a mistake,
          please contact our support team.
        </p>

        <div className="mt-8">
          <ClickForSupport
            mini={true}
            supportSectionTitle="Need help?"
            supportSectionText="Our support team is here to help you resolve this issue."
            buttonText="Contact Support"
          />
        </div>
      </div>
    </div>
  );
}
