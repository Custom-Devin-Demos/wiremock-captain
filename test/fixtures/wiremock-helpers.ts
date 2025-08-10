// Copyright (c) WarnerMedia Direct, LLC. All rights reserved. Licensed under the MIT license.
// See the LICENSE file for license information.

import { WireMock } from '../../src';

export class WireMockTestHelper {
    private wireMock: WireMock;

    constructor(baseUrl: string = 'http://localhost:8080') {
        this.wireMock = new WireMock(baseUrl);
    }

    /**
     * Clean setup for tests - clears all except default mappings
     */
    async setupTest(): Promise<void> {
        await this.wireMock.clearAllExceptDefault();
    }

    /**
     * Complete cleanup for tests - clears all mappings and requests
     */
    async teardownTest(): Promise<void> {
        await this.wireMock.clearAll();
    }

    /**
     * Wait for WireMock to be ready
     */
    async waitForReady(timeoutMs: number = 30000): Promise<void> {
        const startTime = Date.now();
        while (Date.now() - startTime < timeoutMs) {
            try {
                await this.wireMock.getAllMappings();
                return;
            } catch (error) {
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
        }
        throw new Error(`WireMock not ready after ${timeoutMs}ms`);
    }

    /**
     * Verify no unmatched requests remain
     */
    async verifyNoUnmatchedRequests(): Promise<void> {
        const unmatched = await this.wireMock.getUnmatchedRequests();
        if (unmatched.length > 0) {
            console.warn('Unmatched requests found:', unmatched);
        }
    }

    get client(): WireMock {
        return this.wireMock;
    }
}
