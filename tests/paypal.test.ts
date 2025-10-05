import paypal, { generateAccessToken } from "../lib/paypal";

describe("PayPal API", () => {
  test("should generate a valid access token", async () => {
    // Act
    const tokenResponse = await generateAccessToken();

    // Debug log (optional)
    console.log("Generated PayPal Token:", tokenResponse);

    // Assert
    expect(typeof tokenResponse).toBe("string");
    expect(tokenResponse.length).toBeGreaterThan(0);
  });
});

// Test to create a paypal order

test("create a paypal order", async () => {
  const token = await generateAccessToken();
  const price = 10.0;
  const orderResponse = await paypal.createOrder(price);
  console.log(orderResponse);
  expect(orderResponse).toHaveProperty("id");
  expect(orderResponse).toHaveProperty("status");
  expect(orderResponse.status).toBe("CREATED");
});

// Test to capture payment with mock order

test("simulate capturing a payment from an order ", async () => {
  const orderId = "100";

  const mockCapturePayment = jest
    .spyOn(paypal, "capturePayment")
    .mockResolvedValue({
      status: "COMPLETED",
    });

  const captureResponse = await paypal.capturePayment(orderId);
  expect(captureResponse).toHaveProperty("status", "COMPLETED");
  mockCapturePayment.mockRestore();
});
