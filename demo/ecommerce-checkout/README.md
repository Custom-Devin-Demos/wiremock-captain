# E-commerce Checkout Demo

This demo showcases how to use `wiremock-captain` to mock multiple product services during an e-commerce checkout flow. It demonstrates the communication between inventory, payment, and shipping services using WireMock's scenario system for stateful workflows.

## Overview

The demo simulates a realistic e-commerce checkout process with three interconnected services:

1. **Inventory Service** - Checks product availability and reserves items
2. **Payment Service** - Processes payment for reserved items  
3. **Shipping Service** - Arranges shipping for paid orders

Each service depends on the successful completion of the previous service, creating a stateful workflow using WireMock scenarios.

## Architecture

```
Customer Checkout Request
         ↓
    Inventory Service (/api/inventory/check)
         ↓ (scenario: Started → InventoryChecked)
    Payment Service (/api/payment/process)  
         ↓ (scenario: InventoryChecked → PaymentProcessed)
    Shipping Service (/api/shipping/arrange)
         ↓ (scenario: PaymentProcessed → ShippingArranged)
    Checkout Complete
```

## Prerequisites

1. **Docker** - Required to run the WireMock container
2. **Node.js** - To run the demo script
3. **TypeScript** - For compilation (if running TypeScript directly)

## Setup & Running

### 1. Start WireMock Container

First, start the WireMock Docker container:

```bash
docker run -itd --rm -p 8080:8080 --name mocked-service wiremock/wiremock:3.9.1 --verbose
```

This starts WireMock on `http://localhost:8080` with verbose logging enabled.

### 2. Install Dependencies

From the root of the wiremock-captain repository:

```bash
npm install
npm run build
```

### 3. Run the Demo

```bash
# From the root directory
npm run demo:ecommerce

# Or run directly with ts-node
npx ts-node demo/ecommerce-checkout/checkout-demo.ts

# Or compile and run
npx tsc demo/ecommerce-checkout/checkout-demo.ts
node demo/ecommerce-checkout/checkout-demo.js
```

## What the Demo Does

### 1. Service Setup
- Registers three mock endpoints with WireMock
- Configures scenario-based state transitions
- Sets up realistic request/response patterns

### 2. Checkout Flow Execution
- **Step 1**: Checks inventory for 2 Gaming Laptops ($1,299.99 each)
- **Step 2**: Processes payment for $2,599.98 total
- **Step 3**: Arranges shipping to customer address

### 3. Verification
- Shows request history for each service
- Displays scenario state transitions
- Demonstrates successful service communication

## Expected Output

```
🔧 Setting up mock services...
📦 Inventory service mock configured
💳 Payment service mock configured
🚚 Shipping service mock configured
✅ All mock services configured successfully

🛒 Starting e-commerce checkout flow...

1️⃣ Checking inventory availability...
   ✅ Products reserved successfully
   📋 Reservation ID: res-inv-456

2️⃣ Processing payment...
   ✅ Payment processed successfully
   💰 Amount: $2599.98
   🧾 Transaction ID: txn-pay-789

3️⃣ Arranging shipping...
   ✅ Shipping arranged successfully
   📦 Tracking Number: TRK-SHP-101112
   📅 Estimated Delivery: 2025-08-15

🎉 Checkout flow completed successfully!
📦 Reservation ID: res-inv-456
💳 Transaction ID: txn-pay-789
🚚 Tracking Number: TRK-SHP-101112
📅 Estimated Delivery: 2025-08-15

📊 Request History:
   📦 Inventory service calls: 1
   💳 Payment service calls: 1
   🚚 Shipping service calls: 1
   📈 Total API calls: 3

🎭 Scenario States:
   📋 Scenario: checkout-flow, State: ShippingArranged

🧹 Cleaning up mock services...
✅ Cleanup completed
```

## Key Features Demonstrated

### Stateful Workflows with Scenarios
- Uses WireMock scenarios to enforce service call ordering
- Each service requires the previous service to complete successfully
- Demonstrates realistic e-commerce business logic

### Multiple Service Integration
- Shows how to register multiple endpoints for different services
- Demonstrates service-to-service communication patterns
- Uses realistic request/response data structures

### Request History & Verification
- Tracks all API calls made during the checkout process
- Provides visibility into service communication
- Useful for debugging and testing

### Error Handling
- Includes proper error handling for failed service calls
- Demonstrates how scenarios prevent out-of-order operations
- Shows cleanup procedures

## Customization

You can modify the demo to:

- Add more products to the checkout
- Include different payment methods
- Add error scenarios (out of stock, payment failures, etc.)
- Extend with additional services (tax calculation, promotions, etc.)
- Modify the scenario flow for different business logic

## Troubleshooting

### WireMock Container Issues
```bash
# Check if container is running
docker ps | grep mocked-service

# View WireMock logs
docker logs mocked-service

# Restart container if needed
docker stop mocked-service
docker run -itd --rm -p 8080:8080 --name mocked-service wiremock/wiremock:3.9.1 --verbose
```

### Port Conflicts
If port 8080 is already in use, modify the Docker command:
```bash
docker run -itd --rm -p 8081:8080 --name mocked-service wiremock/wiremock:3.9.1 --verbose
```

Then update the `wiremockUrl` in the demo script to `http://localhost:8081`.

## Learning Resources

- [WireMock Documentation](http://wiremock.org/docs/)
- [WireMock Captain GitHub](https://github.com/HBOCodeLabs/wiremock-captain)
- [Scenarios Documentation](http://wiremock.org/docs/stateful-behaviour/)
