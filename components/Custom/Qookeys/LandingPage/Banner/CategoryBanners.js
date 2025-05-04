import ExpandableSlider from "@/components/ui/shared/ExpandableSlider/ExpandableSlider";
import {
  BannerIllustrator,
  BannerIllustratorShrink,
} from "./BannerIllustrator";
import { BannerOffice, BannerOfficeShrink } from "./BannerOffice";
import { BannerPhotoshop, BannerPhotoshopShrink } from "./BannerPhotoshop";
import { BannerWindows, BannerWindowsShrink } from "./BannerWindows";

export default function CategoryBanners() {
  const items = [
    {
      component: <BannerWindows />,
      shrink: <BannerWindowsShrink />,
    },
    {
      component: <BannerOffice />,
      shrink: <BannerOfficeShrink />,
    },
    {
      component: <BannerPhotoshop />,
      shrink: <BannerPhotoshopShrink />,
    },
    {
      component: <BannerIllustrator />,
      shrink: <BannerIllustratorShrink />,
    },
  ];

  return (
    <ExpandableSlider className={`h484 wf`} id="categories" list={items} />
  );
}
