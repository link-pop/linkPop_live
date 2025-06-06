# Shippo Integration Documentation

## Overview

This integration adds shipping functionality to the store using Shippo API. When orders are paid via Stripe, shipments are automatically created in Shippo, and users can generate shipping labels.

## Environment Variables

Add the following environment variable to your `.env.local` file:

```
SHIPPO_API_KEY=your_shippo_api_key_here
```

You can get your API key from [Shippo Dashboard](https://apps.goshippo.com/api/).

## How It Works

### 1. Order Payment Flow

1. User adds items to cart
2. User proceeds to checkout via Stripe
3. After successful payment, Stripe webhook is triggered
4. Webhook automatically creates a Shippo shipment
5. Order is updated with Shippo shipment ID and rates

### 2. Label Creation Flow

1. User views their order in the Orders page
2. If shipment exists, user can click "Get Label" button
3. System creates shipping label using the cheapest rate
4. Order is updated with label URL and tracking number
5. Order status changes to "shipped"

## Store Configuration

The store address is currently hardcoded in `lib/utils/shippo/shippoService.js`:

```javascript
const STORE_CONFIG = {
  name: "Your Store Name",
  addressLine1: "123 Main St",
  city: "New York",
  state: "NY",
  zip: "10001",
  country: "US",
  phone: "555-123-4567",
  email: "store@example.com",
};
```

Update these values with your actual store information.

## Database Schema Updates

The following fields were added to the `storeitemsorders` collection:

- `shippoShipmentId`: Shippo shipment object ID
- `shippoRates`: Array of shipping rates from Shippo
- `shippingLabelUrl`: URL to download the shipping label PDF
- `shippoTransactionId`: Shippo transaction object ID
- `carrierAccount`: Carrier account used for shipping

## Files Modified/Created

### New Files:

- `lib/utils/shippo/shippoClient.js` - Shippo API client
- `lib/utils/shippo/shippoService.js` - Shippo service functions
- `lib/actions/shippoActions.js` - Server actions for Shippo operations
- `app/api/shippo/create-label/route.js` - API route for label creation

### Modified Files:

- `app/api/stripe/webhook/route.js` - Added automatic shipment creation
- `lib/db/models/StoreItemsOrderModel.js` - Added Shippo fields
- `components/Orders/OrderCard.js` - Added label creation UI
- `data/locales/en1.js` - Added shipping translations

## UI Features

### Order Card Enhancements

- Shows "Get Label" button when shipment exists but no label created
- Shows "Download Label" button when label already exists
- Shows shipment preparation status
- Automatically opens label PDF in new window

### User Flow

1. Order appears with "Preparing Shipment..." status after payment
2. Once shipment is created automatically, "Get Label" button appears
3. User clicks "Get Label" to create and download shipping label
4. Order status updates to "shipped" with tracking number

## Error Handling

- All Shippo API errors are logged and displayed to users
- Webhook continues processing even if Shippo shipment creation fails
- Users see appropriate error messages for failed operations
- Toast notifications provide feedback for all actions

## Testing

1. Ensure `SHIPPO_API_KEY` is set in environment variables
2. Create a test order through the cart checkout flow
3. Check that shipment is created automatically after payment
4. Verify "Get Label" button appears in order card
5. Test label creation and download functionality

## Support

For Shippo API documentation, visit: https://docs.goshippo.com/
