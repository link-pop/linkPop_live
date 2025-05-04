import { NextResponse } from "next/server";
import { add, getOne, update } from "@/lib/actions/crud";
import _stripe from "stripe";
import { createNotification } from "@/lib/utils/notifications/createNotification";

const __stripe = _stripe(process.env.STRIPE_SECRET_KEY);

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const creatorId = searchParams.get("creatorId");
    const sessionId = searchParams.get("sessionId");

    if (!userId || !creatorId || !sessionId) {
      return NextResponse.redirect(
        `${
          process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3000"
        }/error?message=Missing required parameters`
      );
    }

    // Verify the payment was successful with Stripe
    const session = await __stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.redirect(
        `${
          process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3000"
        }/error?message=Payment not completed`
      );
    }

    // Get creator details
    const creator = await getOne({
      col: "users",
      data: { _id: creatorId },
    });

    if (!creator) {
      return NextResponse.redirect(
        `${
          process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3000"
        }/error?message=Creator not found`
      );
    }

    // Check if subscription already exists
    const existingSubscription = await getOne({
      col: "subscriptions",
      data: {
        createdBy: userId,
        subscribedTo: creatorId,
      },
    });

    // Calculate expiration date (30 days from now) in UTC
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    if (existingSubscription) {
      // Update existing subscription
      await update({
        col: "subscriptions",
        data: { _id: existingSubscription._id },
        update: {
          active: true,
          isPaid: true,
          price: creator.subscriptionPrice,
          stripeSessionId: sessionId,
          paymentStatus: "completed",
          expiresAt: expiresAt,
        },
      });
    } else {
      // Create new subscription
      await add({
        col: "subscriptions",
        data: {
          createdBy: userId,
          subscribedTo: creatorId,
          active: true,
          isPaid: true,
          price: creator.subscriptionPrice,
          stripeSessionId: sessionId,
          paymentStatus: "completed",
          expiresAt: expiresAt,
        },
      });

      // Create follow notification
      const subscriber = await getOne({
        col: "users",
        data: { _id: userId },
      });

      await createNotification({
        userId: creatorId,
        type: "follow",
        title: "New Paid Subscriber",
        content: `${
          subscriber?.name || subscriber?.username || "Someone"
        } subscribed to your content`,
        sourceId: userId,
        sourceModel: "users",
        sourceUserId: userId,
        link: `/users/${subscriber?.name}`,
      });

      // Check if auto follow back is enabled AND subscription price is 0
      if (
        creator?.autoFollowBackMyFans === true &&
        subscriber.subscriptionPrice === 0
      ) {
        // Check if reverse subscription exists
        const existingReverseSubscription = await getOne({
          col: "subscriptions",
          data: {
            createdBy: creatorId,
            subscribedTo: userId,
          },
        });

        // Create reverse subscription if it doesn't exist
        if (!existingReverseSubscription) {
          await add({
            col: "subscriptions",
            data: {
              createdBy: creatorId,
              subscribedTo: userId,
              active: true,
              isPaid: false,
            },
          });

          // Create auto-follow-back notification
          await createNotification({
            userId: userId,
            type: "follow",
            title: "New Follower",
            content: `${
              creator.name || creator.username || "Someone"
            } started following you back`,
            sourceId: creatorId,
            sourceModel: "users",
            sourceUserId: creatorId,
            link: `/users/${creator.name}`,
          });
        }
      }

      // Create chatroom if it doesn't exist
      const existingChatRoom = await getOne({
        col: "chatrooms",
        data: {
          chatRoomUsers: {
            $all: [userId, creatorId],
          },
        },
      });

      if (!existingChatRoom) {
        // Create chatroom
        const newChatRoom = await add({
          col: "chatrooms",
          data: {
            chatRoomUsers: [userId, creatorId],
          },
        });

        // Create welcome message if enabled
        if (creator.welcomeMessage && creator.welcomeMessageSend === true) {
          const firstSystemChatMessage = await add({
            col: "chatmessages",
            data: {
              chatRoomId: newChatRoom._id,
              createdBy: creatorId,
              chatMsgText: creator.welcomeMessage.chatMsgText || "",
              chatMsgStatus: "delivered",
              files: creator.welcomeMessage.files || [],
              expirationPeriod: creator.welcomeMessage.expirationPeriod || null,
            },
          });

          // Update chatroom last message
          await update({
            col: "chatrooms",
            data: {
              _id: newChatRoom._id,
            },
            update: {
              chatRoomLastMsg: firstSystemChatMessage._id,
            },
          });
        }
      }
    }

    // Redirect to success page
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3000"}/users/${
        creator.name
      }?subscribed=true`
    );
  } catch (error) {
    console.error("Subscription success handler error:", error);
    return NextResponse.redirect(
      `${
        process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3000"
      }/error?message=${encodeURIComponent(
        error.message || "An error occurred while processing your subscription"
      )}`
    );
  }
}
