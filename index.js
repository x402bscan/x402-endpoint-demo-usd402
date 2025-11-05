require("dotenv").config();
const express = require("express");
const { paymentMiddleware } = require("@x402bscan/x402-express");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files (for favicon and logo)
app.use(express.static("public"));

// Serve favicon explicitly
app.get("/favicon.ico", (_req, res) => {
  res.redirect(301, "/favicon.svg");
});

// ============================================================================
// REQUIRED ENVIRONMENT VARIABLES - All must be set in .env file
// ============================================================================

const REQUIRED_ENV_VARS = [
  "PAYMENT_ADDRESS",
  "TOKEN_ADDRESS",
  "TOKEN_DECIMALS",
  "TOKEN_SYMBOL",
  "TOKEN_NAME",
  "TOKEN_VERSION",
  "PAYMENT_AMOUNT",
  "NETWORK",
  "NETWORK_NAME",
  "AUTHORIZATION_TYPE",
  "MAX_TIMEOUT_SECONDS",
  "FACILITATOR_URL"
];

// Check all required environment variables
const missingVars = REQUIRED_ENV_VARS.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error("ERROR: Missing required environment variables:");
  missingVars.forEach(varName => console.error(`  - ${varName}`));
  console.error("\nPlease set all required variables in your .env file");
  console.error("See .env.example for reference");
  process.exit(1);
}

// Additional validation: FACILITATOR_CONTRACT is required when using permit
if (process.env.AUTHORIZATION_TYPE === "permit" && !process.env.FACILITATOR_CONTRACT) {
  console.error("ERROR: FACILITATOR_CONTRACT is required when AUTHORIZATION_TYPE is 'permit'");
  console.error("Please set FACILITATOR_CONTRACT in your .env file");
  process.exit(1);
}

// Load all configuration from environment
const PAYMENT_ADDRESS = process.env.PAYMENT_ADDRESS;
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS;
const TOKEN_DECIMALS = parseInt(process.env.TOKEN_DECIMALS);
const TOKEN_SYMBOL = process.env.TOKEN_SYMBOL;
const TOKEN_NAME = process.env.TOKEN_NAME;
const TOKEN_VERSION = process.env.TOKEN_VERSION;
const PAYMENT_AMOUNT = process.env.PAYMENT_AMOUNT;
const NETWORK = process.env.NETWORK;
const NETWORK_NAME = process.env.NETWORK_NAME;
const AUTHORIZATION_TYPE = process.env.AUTHORIZATION_TYPE;
const MAX_TIMEOUT_SECONDS = parseInt(process.env.MAX_TIMEOUT_SECONDS);
const FACILITATOR_CONTRACT = process.env.FACILITATOR_CONTRACT;

// x402 facilitator configuration
// The facilitator is the service that verifies and processes payments
// Using x402bscan facilitator service
const FACILITATOR_CONFIG = {
  url: process.env.FACILITATOR_URL,
  // Optional: add authentication headers if your facilitator requires it
  // createAuthHeaders: async () => ({
  //   verify: { "Authorization": "Bearer token" },
  //   settle: { "Authorization": "Bearer token" }
  // })
};

// Public endpoint to test that the server works
app.get("/public", (req, res) => {
  res.json({
    success: true,
    message: "This is a public endpoint, no payment required",
    info: {
      protectedEndpoint: "/test",
      requiredPayment: `${PAYMENT_AMOUNT} ${TOKEN_SYMBOL} (smallest unit)`,
      network: NETWORK_NAME,
      tokenAddress: TOKEN_ADDRESS,
      tokenSymbol: TOKEN_SYMBOL,
    },
  });
});

// Block non-GET methods on /api/public
app.all("/public", (req, res) => {
  res.status(405).json({
    success: false,
    error: "Method Not Allowed",
    message: "Only GET method is allowed for /api/public endpoint",
    allowedMethods: ["GET"],
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Block non-GET methods on /health
app.all("/health", (req, res) => {
  res.status(405).json({
    success: false,
    error: "Method Not Allowed",
    message: "Only GET method is allowed for /health endpoint",
    allowedMethods: ["GET"],
  });
});

// Configure x402 payment middleware
const testPaymentMiddleware = paymentMiddleware(
  PAYMENT_ADDRESS,
  {
    "/test": {
      price: {
        amount: PAYMENT_AMOUNT,
        asset: {
          address: TOKEN_ADDRESS,
          decimals: TOKEN_DECIMALS,
          symbol: TOKEN_SYMBOL,
          eip712: {
            name: TOKEN_NAME,
            version: TOKEN_VERSION,
          },
        },
      },
      network: NETWORK,
      config: {
        description: `Test access - ${PAYMENT_AMOUNT} ${TOKEN_SYMBOL}`,
        mimeType: "application/json",
        maxTimeoutSeconds: MAX_TIMEOUT_SECONDS,
        authorizationType: AUTHORIZATION_TYPE,
        facilitatorContract: FACILITATOR_CONTRACT,
      },
    },
  },
  // Facilitator configuration
  // The facilitator verifies and processes payments on the blockchain
  FACILITATOR_CONFIG,
  // Paywall configuration (optional)
  {
    appName: "x402Bscan",
    appLogo: "/logo.svg",
  }
);

// Test endpoint that requires a payment of 1 USD402
// Only POST method is allowed, x402 middleware applied only to POST
app.route("/test")
  .post(testPaymentMiddleware, (_req, res) => {
    res.json({
      success: true,
      message: "Test successful!",
      data: {
        tested: true,
        timestamp: new Date().toISOString(),
      },
    });
  })
  .all((_req, res) => {
    res.status(405).json({
      success: false,
      error: "Method Not Allowed",
      message: "Only POST method is allowed for /test endpoint",
      allowedMethods: ["POST"],
    });
  });

// Start the server
app.listen(PORT, () => {
  console.log(`\n${"=".repeat(70)}`);
  console.log(`x402 Demo Server Started`);
  console.log(`${"=".repeat(70)}`);
  console.log(`\nServer URL: http://localhost:${PORT}`);
  console.log(`\nNetwork Configuration:`);
  console.log(`  Network: ${NETWORK_NAME} (${NETWORK})`);
  console.log(`  Token: ${TOKEN_NAME} (${TOKEN_SYMBOL})`);
  console.log(`  Token Address: ${TOKEN_ADDRESS}`);
  console.log(`  Token Decimals: ${TOKEN_DECIMALS}`);
  console.log(`\nPayment Configuration:`);
  console.log(`  Payment Address: ${PAYMENT_ADDRESS}`);
  console.log(`  Required Amount: ${PAYMENT_AMOUNT} (smallest unit)`);
  console.log(`  Authorization Type: ${AUTHORIZATION_TYPE}`);
  console.log(`  Facilitator Contract: ${FACILITATOR_CONTRACT}`);
  console.log(`  Timeout: ${MAX_TIMEOUT_SECONDS} seconds`);
  console.log(`\nAvailable Endpoints:`);
  console.log(`  GET  /health       - Health check`);
  console.log(`  GET  /public       - Public endpoint (no payment)`);
  console.log(`  POST /test         - Protected endpoint (requires payment)`);
  console.log(`\n${"=".repeat(70)}\n`);
});
