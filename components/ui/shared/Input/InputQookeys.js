"use client";

import { FloatingLabelInput } from "@/components/ui/shared/Input/FloatingLabelInput";
import useInputMemo from "./useInputMemo";
import useInputTypeNumberPreventScroll from "./useInputTypeNumberPreventScroll";

export default function InputQookeys(props) {
  const { onChange, defaultValue } = useInputMemo(props);
  const { inputTypeNumberPreventScroll } = useInputTypeNumberPreventScroll();
  const id = props.id || props.name;

  return (
    <div className={`r wf ${props.className || ""}`}>
      <FloatingLabelInput
        id={id}
        onWheel={inputTypeNumberPreventScroll}
        {...props}
        // must be after {...props}
        onChange={onChange}
        defaultValue={defaultValue()}
      />
    </div>
  );
}
