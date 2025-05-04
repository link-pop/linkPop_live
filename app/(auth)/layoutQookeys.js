import Logo from "@/components/Nav/Header/Logo";

const Layout = ({ children }) => {
  return (
    <dic className="👋 fc aic">
      <Logo className="fcc mxa mt15" />
      <div className="fcc fz12 gray tac px15">
        To store your data in our app, you need to have an account.
      </div>
      <div className="mxa my15">{children}</div>
    </dic>
  );
};

export default Layout;
