import { getAllMongoCollectionsData } from "@/lib/utils/mongo/getAllMongoCollectionsData";
import FooterNavLink from "./FooterNavLink";
import AnimatedNavItem from "@/components/ui/shared/AnimatedNavItem/AnimatedNavItem";

export default async function FooterNavLinks({ linkClassName }) {
  const cols = await getAllMongoCollectionsData();
  const footerCols = cols.filter((col) => col.settings.navPlace === "footer");

  return (
    <div className="fc aic tac cp">
      {footerCols.map((col) => (
        <AnimatedNavItem className="h28" key={col._id}>
          <FooterNavLink
            key={col._id}
            {...{
              linkClassName: `${linkClassName} px15 -mx16 h28 pt5`,
              col,
            }}
          />
        </AnimatedNavItem>
      ))}
    </div>
  );
}
