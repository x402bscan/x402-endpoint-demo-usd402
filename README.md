# x402 Demo Payment Endpoint

Demo implementation by [x402bscan.io](https://x402bscan.io) showing how to use the `@x402bscan/x402-express` library to create payment-protected API endpoints.

## About

This is a fully configurable demo server that demonstrates the x402 payment protocol implementation. The server accepts cryptocurrency payments before granting access to protected endpoints.

**Built by**: [x402bscan.io](https://x402bscan.io)
**Library**: `@x402bscan/x402-express`
**Protocol**: x402 Payment Protocol

## Supported Token Standards

The `@x402bscan/x402-express` library is compatible with multiple token authorization methods:

- **EIP-2612 Permit** (recommended) - Gasless token approvals
- **EIP-3009** - Transfer with authorization (USDC-style)
- **Standard ERC-20 Transfer** - Traditional approve + transferFrom

## Features

- Fully configurable via environment variables
- Works with any ERC-20 compatible token
- Supports multiple blockchain networks (BSC, Ethereum, Polygon, etc.)
- Multiple authorization methods (permit, EIP-3009, transfer)
- Built-in payment verification via x402 facilitator
- Ready for production deployment

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/x402bscan/x402-endpoint-demo.git
cd x402-endpoint-demo
npm install
```

### 2. Configure Environment

Copy the example configuration:

```bash
cp .env.example .env
```

Edit `.env` and configure all required parameters:

```env
# Your payment address
PAYMENT_ADDRESS=0xYourAddressHere

# Token configuration
TOKEN_ADDRESS=0x602620956eA9a67D72914d4f122733849Fbcc8Fd
TOKEN_DECIMALS=18
TOKEN_SYMBOL=USD402
TOKEN_NAME=X402 Wrapped USD
TOKEN_VERSION=1
PAYMENT_AMOUNT=1000000000000000000

# Network configuration
NETWORK=bsc
NETWORK_NAME=BSC (Binance Smart Chain)

# Authorization configuration
AUTHORIZATION_TYPE=transfer
MAX_TIMEOUT_SECONDS=120
```

**Note:** The example uses x402bscan's default facilitator contract and service which support multiple chains.

### 3. Start Server

```bash
npm start
```

Server will start on `http://localhost:3000`

## Configuration Guide

### Required Environment Variables

All of these variables are **REQUIRED** and must be set in your `.env` file:

| Variable | Description | Example |
|----------|-------------|---------|
| `PAYMENT_ADDRESS` | Your wallet address to receive payments | `0x742d35Cc...` |
| `TOKEN_ADDRESS` | Token contract address on blockchain | `0x8d0D000E...` |
| `TOKEN_DECIMALS` | Token decimals (usually 18 or 6) | `18` |
| `TOKEN_SYMBOL` | Token symbol | `USD402`, `USDC`, `DAI` |
| `TOKEN_NAME` | Full token name for EIP-712 | `X402 Wrapped USD` |
| `TOKEN_VERSION` | Token version for EIP-712 | `1` |
| `PAYMENT_AMOUNT` | Amount in smallest unit (amount × 10^decimals) | `1000000000000000000` |
| `NETWORK` | Network identifier | `bsc`, `ethereum`, `polygon` |
| `NETWORK_NAME` | Human-readable network name | `BSC (Binance Smart Chain)` |
| `AUTHORIZATION_TYPE` | Authorization method | `permit`, `transfer` |
| `FACILITATOR_CONTRACT` | Facilitator contract address (**required only for permit**) | `0xaef29E5A6278811Cb811eCdA0910f4e3295EEfa0` |
| `MAX_TIMEOUT_SECONDS` | Payment validity timeout | `120` |
| `FACILITATOR_URL` | x402bscan facilitator service URL | `https://facilitator.x402bscan.io` |

### Optional Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |

### x402bscan Infrastructure

This demo uses x402bscan's infrastructure:

- **Facilitator Contract**: `0xaef29E5A6278811Cb811eCdA0910f4e3295EEfa0` (multi-chain support)
- **Facilitator Service**: `https://facilitator.x402bscan.io` (payment verification service)

These values are pre-configured in `.env.example` and work out of the box.

## API Endpoints

### GET /health

Health check endpoint.

```bash
curl http://localhost:3000/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-30T12:00:00.000Z"
}
```

### GET /public

Public information endpoint (no payment required).

```bash
curl http://localhost:3000/public
```

**Response:**
```json
{
  "success": true,
  "message": "This is a public endpoint, no payment required",
  "info": {
    "protectedEndpoint": "/test",
    "requiredPayment": "1000000000000000000 USD402 (smallest unit)",
    "network": "BSC (Binance Smart Chain)",
    "tokenAddress": "0x602620956eA9a67D72914d4f122733849Fbcc8Fd",
    "tokenSymbol": "USD402"
  }
}
```

### POST /test

Protected endpoint that requires payment.

```bash
curl -X POST http://localhost:3000/test
```

**First request (without payment):**
Returns HTTP 402 Payment Required with payment details and instructions.

**After payment:**
```json
{
  "success": true,
  "message": "Test successful!",
  "data": {
    "tested": true,
    "timestamp": "2025-10-30T12:00:00.000Z"
  }
}
```

## Authorization Types

### Permit (EIP-2612) - Recommended

Gasless token approval using off-chain signatures. Requires `FACILITATOR_CONTRACT` to be set.

```env
AUTHORIZATION_TYPE=permit
FACILITATOR_CONTRACT=0xaef29E5A6278811Cb811eCdA0910f4e3295EEfa0
```

*Default facilitator contract provided by x402bscan.io*

**Advantages:**
- No gas fees for approval
- Single transaction
- Better UX

**Requirements:**
- Token must support EIP-2612
- Facilitator contract deployed on network

### Transfer (Standard ERC-20)

Traditional approve + transferFrom flow.

```env
AUTHORIZATION_TYPE=transfer
```

**Advantages:**
- Works with all ERC-20 tokens
- No facilitator contract needed

**Disadvantages:**
- User pays gas for approval
- Two-step process

## Supported Networks

The x402 protocol works on any EVM-compatible network:

- **Ethereum** (`ethereum`)
- **BSC** (`bsc`)
- **Polygon** (`polygon`)
- **Arbitrum** (`arbitrum`)
- **Optimism** (`optimism`)
- **Base** (`base`)
- **Avalanche** (`avalanche`)
- And more...

## Token Examples

### X402 Wrapped USD (BSC)

```env
TOKEN_ADDRESS=0x602620956eA9a67D72914d4f122733849Fbcc8Fd
TOKEN_DECIMALS=18
TOKEN_SYMBOL=USD402
TOKEN_NAME=X402 Wrapped USD
TOKEN_VERSION=1
NETWORK=bsc
AUTHORIZATION_TYPE=transfer
```

### USDC (Ethereum)

```env
TOKEN_ADDRESS=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
TOKEN_DECIMALS=6
TOKEN_SYMBOL=USDC
TOKEN_NAME=USD Coin
TOKEN_VERSION=2
NETWORK=ethereum
AUTHORIZATION_TYPE=permit
```

### DAI (Ethereum)

```env
TOKEN_ADDRESS=0x6B175474E89094C44Da98b954EedeAC495271d0F
TOKEN_DECIMALS=18
TOKEN_SYMBOL=DAI
TOKEN_NAME=Dai Stablecoin
TOKEN_VERSION=1
NETWORK=ethereum
AUTHORIZATION_TYPE=permit
```

## Payment Amount Calculation

The `PAYMENT_AMOUNT` must be specified in the token's smallest unit:

**Formula:** `amount × 10^decimals`

**Examples:**

For 18 decimals (USD402, DAI):
- 1 token = `1000000000000000000`
- 0.5 token = `500000000000000000`
- 10 tokens = `10000000000000000000`

For 6 decimals (USDC):
- 1 token = `1000000`
- 0.5 token = `500000`
- 10 tokens = `10000000`

## Deploy to Railway

### Option 1: CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Set all required environment variables
railway variables set PAYMENT_ADDRESS=0xYourAddress
railway variables set TOKEN_ADDRESS=0x602620956eA9a67D72914d4f122733849Fbcc8Fd
railway variables set TOKEN_DECIMALS=18
railway variables set TOKEN_SYMBOL=USD402
railway variables set TOKEN_NAME="X402 Wrapped USD"
railway variables set TOKEN_VERSION=1
railway variables set PAYMENT_AMOUNT=1000000000000000000
railway variables set NETWORK=bsc
railway variables set NETWORK_NAME="BSC (Binance Smart Chain)"
railway variables set AUTHORIZATION_TYPE=transfer
railway variables set MAX_TIMEOUT_SECONDS=120
railway variables set FACILITATOR_URL=https://facilitator.x402bscan.io

# Deploy
railway up
```

### Option 2: Web Interface

1. Push code to GitHub
2. Go to [railway.app](https://railway.app)
3. Create new project from GitHub repo
4. Set all environment variables in project settings
5. Deploy automatically

## Development

### Project Structure

```
.
├── index.js              # Main server file
├── package.json          # Dependencies
├── .env.example          # Environment template
├── .env                  # Your configuration (git-ignored)
├── .gitignore           # Git ignore rules
├── railway.json         # Railway deployment config
├── README.md            # This file
└── public/
    └── favicon.svg      # Server favicon
```

### HTTP Method Validation

All endpoints enforce strict HTTP method validation:

- `/health` - GET only
- `/public` - GET only
- `/test` - POST only

Other methods return `405 Method Not Allowed`.

## Resources

- **x402bscan.io**: [https://x402bscan.io](https://x402bscan.io)
- **x402 Protocol**: [https://x402.org](https://x402.org)
- **GitHub**: [https://github.com/x402bscan/x402](https://github.com/x402bscan/x402)
- **NPM Package**: [@x402bscan/x402-express](https://www.npmjs.com/package/@x402bscan/x402-express)

## Support

For issues or questions:
- Open an issue on [GitHub](https://github.com/x402bscan/x402/issues)
- Visit [x402bscan.io](https://x402bscan.io)

## License

MIT

---

**Made with ❤️ by [x402bscan.io](https://x402bscan.io)**
