// Copyright (c) WarnerMedia Direct, LLC. All rights reserved. Licensed under the MIT license.
// See the LICENSE file for license information.

import { FeatureFlagType, ICustomerFeatureFlags, IFeatureFlagConfig } from '../../src';

describe('CustomerFeatureFlags', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    describe('FeatureFlagType enum', () => {
        test('should have correct enum values', () => {
            expect(FeatureFlagType.BOOLEAN).toBe('BOOLEAN');
            expect(FeatureFlagType.PERCENTAGE).toBe('PERCENTAGE');
            expect(FeatureFlagType.CONDITIONAL).toBe('CONDITIONAL');
            expect(FeatureFlagType.AB_TEST).toBe('AB_TEST');
        });

        test('should be importable from main index', () => {
            expect(FeatureFlagType).toBeDefined();
            expect(typeof FeatureFlagType).toBe('object');
        });
    });

    describe('IFeatureFlagConfig interface', () => {
        test('should accept boolean flag configuration', () => {
            const config: IFeatureFlagConfig = {
                type: FeatureFlagType.BOOLEAN,
                value: true,
            };

            expect(config.type).toBe(FeatureFlagType.BOOLEAN);
            expect(config.value).toBe(true);
        });

        test('should accept percentage flag configuration', () => {
            const config: IFeatureFlagConfig = {
                type: FeatureFlagType.PERCENTAGE,
                value: 75,
                conditions: { region: 'us-east' },
            };

            expect(config.type).toBe(FeatureFlagType.PERCENTAGE);
            expect(config.value).toBe(75);
            expect(config.conditions).toEqual({ region: 'us-east' });
        });

        test('should accept conditional flag configuration', () => {
            const config: IFeatureFlagConfig = {
                type: FeatureFlagType.CONDITIONAL,
                value: true,
                conditions: {
                    customerTier: 'premium',
                    region: 'us-west',
                },
            };

            expect(config.type).toBe(FeatureFlagType.CONDITIONAL);
            expect(config.value).toBe(true);
            expect(config.conditions).toEqual({
                customerTier: 'premium',
                region: 'us-west',
            });
        });

        test('should accept A/B test flag configuration', () => {
            const config: IFeatureFlagConfig = {
                type: FeatureFlagType.AB_TEST,
                value: false,
            };

            expect(config.type).toBe(FeatureFlagType.AB_TEST);
            expect(config.value).toBe(false);
        });
    });

    describe('ICustomerFeatureFlags interface', () => {
        test('should accept minimal customer feature flags configuration', () => {
            const customerFlags: ICustomerFeatureFlags = {
                customerId: 'customer-123',
                flags: {
                    'new-ui': {
                        type: FeatureFlagType.BOOLEAN,
                        value: true,
                    },
                },
            };

            expect(customerFlags.customerId).toBe('customer-123');
            expect(customerFlags.flags['new-ui']!.type).toBe(FeatureFlagType.BOOLEAN);
            expect(customerFlags.flags['new-ui']!.value).toBe(true);
        });

        test('should accept complete customer feature flags configuration', () => {
            const customerFlags: ICustomerFeatureFlags = {
                customerId: 'customer-456',
                customerName: 'Acme Corp',
                customerTier: 'enterprise',
                region: 'us-east',
                flags: {
                    'beta-feature': {
                        type: FeatureFlagType.PERCENTAGE,
                        value: 50,
                        conditions: { environment: 'production' },
                    },
                    'premium-feature': {
                        type: FeatureFlagType.CONDITIONAL,
                        value: true,
                        conditions: { tier: 'premium' },
                    },
                },
                metadata: {
                    segment: 'enterprise',
                    onboardingDate: '2024-01-15',
                },
            };

            expect(customerFlags.customerId).toBe('customer-456');
            expect(customerFlags.customerName).toBe('Acme Corp');
            expect(customerFlags.customerTier).toBe('enterprise');
            expect(customerFlags.region).toBe('us-east');
            expect(customerFlags.flags['beta-feature']!.type).toBe(FeatureFlagType.PERCENTAGE);
            expect(customerFlags.flags['beta-feature']!.value).toBe(50);
            expect(customerFlags.flags['premium-feature']!.type).toBe(FeatureFlagType.CONDITIONAL);
            expect(customerFlags.metadata).toEqual({
                segment: 'enterprise',
                onboardingDate: '2024-01-15',
            });
        });

        test('should support multiple flag types in single configuration', () => {
            const customerFlags: ICustomerFeatureFlags = {
                customerId: 'customer-789',
                flags: {
                    'boolean-flag': {
                        type: FeatureFlagType.BOOLEAN,
                        value: false,
                    },
                    'percentage-flag': {
                        type: FeatureFlagType.PERCENTAGE,
                        value: 25,
                    },
                    'conditional-flag': {
                        type: FeatureFlagType.CONDITIONAL,
                        value: true,
                        conditions: { userType: 'admin' },
                    },
                    'ab-test-flag': {
                        type: FeatureFlagType.AB_TEST,
                        value: true,
                        conditions: { variant: 'A' },
                    },
                },
            };

            expect(Object.keys(customerFlags.flags)).toHaveLength(4);
            expect(customerFlags.flags['boolean-flag']!.type).toBe(FeatureFlagType.BOOLEAN);
            expect(customerFlags.flags['percentage-flag']!.type).toBe(FeatureFlagType.PERCENTAGE);
            expect(customerFlags.flags['conditional-flag']!.type).toBe(FeatureFlagType.CONDITIONAL);
            expect(customerFlags.flags['ab-test-flag']!.type).toBe(FeatureFlagType.AB_TEST);
        });
    });
});
