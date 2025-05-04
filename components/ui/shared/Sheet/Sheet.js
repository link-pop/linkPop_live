import { Button } from "@/components/ui/button";
import {
  Sheet as _Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Sheet({
  openBtnText,
  openBtnVariant = "ghost",
  title,
  description,
  children,
  closeBtnText,
  sheetTrigger,
  sheetContentClassName = "oya !w-[320px] !max-w-[320px]",
}) {
  return (
    <_Sheet>
      {sheetTrigger ? (
        <SheetTrigger asChild>{sheetTrigger}</SheetTrigger>
      ) : (
        <SheetTrigger asChild>
          <Button variant={openBtnVariant}>{openBtnText}</Button>
        </SheetTrigger>
      )}
      <SheetContent
        overlayClassName="bg-transparent"
        className={sheetContentClassName}
      >
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        {children}
        <SheetFooter>
          {closeBtnText && (
            <SheetClose asChild>
              <Button type="submit">{closeBtnText}</Button>
            </SheetClose>
          )}
        </SheetFooter>
      </SheetContent>
    </_Sheet>
  );
}
