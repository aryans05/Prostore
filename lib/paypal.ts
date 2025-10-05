// src/lib/paypal.ts

// ✅ 1. Define the base URL (sandbox for testing, live for production)
const base = process.env.PAYPAL_API_URL || "https://api-m.sandbox.paypal.com";

/**
 * ✅ Safely generate a PayPal API access token using OAuth2 credentials.
 */
export async function generateAccessToken(): Promise<string> {
  const { PAYPAL_CLIENT_ID, PAYPAL_APP_SECRET } = process.env;

  // 1️⃣ Validate environment variables
  if (!PAYPAL_CLIENT_ID || !PAYPAL_APP_SECRET) {
    throw new Error(
      "Missing PayPal credentials: PAYPAL_CLIENT_ID or PAYPAL_APP_SECRET."
    );
  }

  // 2️⃣ Prepare Basic Auth header
  const auth = Buffer.from(
    `${PAYPAL_CLIENT_ID}:${PAYPAL_APP_SECRET}`,
    "utf8"
  ).toString("base64");

  try {
    // 3️⃣ Make PayPal OAuth2 request
    const response = await fetch(`${base}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    // 4️⃣ Handle non-200 responses
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PayPal auth failed [${response.status}]: ${errorText}`);
    }

    // 5️⃣ Parse and validate response
    const data = await response.json();

    if (!data.access_token) {
      throw new Error("No access_token found in PayPal response.");
    }

    return data.access_token as string;
  } catch (error) {
    console.error("❌ Error generating PayPal access token:", error);
    throw error;
  }
}

/**
 * ✅ Helper function to handle PayPal API responses consistently.
 */
async function handleResponse(response: Response) {
  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    console.error("❌ PayPal API Error:", data);
    throw new Error(
      data?.message ||
        data?.error_description ||
        `PayPal request failed (${response.status})`
    );
  }

  return data;
}

/**
 * ✅ The PayPal API utility object.
 * You can easily extend this later (e.g., add createOrder, capturePayment).
 */
export const paypal = {
  generateAccessToken,

  // 🔹 Example placeholder functions (optional to add now)
  async createOrder(price: number) {
    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: price.toFixed(2),
            },
          },
        ],
      }),
    });

    return handleResponse(response);
  },

  async capturePayment(orderId: string) {
    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders/${orderId}/capture`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return handleResponse(response);
  },
};

export default paypal;
