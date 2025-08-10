import axios from 'axios';
import { WireMock } from '../../src';

interface Product {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

interface CheckoutRequest {
    products: Product[];
    customerId: string;
    paymentMethod: string;
    shippingAddress: {
        street: string;
        city: string;
        zipCode: string;
        country: string;
    };
}

interface InventoryResponse {
    available: boolean;
    reservationId: string;
    message: string;
}

interface PaymentResponse {
    success: boolean;
    transactionId: string;
    amount: number;
    message: string;
}

interface ShippingResponse {
    success: boolean;
    trackingNumber: string;
    estimatedDelivery: string;
    message: string;
}

class EcommerceCheckoutDemo {
    private wireMock: WireMock;
    private wiremockUrl = 'http://localhost:8080';

    constructor() {
        this.wireMock = new WireMock(this.wiremockUrl);
    }

    async setupMockServices(): Promise<void> {
        console.log('🔧 Setting up mock services...');

        await this.setupInventoryService();
        await this.setupPaymentService();
        await this.setupShippingService();

        console.log('✅ All mock services configured successfully');
    }

    private async setupInventoryService(): Promise<void> {
        await this.wireMock.register(
            {
                method: 'POST',
                endpoint: '/api/inventory/check',
                body: {
                    products: [
                        {
                            id: 'laptop-001',
                            name: 'Gaming Laptop',
                            price: 1299.99,
                            quantity: 2,
                        },
                    ],
                    customerId: 'customer-123',
                },
            },
            {
                status: 200,
                body: {
                    available: true,
                    reservationId: 'res-inv-456',
                    message: 'Products reserved successfully',
                },
            },
            {
                scenario: {
                    scenarioName: 'checkout-flow',
                    requiredScenarioState: 'Started',
                    newScenarioState: 'InventoryChecked',
                },
                stubPriority: 1,
            },
        );

        console.log('📦 Inventory service mock configured');
    }

    private async setupPaymentService(): Promise<void> {
        await this.wireMock.register(
            {
                method: 'POST',
                endpoint: '/api/payment/process',
                body: {
                    reservationId: 'res-inv-456',
                    amount: 2599.98,
                    paymentMethod: 'credit-card',
                    customerId: 'customer-123',
                },
            },
            {
                status: 200,
                body: {
                    success: true,
                    transactionId: 'txn-pay-789',
                    amount: 2599.98,
                    message: 'Payment processed successfully',
                },
            },
            {
                scenario: {
                    scenarioName: 'checkout-flow',
                    requiredScenarioState: 'InventoryChecked',
                    newScenarioState: 'PaymentProcessed',
                },
                stubPriority: 1,
            },
        );

        console.log('💳 Payment service mock configured');
    }

    private async setupShippingService(): Promise<void> {
        await this.wireMock.register(
            {
                method: 'POST',
                endpoint: '/api/shipping/arrange',
                body: {
                    transactionId: 'txn-pay-789',
                    customerId: 'customer-123',
                    shippingAddress: {
                        street: '123 Main St',
                        city: 'San Francisco',
                        zipCode: '94105',
                        country: 'USA',
                    },
                },
            },
            {
                status: 200,
                body: {
                    success: true,
                    trackingNumber: 'TRK-SHP-101112',
                    estimatedDelivery: '2025-08-15',
                    message: 'Shipping arranged successfully',
                },
            },
            {
                scenario: {
                    scenarioName: 'checkout-flow',
                    requiredScenarioState: 'PaymentProcessed',
                    newScenarioState: 'ShippingArranged',
                },
                stubPriority: 1,
            },
        );

        console.log('🚚 Shipping service mock configured');
    }

