const SHIPPO_BASE_URL = "https://api.goshippo.com";

class ShippoClient {
  constructor(apiKey = process.env.SHIPPO_API_KEY) {
    if (!apiKey) {
      throw new Error("SHIPPO_API_KEY is required");
    }
    this.apiKey = apiKey;
    this.baseURL = SHIPPO_BASE_URL;
  }

  async makeRequest(endpoint, method = "GET", data = null) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      Authorization: `ShippoToken ${this.apiKey}`,
      "Content-Type": "application/json",
    };

    const config = {
      method,
      headers,
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, config);
      const responseData = await response.json();

      if (!response.ok) {
        console.error("Shippo API error:", responseData);
        throw new Error(
          responseData.detail || `Shippo API error: ${response.status}`
        );
      }

      return responseData;
    } catch (error) {
      console.error("Error making Shippo request:", error);
      throw error;
    }
  }

  // Create an address
  async createAddress(addressData) {
    return this.makeRequest("/addresses/", "POST", addressData);
  }

  // Create a shipment
  async createShipment(shipmentData) {
    return this.makeRequest("/shipments/", "POST", shipmentData);
  }

  // Create a transaction (label)
  async createTransaction(transactionData) {
    return this.makeRequest("/transactions/", "POST", transactionData);
  }

  // Get rates for a shipment
  async getRates(shipmentId) {
    return this.makeRequest(`/shipments/${shipmentId}/rates/`);
  }

  // Track a package
  async trackPackage(trackingNumber, carrier) {
    return this.makeRequest(`/tracks/${carrier}/${trackingNumber}/`);
  }

  // Get Label Broker QR Code for a transaction
  async getLabelBrokerQRCode(transactionId) {
    return this.makeRequest(`/transactions/${transactionId}/`);
  }
}

export default ShippoClient;
