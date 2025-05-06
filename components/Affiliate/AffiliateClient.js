"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import {
  Users,
  DollarSign,
  Copy,
  CheckCircle,
  Clock,
  Share2,
  Info,
} from "lucide-react";
import { generateUserReferralCode } from "@/lib/actions/referral/generateUserReferralCode";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useContext } from "@/components/Context/Context";
import ApplyReferralCodeForm from "./ApplyReferralCodeForm";
import { LOGIN_ROUTE } from "@/lib/utils/constants";
import CreatedBy from "@/components/Post/Post/CreatedBy";
import { processReferralEarnings } from "@/lib/utils/referral/calculateReferralEarnings";
import { getUserReferralData } from "@/lib/actions/referral/getUserReferralData";
import useShareHelper from "@/components/ui/shared/Share/ShareHelper";
import TitleWithBackButton from "@/components/ui/shared/PageHeading/TitleWithBackButton";

export default function AffiliateClient({ data }) {
  const [copyState, setCopyState] = useState({
    link: false,
    code: false,
  });
  const [loading, setLoading] = useState(false);
  const [filteredEarnings, setFilteredEarnings] = useState([]);
  const [earningStats, setEarningStats] = useState({
    totalEarnings: 0,
    pendingEarnings: 0,
    paidEarnings: 0,
  });
  const [referralData, setReferralData] = useState(data);
  const { t } = useTranslation();
  const { toastSet, dialogSet } = useContext();
  const { shareContent } = useShareHelper();

  // Filter out trial subscriptions from earnings
  useEffect(() => {
    if (!referralData || !referralData.earnings) {
      setFilteredEarnings([]);
      return;
    }

    const { filteredEarnings, stats } = processReferralEarnings(
      referralData.earnings
    );
    setFilteredEarnings(filteredEarnings);
    setEarningStats(stats);
  }, [referralData?.earnings]);

  const handleCopy = useCallback(
    (text, type) => {
      if (!text) return;

      navigator.clipboard.writeText(text);
      setCopyState((prev) => ({
        ...prev,
        [type]: true,
      }));

      toastSet({
        isOpen: true,
        title:
          type === "link" ? t("referralLinkCopied") : t("referralCodeCopied"),
      });

      setTimeout(() => {
        setCopyState((prev) => ({
          ...prev,
          [type]: false,
        }));
      }, 3000);
    },
    [toastSet, t]
  );

  const handleCopyCode = useCallback(() => {
    handleCopy(referralData.referralUrl, "link");
  }, [handleCopy, referralData.referralUrl]);

  const handleCopyReferralCode = useCallback(() => {
    handleCopy(referralData.referralCode, "code");
  }, [handleCopy, referralData.referralCode]);

  const handleShare = useCallback(() => {
    if (referralData.referralUrl) {
      shareContent({
        title: "Join me on this platform!",
        text: "Sign up using my referral link:",
        url: referralData.referralUrl,
        onError: () => handleCopy(referralData.referralUrl, "link"),
      });
    } else {
      handleCopy(referralData.referralUrl, "link");
    }
  }, [referralData.referralUrl, handleCopy]);

  const handleGenerateCode = useCallback(async () => {
    setLoading(true);
    try {
      const result = await generateUserReferralCode();
      if (result.success) {
        // After successfully generating a referral code, fetch the latest data from the server
        const freshData = await getUserReferralData();

        if (freshData.success) {
          // Update the state with the fresh data from the server
          setReferralData(freshData);

          toastSet({
            isOpen: true,
            title: t("success"),
          });
        } else {
          // Fallback to updating just the code if fetching fresh data fails
          const baseUrl =
            process.env.NEXT_PUBLIC_CLIENT_URL ||
            window.location.origin ||
            "http://localhost:3000";

          setReferralData((prevData) => ({
            ...prevData,
            referralCode: result.referralCode,
            referralUrl: `${baseUrl}/?ref=${result.referralCode}`,
          }));

          toastSet({
            isOpen: true,
            title: t("success"),
          });
        }
      } else {
        toastSet({
          isOpen: true,
          title: result.message || t("error"),
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error generating referral code:", error);
      toastSet({
        isOpen: true,
        title: t("error"),
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [toastSet, t]);

  const showTermsDialog = useCallback(() => {
    dialogSet({
      isOpen: true,
      title: t("affiliateProgramTerms"),
      comp: (
        <div className={`text-left overflow-y-auto max-h-[50dvh] pr-2`}>
          <h3 className={`font-bold text-base mt-2`}>
            {t("commissionStructure")}
          </h3>
          <p className={`text-sm mb-2`}>{t("commissionStructureDesc")}</p>

          <h3 className={`font-bold text-base mt-4`}>{t("eligibility")}</h3>
          <p className={`text-sm mb-2`}>{t("eligibilityDesc")}</p>

          <h3 className={`font-bold text-base mt-4`}>
            {t("referralValidation")}
          </h3>
          <p className={`text-sm mb-2`}>{t("referralValidationDesc")}</p>

          <h3 className={`font-bold text-base mt-4`}>
            {t("commissionPayments")}
          </h3>
          <p className={`text-sm mb-2`}>{t("commissionPaymentsDesc")}</p>

          <h3 className={`font-bold text-base mt-4`}>
            {t("prohibitedActivities")}
          </h3>
          <p className={`text-sm mb-2`}>{t("prohibitedActivitiesDesc")}</p>

          <h3 className={`font-bold text-base mt-4`}>
            {t("programModifications")}
          </h3>
          <p className={`text-sm mb-2`}>{t("programModificationsDesc")}</p>

          <h3 className={`font-bold text-base mt-4`}>
            {t("termAndTermination")}
          </h3>
          <p className={`text-sm mb-2`}>{t("termAndTerminationDesc")}</p>
        </div>
      ),
      showCancelBtn: true,
      cancelBtnText: t("close"),
      showConfirmBtn: false,
    });
  }, [dialogSet, t]);

  if (!referralData.success) {
    return (
      <div
        className={`container mx-auto p-4 flex items-center justify-center min-h-[60dvh]`}
      >
        <Card className={`w-full max-w-md bg-background`}>
          <CardHeader>
            <CardTitle>{t("affiliateProgram")}</CardTitle>
            <CardDescription>{t("signInToSubscribe")}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              variant="default"
              onClick={() => (window.location.href = LOGIN_ROUTE)}
            >
              {t("signIn")}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className={`container mx-auto p-4`}>
      <div className={`mb-8`}>
        <TitleWithBackButton
          title={t("affiliateProgram")}
          className="text-3xl font-bold mb-2"
        />
        <p className={`text-muted-foreground`}>
          {t("earnCommissionWhenReferralsSubscribe")}
        </p>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-8`}>
        {/* Referrals Card */}
        <Card
          className={`bg-background shadow-sm hover:shadow transition-shadow duration-200`}
        >
          <CardHeader className={`pb-2`}>
            <CardTitle className={`flex items-center gap-2 text-lg`}>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Users size={18} className={`text-primary`} />
              </div>
              <span>{t("referrals")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`flex flex-col`}>
              <div className={`flex justify-between items-center mb-3`}>
                <div className={`text-sm text-muted-foreground`}>
                  {t("totalReferrals")}
                </div>
                <div className={`text-2xl font-bold`}>
                  {referralData.referrals?.length || 0}
                </div>
              </div>
              <div className={`flex justify-between items-center`}>
                <div className={`text-sm text-muted-foreground`}>
                  {t("activeReferrals")}
                </div>
                <div className={`text-2xl font-bold text-green-500`}>
                  {referralData.stats?.activeReferrals || 0}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Earnings Card */}
        <Card
          className={`bg-background shadow-sm hover:shadow transition-shadow duration-200`}
        >
          <CardHeader className={`pb-2`}>
            <CardTitle className={`flex items-center gap-2 text-lg`}>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign size={18} className={`text-primary`} />
              </div>
              <span>{t("totalEarnings")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold mb-3`}>
              ${earningStats.totalEarnings.toFixed(2) || "0.00"}
            </div>
            <div className={`grid grid-cols-2 gap-2`}>
              <div className={`flex flex-col`}>
                <div className={`text-xs text-muted-foreground`}>
                  {t("pendingEarnings")}
                </div>
                <Badge
                  variant="outline"
                  className={`text-yellow-500 bg-yellow-50 dark:bg-yellow-950/50 justify-start mt-1 w-fit`}
                >
                  ${earningStats.pendingEarnings.toFixed(2) || "0.00"}
                </Badge>
              </div>
              <div className={`flex flex-col`}>
                <div className={`text-xs text-muted-foreground`}>
                  {t("paidEarnings")}
                </div>
                <Badge
                  variant="outline"
                  className={`text-green-500 bg-green-50 dark:bg-green-950/50 justify-start mt-1 w-fit`}
                >
                  ${earningStats.paidEarnings.toFixed(2) || "0.00"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referral Code Card */}
        <Card
          className={`bg-background shadow-sm hover:shadow transition-shadow duration-200`}
        >
          <CardHeader className={`pb-2`}>
            <CardTitle className={`flex items-center gap-2 text-lg`}>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Share2 size={18} className={`text-primary`} />
              </div>
              <span>{t("referralCode")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {referralData.referralCode ? (
              <>
                <div className={`flex flex-col gap-2 mb-2`}>
                  <div className={`text-sm text-muted-foreground mb-1`}>
                    {t("referralLink")}:
                  </div>
                  <div className={`flex w-full`}>
                    <Input
                      value={
                        referralData.referralUrl ||
                        `${
                          process.env.NEXT_PUBLIC_CLIENT_URL ||
                          "http://localhost:3000"
                        }/?ref=${referralData.referralCode}`
                      }
                      readOnly
                      className={`font-mono bg-muted text-xs truncate`}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className={`ml-2 transition-colors duration-200`}
                      onClick={handleCopyCode}
                    >
                      {copyState.link ? (
                        <CheckCircle size={18} className={`text-green-500`} />
                      ) : (
                        <Copy size={18} />
                      )}
                    </Button>
                  </div>
                  <div className={`text-sm text-muted-foreground mt-3 mb-1`}>
                    {t("referralCode")}:
                  </div>
                  <div className={`flex w-full`}>
                    <div
                      className={`font-mono bg-muted/50 px-3 py-2 rounded text-sm flex-1 truncate`}
                    >
                      {referralData.referralCode}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className={`ml-2 transition-colors duration-200`}
                      onClick={handleCopyReferralCode}
                    >
                      {copyState.code ? (
                        <CheckCircle size={18} className={`text-green-500`} />
                      ) : (
                        <Copy size={18} />
                      )}
                    </Button>
                  </div>
                </div>
                <Button
                  variant="default"
                  className={`w-full mt-4`}
                  onClick={handleShare}
                >
                  <Share2 size={18} className={`mr-2`} />
                  {t("shareReferralLink")}
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center py-4">
                <div className="text-muted-foreground text-center mb-4">
                  {t("noReferralCodeYet")}
                </div>
                <Button
                  variant="default"
                  className={`w-full max-w-xs`}
                  onClick={handleGenerateCode}
                  disabled={loading}
                >
                  {loading ? t("loading") : t("generateReferralCode")}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="referrals" className={`w-full`}>
        <TabsList className={`grid w-full max-w-md grid-cols-2 mb-4`}>
          <TabsTrigger value="referrals">{t("yourReferrals")}</TabsTrigger>
          <TabsTrigger value="earnings">{t("commissionEarnings")}</TabsTrigger>
        </TabsList>

        <TabsContent value="referrals">
          <Card className={`bg-background shadow-sm`}>
            <CardHeader>
              <CardTitle className="text-xl">
                {t("peopleYouReferred")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {referralData.referrals?.length > 0 ? (
                <div className={`divide-y divide-border`}>
                  {referralData.referrals.map((referral) => (
                    <div
                      key={referral._id}
                      className={`py-4 flex justify-between items-center`}
                    >
                      <div className={`flex-1`}>
                        {referral.referredId ? (
                          <CreatedBy
                            createdBy={referral.referredId}
                            showName={true}
                            wrapClassName="pen"
                            bottom={
                              <div className={`text-sm text-muted-foreground`}>
                                {format(
                                  new Date(referral.createdAt),
                                  "MMM d, yyyy"
                                )}
                              </div>
                            }
                          />
                        ) : (
                          <div className={`flex items-center`}>
                            <div className="w-10 h-10 br50 bg-gray-200 f aic jcc text-gray-600 font-semibold">
                              UN
                            </div>
                            <div className="ml-3">
                              <div className={`font-medium`}>Unknown User</div>
                              <div className={`text-sm text-muted-foreground`}>
                                {format(
                                  new Date(referral.createdAt),
                                  "MMM d, yyyy"
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <Badge
                        variant={
                          referral.status === "active" ? "default" : "outline"
                        }
                        className={`
                          ${
                            referral.status === "active"
                              ? "bg-green-500 hover:bg-green-600"
                              : "text-yellow-500 bg-yellow-50 dark:bg-yellow-950/50"
                          }
                        `}
                      >
                        {referral.status === "active"
                          ? t("active")
                          : t("pending")}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`text-center py-8 text-muted-foreground`}>
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Users size={32} className={`opacity-40`} />
                  </div>
                  <p>{t("noReferralsYet")}</p>
                  <p className={`text-sm mt-2`}>{t("shareYourReferralCode")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings">
          <Card className={`bg-background shadow-sm`}>
            <CardHeader>
              <CardTitle className="text-xl">
                {t("commissionHistory")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredEarnings.length > 0 ? (
                <div className={`divide-y divide-border`}>
                  {filteredEarnings.map((earning) => (
                    <div
                      key={earning._id}
                      className={`py-4 flex justify-between items-center`}
                    >
                      <div className={`flex-1`}>
                        <div className={`flex items-center`}>
                          {earning.referredId ? (
                            <CreatedBy
                              createdBy={earning.referredId}
                              showName={true}
                              wrapClassName="pen"
                              bottom={
                                <div
                                  className={`text-sm text-muted-foreground flex items-center`}
                                >
                                  <Clock
                                    size={14}
                                    className={`mr-1 opacity-70`}
                                  />
                                  {format(
                                    new Date(earning.periodStart),
                                    "MMM d"
                                  )}{" "}
                                  -{" "}
                                  {format(
                                    new Date(earning.periodEnd),
                                    "MMM d, yyyy"
                                  )}
                                </div>
                              }
                            />
                          ) : (
                            <div className="font-medium">Unknown User</div>
                          )}
                          <Badge
                            variant="outline"
                            className={`ml-2 ${
                              earning.status === "paid"
                                ? "text-green-500 bg-green-50 dark:bg-green-950/50"
                                : "text-yellow-500 bg-yellow-50 dark:bg-yellow-950/50"
                            }`}
                          >
                            {earning.status === "paid"
                              ? t("paidEarnings")
                              : t("pendingEarnings")}
                          </Badge>
                        </div>
                      </div>
                      <div className={`text-right`}>
                        <div className={`font-bold text-primary`}>
                          ${earning.commissionAmount.toFixed(2)}
                        </div>
                        <div className={`text-xs text-muted-foreground`}>
                          {earning.commissionPercentage}% of $
                          {earning.subscriptionAmount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`text-center py-8 text-muted-foreground`}>
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <DollarSign size={32} className={`opacity-40`} />
                  </div>
                  <p>{t("noEarningsYet")}</p>
                  <p className={`text-sm mt-2`}>
                    {t("earnCommissionWhenReferralsSubscribe")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className={`mt-8 bg-muted p-6 rounded-lg shadow-sm`}>
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-primary/10 p-2 mt-1 flex-shrink-0">
            <Info size={20} className="text-primary" />
          </div>
          <div>
            <h2 className={`text-xl font-bold mb-3`}>
              {t("howAffiliateWorks")}
            </h2>
            <ol className={`list-decimal pl-5 space-y-2`}>
              <li>{t("shareYourReferralCode")}</li>
              <li>{t("whenSomeoneSignsUp")}</li>
              <li>{t("earnCommissionWhenReferralsSubscribe")}</li>
              <li>{t("commissionsAutomaticallyTracked")}</li>
              <li>{t("paymentsProcessed")}</li>
            </ol>
            <p className={`mt-4 text-sm font-semibold text-accent-foreground`}>
              {t("minimumPayoutNote")}
            </p>
          </div>
        </div>
      </div>

      {/* Referral Terms Dialog Button */}
      <div className={`text-center mt-6 text-sm text-muted-foreground`}>
        <button
          className={`text-primary underline hover:text-primary/80`}
          onClick={showTermsDialog}
        >
          {t("affiliateProgramTerms")}
        </button>
      </div>

      {/* Apply Referral Code section (show only if user hasn't been referred yet) */}
      {!referralData.isReferred && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">{t("applyReferralCode")}</h2>
          <ApplyReferralCodeForm onSuccess={() => window.location.reload()} />
        </div>
      )}
    </div>
  );
}
