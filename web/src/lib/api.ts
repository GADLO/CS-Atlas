import { useCallback, useEffect, useState } from 'react';
import type { Annotation } from './types';

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code = 'ERROR') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { 'content-type': 'application/json' } : {}),
      ...init?.headers,
    },
  });
  if (response.status === 204) return undefined as T;
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(
      body?.message || `请求失败（${response.status}）`,
      response.status,
      body?.error || 'ERROR',
    );
  }
  return body as T;
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path);
}

export function createAnnotation(input: {
  targetType: Annotation['targetType'];
  targetSlug: string;
  kind: Annotation['kind'];
  content?: string;
}): Promise<Annotation> {
  return request<Annotation>('/annotations', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function deleteAnnotation(id: number): Promise<void> {
  return request<void>(`/annotations/${id}`, { method: 'DELETE' });
}

export function useApi<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(Boolean(path));
  const [revision, setRevision] = useState(0);

  const refresh = useCallback(() => setRevision((value) => value + 1), []);

  useEffect(() => {
    if (!path) {
      setData(null);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    fetch(`/api${path}`, { signal: controller.signal })
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!response.ok) {
          throw new ApiError(
            body?.message || `请求失败（${response.status}）`,
            response.status,
            body?.error || 'ERROR',
          );
        }
        return body as T;
      })
      .then((body) => {
        setData(body);
        setLoading(false);
      })
      .catch((caught: unknown) => {
        if (caught instanceof DOMException && caught.name === 'AbortError') return;
        setError(caught instanceof Error ? caught : new Error('请求失败'));
        setLoading(false);
      });
    return () => controller.abort();
  }, [path, revision]);

  return { data, error, loading, refresh };
}

export function useAnnotations(targetType: Annotation['targetType'], targetSlug: string) {
  const path = `/annotations?targetType=${encodeURIComponent(targetType)}&targetSlug=${encodeURIComponent(targetSlug)}`;
  return useApi<{ items: Annotation[] }>(path);
}
