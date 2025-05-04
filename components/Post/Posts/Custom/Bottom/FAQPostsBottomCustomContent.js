"use client";

import Lottie from "lottie-react";
import faqAnimation from "@/public/animation/faq.json";

export default function FAQPostsBottomCustomContent({ col }) {
  if (col.name !== "faqs") return null;

  return null;
  // <div className="fcc my60">
  //   <Lottie
  //     animationData={faqAnimation}
  //     loop={true}
  //     style={{ maxWidth: 380, width: "100%" }}
  //   />

  //   <div className="maw335 px30">
  //     <div className="fw600 t_125 sm:t_15 mb15">
  //       Activate Your Apps with a Peace of Mind
  //     </div>
  //     <div className="gray t_1 sm:t_125">
  //       Live chat support, free after sales support and money back guarantee{" "}
  //       <i>*for selected products.</i>
  //     </div>
  //   </div>
  // </div>
}
