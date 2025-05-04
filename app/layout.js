import { Sora } from "next/font/google";
import "./globals.css";
import { ContextProvider } from "@/components/Context/Context";
import { CartProvider } from "@/components/Cart/CartContext";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/Nav/Header/Header";
import Toast from "@/components/ui/shared/Toast/Toast";
import AlertDialog from "@/components/ui/shared/AlertDialog/AlertDialog";
import Footer from "@/components/Nav/Footer/Footer";
import AppLoader from "@/components/ui/shared/AppLoader/AppLoader";
import ScrollTopSimple from "@/components/ui/shared/ScrollTop/ScrollTopSimple";
import {
  APP_DESCRIPTION,
  APP_DESCRIPTION2,
  APP_NAME,
  APP_NAME2,
  APP_SLOGAN,
  APP_SLOGAN2,
} from "@/lib/utils/constants";
import { Suspense } from "react";
import QueryProvider from "@/components/Context/QueryProvider";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { ChatProvider } from "../components/Context/ChatContext";
import { NotificationProvider } from "../components/Context/NotificationContext";
import LeftNav from "@/components/Nav/LeftNav/LeftNav";
import RightNav from "@/components/Nav/RightNav/RightNav";
import PageTitle from "@/components/Custom/MoreThanFriend/PageTitle";
import { ThemeProvider } from "@/components/ui/shared/ThemeProvider/ThemeProvider";
import ThemeSettings from "@/components/ui/shared/ThemeSettings/ThemeSettings";
import { TranslationProvider } from "@/components/Context/TranslationContext";
import ExitIntentHandler from "../components/Custom/MoreThanFriend/ExitIntentHandler";
import { SITE1, SITE2 } from "@/config/env";
import ReferralCodeDetector from "@/components/Referral/ReferralCodeDetector";
import Footer2 from "@/components/Nav/Footer/Footer2";
import Header2 from "@/components/Nav/Header/Header2";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-main",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
});

export const metadata = {
  title: `${SITE1 ? APP_NAME : APP_NAME2} | ${
    SITE1 ? APP_SLOGAN : APP_SLOGAN2
  }`,
  description: SITE1 ? APP_DESCRIPTION : APP_DESCRIPTION2,
};

export default async function RootLayout({ children }) {
  const { mongoUser } = await getMongoUser();

  // test push 4
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </head>
      <body className={`${sora.variable} antialiased`}>
        {/* // * Root className needed to select ONLY MY APP elements, not eg Clerk (if select by body)*/}
        <div className="Root min-h-screen fc">
          <ClerkProvider>
            <QueryProvider>
              <ContextProvider>
                <ThemeProvider>
                  <TranslationProvider>
                    <ChatProvider {...{ mongoUser }}>
                      <NotificationProvider {...{ mongoUser }}>
                        <AppLoader />
                        {/* // * HACK needs to be here to color the app  */}
                        <ThemeSettings className="poa -t1000" />
                        {/* <Header /> */}
                        {SITE2 && <Header2 />}
                        {/* <PageTransitionProvider> */}
                        {/* // ??? REMOVED overflow-y-auto */}
                        <main className="scrollbar-hide max-w-[1300px] f jcc fwn mxa wf">
                          <LeftNav {...{ mongoUser }} />
                          <div className="LayoutMidContent wf">
                            <PageTitle />
                            <Suspense>{children}</Suspense>
                          </div>
                          <RightNav />
                        </main>
                        <AlertDialog />
                        <Toast />
                        <ScrollTopSimple />
                        {/* <Footer /> */}
                        {SITE2 && <Footer2 />}
                        {/* Only include the exit intent handler on SITE1 */}
                        {SITE1 && <ExitIntentHandler />}
                        <ReferralCodeDetector />
                      </NotificationProvider>
                    </ChatProvider>
                  </TranslationProvider>
                </ThemeProvider>
              </ContextProvider>
            </QueryProvider>
          </ClerkProvider>
        </div>
      </body>
    </html>
  );
}
