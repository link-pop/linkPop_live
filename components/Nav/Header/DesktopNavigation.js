import HeaderNavigationMenu from "@/components/Nav/Header/HeaderNavigationMenu";

export default function DesktopNavigation({ isAdmin }) {
  return (
    <nav className="hidden min-[1200px]:fcc g50 w-[80%] mxa">
      <HeaderNavigationMenu type="desktop" {...{ isAdmin }} />
    </nav>
  );
}
