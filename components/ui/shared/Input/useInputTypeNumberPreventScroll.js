export default function useInputTypeNumberPreventScroll() {

  function inputTypeNumberPreventScroll(e) {
    if (e.target.type !== "number") return
    e.target.blur()
    e.stopPropagation()
  }

  return { inputTypeNumberPreventScroll }
}