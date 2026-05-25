import { AsyncLocalStorage } from 'async_hooks';

export interface RequestMetricsStore {
  queryCount: number;
}

export const metricsAsyncStorage = new AsyncLocalStorage<RequestMetricsStore>();

export function getCurrentMetricsStore(): RequestMetricsStore | undefined {
  return metricsAsyncStorage.getStore();
}
