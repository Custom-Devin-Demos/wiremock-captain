// Copyright (c) WarnerMedia Direct, LLC. All rights reserved. Licensed under the MIT license.
// See the LICENSE file for license information.

import { MatchingAttributes } from './types/externalTypes';
import { Method } from './types/internalTypes';

export interface RequestFilter {
    type: 'method' | 'url' | 'header' | 'body' | 'queryParam';
    field?: string;
    value: unknown;
    strategy: MatchingAttributes;
}

export interface FilterCombination {
    type: 'and' | 'or';
    filters: (RequestFilter | FilterCombination)[];
}

export class RequestFilterBuilder {
    private filters: (RequestFilter | FilterCombination)[] = [];
    private currentCombination: 'and' | 'or' = 'and';

    method(method: Method): RequestFilterBuilder {
        this.filters.push({
            type: 'method',
            value: method,
            strategy: MatchingAttributes.EqualTo,
        });
        return this;
    }

    url(
        url: string,
        strategy: MatchingAttributes = MatchingAttributes.EqualTo,
    ): RequestFilterBuilder {
        this.filters.push({
            type: 'url',
            value: url,
            strategy,
        });
        return this;
    }

    header(
        name: string,
        value: string,
        strategy: MatchingAttributes = MatchingAttributes.EqualTo,
    ): RequestFilterBuilder {
        this.filters.push({
            type: 'header',
            field: name,
            value,
            strategy,
        });
        return this;
    }

    body(
        jsonPath: string,
        value: unknown,
        strategy: MatchingAttributes = MatchingAttributes.MatchesJsonPath,
    ): RequestFilterBuilder {
        this.filters.push({
            type: 'body',
            field: jsonPath,
            value,
            strategy,
        });
        return this;
    }

    queryParam(
        name: string,
        value: string,
        strategy: MatchingAttributes = MatchingAttributes.EqualTo,
    ): RequestFilterBuilder {
        this.filters.push({
            type: 'queryParam',
            field: name,
            value,
            strategy,
        });
        return this;
    }

    and(): RequestFilterBuilder {
        this.currentCombination = 'and';
        return this;
    }

    or(): RequestFilterBuilder {
        this.currentCombination = 'or';
        return this;
    }

    build(): (request: unknown) => boolean {
        return (request: unknown) => {
            return this.evaluateFilters(this.filters, request, this.currentCombination);
        };
    }

    private evaluateFilters(
        filters: (RequestFilter | FilterCombination)[],
        request: unknown,
        combination: 'and' | 'or',
    ): boolean {
        if (filters.length === 0) return true;

        const results = filters.map((filter) => {
            if (
                'type' in filter &&
                (filter.type === 'method' ||
                    filter.type === 'url' ||
                    filter.type === 'header' ||
                    filter.type === 'body' ||
                    filter.type === 'queryParam')
            ) {
                return this.evaluateFilter(filter, request);
            } else if ('type' in filter && (filter.type === 'and' || filter.type === 'or')) {
                return this.evaluateFilters(filter.filters, request, filter.type);
            }
            return false;
        });

        return combination === 'and'
            ? results.every((result) => result)
            : results.some((result) => result);
    }

    private evaluateFilter(filter: RequestFilter, request: unknown): boolean {
        const req = (request as { request: Record<string, unknown> }).request;

        switch (filter.type) {
            case 'method': {
                return this.matchValue(req.method, filter.value, filter.strategy);
            }
            case 'url': {
                return this.matchValue(req.url, filter.value, filter.strategy);
            }
            case 'header': {
                const headers = req.headers as Record<string, string> | undefined;
                const headerValue = headers?.[filter.field || ''];
                return headerValue
                    ? this.matchValue(headerValue, filter.value, filter.strategy)
                    : false;
            }
            case 'body': {
                if (filter.strategy === MatchingAttributes.MatchesJsonPath) {
                    return this.matchJsonPath(req.body, filter.field || '', filter.value);
                } else {
                    return this.matchValue(req.body, filter.value, filter.strategy);
                }
            }
            case 'queryParam': {
                const queryParams = this.parseQueryParams(req.url as string);
                const paramValue = queryParams[filter.field || ''];
                return paramValue
                    ? this.matchValue(paramValue, filter.value, filter.strategy)
                    : false;
            }
            default: {
                return false;
            }
        }
    }

    private matchValue(actual: unknown, expected: unknown, strategy: MatchingAttributes): boolean {
        switch (strategy) {
            case MatchingAttributes.EqualTo:
                return actual === expected;

            case MatchingAttributes.Contains:
                return (
                    typeof actual === 'string' &&
                    typeof expected === 'string' &&
                    actual.includes(expected)
                );

            case MatchingAttributes.Matches:
                return (
                    typeof actual === 'string' &&
                    typeof expected === 'string' &&
                    new RegExp(expected).test(actual)
                );

            case MatchingAttributes.DoesNotMatch:
                return (
                    typeof actual === 'string' &&
                    typeof expected === 'string' &&
                    !new RegExp(expected).test(actual)
                );

            case MatchingAttributes.EqualToJson:
                try {
                    return (
                        typeof actual === 'string' &&
                        JSON.stringify(JSON.parse(actual)) === JSON.stringify(expected)
                    );
                } catch {
                    return false;
                }

            case MatchingAttributes.BinaryEqualTo:
                return actual === expected;

            case MatchingAttributes.EqualToXml:
                return actual === expected;

            default:
                return false;
        }
    }

    private matchJsonPath(body: unknown, jsonPath: string, expectedValue: unknown): boolean {
        try {
            const parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
            const actualValue = this.getValueByJsonPath(parsedBody, jsonPath);
            return actualValue === expectedValue;
        } catch {
            return false;
        }
    }

    private getValueByJsonPath(obj: unknown, path: string): unknown {
        const pathParts = path.replace(/^\$\./, '').split('.');
        let current: unknown = obj;

        for (const part of pathParts) {
            if (current === null || current === undefined) {
                return undefined;
            }

            if (part.includes('[') && part.includes(']')) {
                const [key, indexStr] = part.split('[');
                if (indexStr && key && typeof current === 'object' && current !== null) {
                    const index = parseInt(indexStr.replace(']', ''), 10);
                    if (!isNaN(index)) {
                        const currentObj = current as Record<string, unknown>;
                        const arrayValue = currentObj[key];
                        if (Array.isArray(arrayValue)) {
                            current = arrayValue[index];
                        } else {
                            current = undefined;
                        }
                    } else {
                        current = undefined;
                    }
                } else {
                    current = undefined;
                }
            } else {
                if (typeof current === 'object' && current !== null) {
                    const currentObj = current as Record<string, unknown>;
                    current = currentObj[part];
                } else {
                    current = undefined;
                }
            }
        }

        return current;
    }

    private parseQueryParams(url: string): Record<string, string> {
        const queryString = url.split('?')[1];
        if (!queryString) return {};

        const params: Record<string, string> = {};
        queryString.split('&').forEach((param) => {
            const [key, value] = param.split('=');
            if (key && value) {
                params[decodeURIComponent(key)] = decodeURIComponent(value);
            }
        });

        return params;
    }
}
