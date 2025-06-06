import ShippoClient from "./shippoClient";
import {
  filterUSPSRates,
  normalizeCarrierToUSPS,
  normalizeTrackingCarrier,
} from "./carrierUtils";

// Store configuration (hardcoded as requested)
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

class ShippoService {
  constructor() {
    this.client = new ShippoClient();
  }

  // Create store address
  getStoreAddress() {
    return {
      name: STORE_CONFIG.name,
      street1: STORE_CONFIG.addressLine1,
      city: STORE_CONFIG.city,
      state: STORE_CONFIG.state,
      zip: STORE_CONFIG.zip,
      country: STORE_CONFIG.country,
      phone: STORE_CONFIG.phone,
      email: STORE_CONFIG.email,
    };
  }

  // Format customer address from order
  formatCustomerAddress(shippingAddress) {
    if (!shippingAddress) {
      throw new Error("Shipping address is required");
    }

    return {
      name: shippingAddress.name || "Customer",
      street1: shippingAddress.line1,
      street2: shippingAddress.line2 || "",
      city: shippingAddress.city,
      state: shippingAddress.state,
      zip: shippingAddress.postal_code,
      country: shippingAddress.country,
    };
  }

  // Create parcels from order items
  createParcels(orderItems) {
    // For simplicity, create one parcel for all items
    // In real scenarios, you might want to create separate parcels based on dimensions
    return [
      {
        length: "10",
        width: "8",
        height: "4",
        distance_unit: "in",
        weight: "1",
        mass_unit: "lb",
      },
    ];
  }

  // Filter rates to only include USPS carriers (using utility function)
  filterUSPSRates(rates) {
    return filterUSPSRates(rates);
  }

  // Create shipment in Shippo with USPS preference
  async createShipment(order) {
    try {
      if (!order.shippingAddress) {
        throw new Error("Order must have a shipping address");
      }

      const fromAddress = this.getStoreAddress();
      const toAddress = this.formatCustomerAddress(order.shippingAddress);
      const parcels = this.createParcels(order.items);

      const shipmentData = {
        address_from: fromAddress,
        address_to: toAddress,
        parcels: parcels,
        async: false, // Synchronous creation
        extra: {
          qr_code_requested: true, // Request QR code for Label Broker functionality
        },
        // Request specific carriers - prioritize USPS
        carrier_accounts: [], // Let Shippo use default carrier accounts
      };

      console.log("Creating Shippo shipment for order:", order.orderNumber);
      const shipment = await this.client.createShipment(shipmentData);

      // Filter rates to only include USPS
      if (shipment.rates) {
        shipment.rates = this.filterUSPSRates(shipment.rates);
        console.log(
          `Shipment created with ${shipment.rates.length} USPS rates`
        );
      }

      console.log("Shippo shipment created:", shipment.object_id);
      return shipment;
    } catch (error) {
      console.error("Error creating Shippo shipment:", error);
      throw error;
    }
  }

  // Get shipping rates for a shipment (filtered for USPS)
  async getShippingRates(shipmentId) {
    try {
      const rates = await this.client.getRates(shipmentId);
      return this.filterUSPSRates(rates);
    } catch (error) {
      console.error("Error getting shipping rates:", error);
      throw error;
    }
  }

  // Create shipping label
  async createShippingLabel(shipmentId, rateId) {
    try {
      const transactionData = {
        rate: rateId,
        label_file_type: "PDF",
        async: false,
        extra: {
          qr_code_requested: true, // Request QR code for Label Broker functionality
        },
      };

      console.log("Creating shipping label for shipment:", shipmentId);
      const transaction = await this.client.createTransaction(transactionData);

      console.log("Shipping label created:", transaction.object_id);
      return transaction;
    } catch (error) {
      console.error("Error creating shipping label:", error);
      throw error;
    }
  }

  // Get cheapest USPS rate from shipment rates
  getCheapestRate(rates) {
    if (!rates || !rates.length) {
      throw new Error("No rates available");
    }

    // First filter for USPS rates
    const uspsRates = this.filterUSPSRates(rates);
    const ratesToUse = uspsRates.length > 0 ? uspsRates : rates;

    const cheapestRate = ratesToUse.reduce((cheapest, rate) => {
      const currentPrice = parseFloat(rate.amount);
      const cheapestPrice = parseFloat(cheapest.amount);
      return currentPrice < cheapestPrice ? rate : cheapest;
    });

    console.log(
      `Selected cheapest rate: ${cheapestRate.provider} - ${cheapestRate.servicelevel?.name} - $${cheapestRate.amount}`
    );
    return cheapestRate;
  }

  // Get carrier name from rate or transaction (using utility function)
  getCarrierName(rateOrTransaction) {
    return normalizeCarrierToUSPS(rateOrTransaction);
  }

  // Track package
  async trackPackage(trackingNumber, carrier) {
    try {
      // Ensure we use USPS for tracking (using utility function)
      const trackingCarrier = normalizeTrackingCarrier(carrier);
      return await this.client.trackPackage(trackingNumber, trackingCarrier);
    } catch (error) {
      console.error("Error tracking package:", error);
      throw error;
    }
  }

  // Get Label Broker QR Code for a transaction
  async getLabelBrokerQRCode(transactionId) {
    try {
      console.log(
        "Getting Label Broker QR Code for transaction:",
        transactionId
      );
      const transaction = await this.client.getLabelBrokerQRCode(transactionId);

      if (transaction && transaction.qr_code_url) {
        console.log("Label Broker QR Code URL:", transaction.qr_code_url);
        return transaction.qr_code_url;
      } else {
        throw new Error("No QR code URL found in transaction");
      }
    } catch (error) {
      console.error("Error getting Label Broker QR Code:", error);
      throw error;
    }
  }
}

export default new ShippoService();
