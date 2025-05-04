import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import QRCodePage from "@/app/my/settings/qrcode/QRCodePage";

export default async function qrcodepage() {
  const { mongoUser } = await getMongoUser();

  // Create initial profile URL as fallback
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://example.com";
  const initialProfileUrl = `${baseUrl}/users/${mongoUser?.name}`;

  return (
    <QRCodePage mongoUser={mongoUser} initialProfileUrl={initialProfileUrl} />
  );
}
