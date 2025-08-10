// Copyright (c) WarnerMedia Direct, LLC. All rights reserved. Licensed under the MIT license.
// See the LICENSE file for license information.

import {
    BodyType,
    EndpointFeature,
    FeatureFlagType,
    IWireMockScenario,
    IWireMockWebhook,
    MatchingAttributes,
    ResponseTransformer,
    WireMockDelay,
    WireMockFault,
} from './externalTypes';

/**
 * Specifies all possible attributes that can be assigned to mocked request or response.
 * Be default, all matches happen on equality but this extends the functionality.
 * Can be provided partially or completely based on the use case.
 * For more info how each of these work, visit: http://wiremock.org/docs/
 */
export interface IWireMockFeatures {
    /**
     * If provided, will override any response status and body
     */
    fault?: WireMockFault;
    requestBodyFeature?: MatchingAttributes;
    requestCookieFeatures?: Record<string, MatchingAttributes>;
    requestEndpointFeature?: EndpointFeature;
    requestHeaderFeatures?: Record<string, MatchingAttributes>;
    requestQueryParamFeatures?: Record<string, MatchingAttributes>;
    requestFormParameterFeatures?: Record<string, MatchingAttributes>;
    requestIgnoreArrayOrder?: boolean;
    requestIgnoreExtraElements?: boolean;
    responseBodyType?: BodyType;
    responseDelay?: WireMockDelay;
    /**
     * All the scenarios start from state `Started`
     */
    scenario?: IWireMockScenario;
    /**
     * Lower the value, higher the priority
     */
    stubPriority?: number;
    webhook?: IWireMockWebhook;
    responseTransformers?: ResponseTransformer[];
}

export interface IFeatureFlagConfig {
    /** Type of feature flag */
    type: FeatureFlagType;
    /** Flag value (boolean for BOOLEAN type, percentage for PERCENTAGE type) */
    value: boolean | number;
    /** Optional conditions for conditional flags */
    conditions?: Record<string, unknown>;
}

/**
 * Interface for customer-specific feature flag configurations.
 * Enables targeted feature rollouts based on customer attributes and contexts.
 * Can be used alongside IWireMockFeatures for enhanced mock behavior control.
 */
export interface ICustomerFeatureFlags {
    /** Unique customer identifier */
    customerId: string;
    /** Customer name for human-readable identification */
    customerName?: string;
    /** Customer tier (e.g., 'free', 'premium', 'enterprise') */
    customerTier?: string;
    /** Geographic region for regional feature rollouts */
    region?: string;
    /** Feature flag configurations keyed by flag name */
    flags: Record<string, IFeatureFlagConfig>;
    /** Additional customer metadata for complex targeting */
    metadata?: Record<string, unknown>;
}
