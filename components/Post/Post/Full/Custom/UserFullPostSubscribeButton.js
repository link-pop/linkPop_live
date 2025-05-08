"use client";

import { useEffect, useState } from "react";
import { update, add, removeOne, getOne } from "@/lib/actions/crud";
import { useRequireAuth } from "@/lib/utils/auth/useRequireAuth";
import Button2 from "@/components/ui/shared/Button/Button2";
import { useContext } from "@/components/Context/Context";
import { useTranslation } from "@/components/Context/TranslationContext";
import { createNotification } from "@/lib/utils/notifications/createNotification";
import { useChat } from "@/components/Context/ChatContext";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import SubscriptionExpiresAt from "@/components/Subscription/SubscriptionExpiresAt";

// TODO !!!!!! use StripeButton not axios
export default function UserFullPostSubscribeButton({
  post: subscribedToUser,
  mongoUser,
  showSendMsgBtnSet,
}) {
  // * Don't show button to yourself
  if (subscribedToUser._id === mongoUser?._id) return null;

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPaidSubscription, setIsPaidSubscription] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const { toastSet } = useContext();
  const noLoggedInUser = useRequireAuth();
  const { t } = useTranslation();
  const { socket } = useChat();
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const subscription = await getOne({
          col: "subscriptions",
          data: {
            createdBy: mongoUser._id,
            subscribedTo: subscribedToUser._id,
          },
        });
        setIsSubscribed(!!subscription);
        setSubscription(subscription);
        showSendMsgBtnSet(!!subscription);

        // Check if creator has a subscription price
        if (subscribedToUser.subscriptionPrice > 0) {
          setIsPaidSubscription(true);
        }
      } catch (error) {
        console.error("Error checking subscription:", error);
      }
    };

    if (mongoUser && subscribedToUser._id) {
      checkSubscription();
    }
  }, [mongoUser, subscribedToUser._id, subscribedToUser.subscriptionPrice]);

  const handleSubscribe = async () => {
    if (noLoggedInUser()) return;
    if (mongoUser._id === subscribedToUser._id) return;

    try {
      setLoading(true);

      // If unsubscribing
      if (isSubscribed) {
        const subscription = await getOne({
          col: "subscriptions",
          data: {
            createdBy: mongoUser._id,
            subscribedTo: subscribedToUser._id,
          },
        });

        if (
          subscription &&
          subscription.expiresAt &&
          new Date(subscription.expiresAt) > new Date()
        ) {
          await update({
            col: "subscriptions",
            data: {
              createdBy: mongoUser._id,
              subscribedTo: subscribedToUser._id,
            },
            update: {
              active: false,
            },
          });
        } else {
          await removeOne({
            col: "subscriptions",
            data: {
              createdBy: mongoUser._id,
              subscribedTo: subscribedToUser._id,
            },
          });
        }

        // Create unfollow notification
        await createNotification({
          userId: subscribedToUser._id,
          type: "unfollow",
          title: "Unfollowed",
          content: `${
            mongoUser.name || mongoUser.username || "Someone"
          } unfollowed you`,
          sourceId: mongoUser._id,
          sourceModel: "users",
          sourceUserId: mongoUser._id,
          link: `/${mongoUser.name}`,
          socket,
        });

        setIsSubscribed(false);
        setSubscription(null);
        showSendMsgBtnSet(false);

        // Invalidate React Query cache
        queryClient.invalidateQueries({
          queryKey: ["posts", "feeds"],
        });

        queryClient.invalidateQueries({
          queryKey: ["posts", "attachments"],
        });

        return;
      }

      // If subscribing and it's a paid subscription
      if (isPaidSubscription) {
        // Redirect to Stripe checkout
        try {
          const { data } = await axios.post("/api/stripe/subscriptions", {
            creatorId: subscribedToUser._id,
          });

          if (data?.sessionUrl) {
            window.location.href = data.sessionUrl;
            return;
          } else {
            throw new Error("No session URL returned from payment service");
          }
        } catch (error) {
          console.error("Stripe payment error:", error);
          toastSet({
            isOpen: true,
            title: t("paymentError"),
            text:
              error.response?.data?.error ||
              error.message ||
              t("unknownPaymentError"),
            variant: "destructive",
          });
          return;
        }
      }

      // If it's a free subscription
      // * Check if subscription already exists
      const existingSubscription = await getOne({
        col: "subscriptions",
        data: {
          createdBy: mongoUser._id,
          subscribedTo: subscribedToUser._id,
        },
      });

      if (!existingSubscription) {
        await add({
          col: "subscriptions",
          data: {
            createdBy: mongoUser._id,
            subscribedTo: subscribedToUser._id,
            active: true,
          },
        });

        // Create follow notification
        await createNotification({
          userId: subscribedToUser._id,
          type: "follow",
          title: "New Follower",
          content: `${
            mongoUser.name || mongoUser.username || "Someone"
          } started following you`,
          sourceId: mongoUser._id,
          sourceModel: "users",
          sourceUserId: mongoUser._id,
          link: `/${mongoUser.name}`,
          socket,
        });

        // ! AutoFollowBackMyFans
        // ??? Check if creator has auto follow back enabled AND subscriber has free subscription
        const subscribedToUserDetails = await getOne({
          col: "users",
          data: {
            _id: subscribedToUser._id,
          },
        });

        // * If creator has auto follow back enabled and subscriber is free, create reverse subscription
        if (
          subscribedToUserDetails?.autoFollowBackMyFans === true &&
          mongoUser.subscriptionPrice === 0
        ) {
          // * Check if the reverse subscription already exists
          const existingReverseSubscription = await getOne({
            col: "subscriptions",
            data: {
              createdBy: subscribedToUser._id,
              subscribedTo: mongoUser._id,
            },
          });

          // * Create the reverse subscription if it doesn't exist
          if (!existingReverseSubscription) {
            await add({
              col: "subscriptions",
              data: {
                createdBy: subscribedToUser._id,
                subscribedTo: mongoUser._id,
                active: true,
              },
            });

            // Create auto-follow-back notification
            await createNotification({
              userId: mongoUser._id,
              type: "follow",
              title: "New Follower",
              content: `${
                subscribedToUser.name || subscribedToUser.username || "Someone"
              } started following you back`,
              sourceId: subscribedToUser._id,
              sourceModel: "users",
              sourceUserId: subscribedToUser._id,
              link: `/${subscribedToUser.name}`,
              socket,
            });
          }
        }
        // ? AutoFollowBackMyFans

        // * Check if chatroom already exists
        const existingChatRoom = await getOne({
          col: "chatrooms",
          data: {
            chatRoomUsers: {
              $all: [mongoUser?._id, subscribedToUser._id],
            },
          },
        });

        // * Create chatroom if it doesn't exist
        if (!existingChatRoom) {
          // * 1: create chatroom
          const newChatRoom = await add({
            col: "chatrooms",
            data: {
              chatRoomUsers: [mongoUser?._id, subscribedToUser._id],
            },
          });

          // * 2: create first system chat message from person you subscribed to
          let firstSystemChatMessage;

          if (
            subscribedToUser.welcomeMessage &&
            subscribedToUser.welcomeMessageSend === true
          ) {
            // Use the welcome message if it exists
            firstSystemChatMessage = await add({
              col: "chatmessages",
              data: {
                chatRoomId: newChatRoom._id,
                createdBy: subscribedToUser._id,
                chatMsgText: subscribedToUser.welcomeMessage.chatMsgText || "",
                chatMsgStatus: "delivered",
                files: subscribedToUser.welcomeMessage.files || [],
                expirationPeriod:
                  subscribedToUser.welcomeMessage.expirationPeriod || null,
              },
            });
          }

          // * 3: update chatroom last message
          await update({
            col: "chatrooms",
            data: {
              _id: newChatRoom._id,
            },
            update: {
              chatRoomLastMsg: firstSystemChatMessage._id,
            },
          });

          // * 4: toast
          toastSet({
            isOpen: true,
            title: `${t("subscribedToUser")} ${subscribedToUser.name}!`,
          });
        }

        setIsSubscribed(true);
        setSubscription(existingSubscription);
        showSendMsgBtnSet(true);

        // Invalidate React Query cache
        queryClient.invalidateQueries({
          queryKey: ["posts", "feeds"],
        });

        queryClient.invalidateQueries({
          queryKey: ["posts", "attachments"],
        });
      }
    } catch (error) {
      console.error("Error subscribing:", error);
      toastSet({
        isOpen: true,
        title: t("error"),
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const isActivePaidSubscription = isSubscribed && subscription.active;

  return (
    <div className={`por fc g5`}>
      <Button2
        onClick={handleSubscribe}
        className={`rounded-full transition-colors duration-200`}
        disabled={loading || mongoUser?._id === subscribedToUser._id}
        variant={isActivePaidSubscription ? "outline" : "primary"}
        title={
          mongoUser
            ? mongoUser._id === subscribedToUser._id
              ? t("cannotSubscribeToYourself")
              : isPaidSubscription && !isSubscribed
              ? `${t("subscribe")} - $${
                  subscribedToUser.subscriptionPrice
                }/month`
              : t("subscribe")
            : t("signInToSubscribe")
        }
      >
        <div className={`abounce f fwn aic g2 fz12`}>
          {isActivePaidSubscription
            ? t("subscribed")
            : isPaidSubscription
            ? `${t("subscribe")} - $${subscribedToUser.subscriptionPrice}/month`
            : t("subscribe")}
        </div>
      </Button2>
      {subscription?.expiresAt && (
        <SubscriptionExpiresAt subscription={subscription} />
      )}
    </div>
  );
}