    async executeCheckoutFlow(): Promise<void> {
        console.log('\n🛒 Starting e-commerce checkout flow...\n');

        const checkoutData: CheckoutRequest = {
            products: [
                {
                    id: 'laptop-001',
                    name: 'Gaming Laptop',
                    price: 1299.99,
                    quantity: 2,
                },
            ],
            customerId: 'customer-123',
            paymentMethod: 'credit-card',
            shippingAddress: {
                street: '123 Main St',
                city: 'San Francisco',
                zipCode: '94105',
                country: 'USA',
            },
        };

        try {
            const inventoryResponse = await this.checkInventory(checkoutData);
            const paymentResponse = await this.processPayment(inventoryResponse, checkoutData);
            const shippingResponse = await this.arrangeShipping(paymentResponse, checkoutData);

            console.log('\n🎉 Checkout flow completed successfully!');
            console.log(`📦 Reservation ID: ${inventoryResponse.reservationId}`);
            console.log(`💳 Transaction ID: ${paymentResponse.transactionId}`);
            console.log(`🚚 Tracking Number: ${shippingResponse.trackingNumber}`);
            console.log(`📅 Estimated Delivery: ${shippingResponse.estimatedDelivery}`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('❌ Checkout flow failed:', errorMessage);
            throw error;
        }
    }

    private async checkInventory(checkoutData: CheckoutRequest): Promise<InventoryResponse> {
        console.log('1️⃣ Checking inventory availability...');

        const response = await axios.post(`${this.wiremockUrl}/api/inventory/check`, {
            products: checkoutData.products,
            customerId: checkoutData.customerId,
        });

        const inventoryResponse: InventoryResponse = response.data;
        console.log(`   ✅ ${inventoryResponse.message}`);
        console.log(`   📋 Reservation ID: ${inventoryResponse.reservationId}`);

        return inventoryResponse;
    }

    private async processPayment(
        inventoryResponse: InventoryResponse,
        checkoutData: CheckoutRequest,
    ): Promise<PaymentResponse> {
        console.log('\n2️⃣ Processing payment...');

        const totalAmount = checkoutData.products.reduce(
            (sum, product) => sum + product.price * product.quantity,
            0,
        );

        const response = await axios.post(`${this.wiremockUrl}/api/payment/process`, {
            reservationId: inventoryResponse.reservationId,
            amount: totalAmount,
            paymentMethod: checkoutData.paymentMethod,
            customerId: checkoutData.customerId,
        });

        const paymentResponse: PaymentResponse = response.data;
        console.log(`   ✅ ${paymentResponse.message}`);
        console.log(`   💰 Amount: $${paymentResponse.amount}`);
        console.log(`   🧾 Transaction ID: ${paymentResponse.transactionId}`);

        return paymentResponse;
    }

    private async arrangeShipping(
        paymentResponse: PaymentResponse,
        checkoutData: CheckoutRequest,
    ): Promise<ShippingResponse> {
        console.log('\n3️⃣ Arranging shipping...');

        const response = await axios.post(`${this.wiremockUrl}/api/shipping/arrange`, {
            transactionId: paymentResponse.transactionId,
            customerId: checkoutData.customerId,
            shippingAddress: checkoutData.shippingAddress,
        });

        const shippingResponse: ShippingResponse = response.data;
        console.log(`   ✅ ${shippingResponse.message}`);
        console.log(`   📦 Tracking Number: ${shippingResponse.trackingNumber}`);
        console.log(`   📅 Estimated Delivery: ${shippingResponse.estimatedDelivery}`);

        return shippingResponse;
    }

    async showRequestHistory(): Promise<void> {
        console.log('\n📊 Request History:');

        const inventoryRequests = await this.wireMock.getRequestsForAPI(
            'POST',
            '/api/inventory/check',
        );
        const paymentRequests = await this.wireMock.getRequestsForAPI(
            'POST',
            '/api/payment/process',
        );
        const shippingRequests = await this.wireMock.getRequestsForAPI(
            'POST',
            '/api/shipping/arrange',
        );

        console.log(`   📦 Inventory service calls: ${inventoryRequests.length}`);
        console.log(`   💳 Payment service calls: ${paymentRequests.length}`);
        console.log(`   🚚 Shipping service calls: ${shippingRequests.length}`);

        const allRequests = await this.wireMock.getAllRequests();
        console.log(`   📈 Total API calls: ${allRequests.length}`);
    }

    async showScenarioStates(): Promise<void> {
        console.log('\n🎭 Scenario States:');
        const scenarios = await this.wireMock.getAllScenarios();
        scenarios.forEach((scenario: any) => {
            console.log(`   📋 Scenario: ${scenario.name}, State: ${scenario.state}`);
        });
    }

    async cleanup(): Promise<void> {
        console.log('\n🧹 Cleaning up mock services...');
        await this.wireMock.clearAll();
        console.log('✅ Cleanup completed');
    }
}

async function runDemo(): Promise<void> {
    const demo = new EcommerceCheckoutDemo();

    try {
        await demo.setupMockServices();
        await demo.executeCheckoutFlow();
        await demo.showRequestHistory();
        await demo.showScenarioStates();
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Demo failed:', errorMessage);
        process.exit(1);
    } finally {
        await demo.cleanup();
    }
}

if (require.main === module) {
    runDemo().catch(console.error);
}

export { EcommerceCheckoutDemo };
