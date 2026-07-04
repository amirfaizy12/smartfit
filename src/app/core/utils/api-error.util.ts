import { HttpErrorResponse } from '@angular/common/http';

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }

  const body = error.error;

  if (typeof body === 'string' && body.trim()) {
    return body;
  }

  if (body && typeof body === 'object') {
    const record = body as Record<string, unknown>;

    if (typeof record['Message'] === 'string') {
      return record['Message'];
    }

    if (typeof record['message'] === 'string') {
      return record['message'];
    }

    if (typeof record['title'] === 'string') {
      return record['title'];
    }

    const errors = record['errors'] ?? record['Errors'];
    if (errors && typeof errors === 'object') {
      const messages = Object.values(errors as Record<string, unknown>)
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .filter((value): value is string => typeof value === 'string');

      if (messages.length) {
        return messages.join(' ');
      }
    }
  }

  return fallback;
}

export function extractNumericField(
  response: unknown,
  keys: string[]
): number | null {
  if (!response || typeof response !== 'object') {
    return null;
  }

  const sources = [response, (response as Record<string, unknown>)['data'], (response as Record<string, unknown>)['Data']];

  for (const source of sources) {
    if (!source || typeof source !== 'object') {
      continue;
    }

    for (const key of keys) {
      const value = (source as Record<string, unknown>)[key];
      if (typeof value === 'number' && !Number.isNaN(value)) {
        return value;
      }
    }
  }

  return null;
}

export function extractStringField(
  response: unknown,
  keys: string[]
): string | undefined {
  if (!response || typeof response !== 'object') {
    return undefined;
  }

  const sources = [response, (response as Record<string, unknown>)['data'], (response as Record<string, unknown>)['Data']];

  for (const source of sources) {
    if (!source || typeof source !== 'object') {
      continue;
    }

    for (const key of keys) {
      const value = (source as Record<string, unknown>)[key];
      if (typeof value === 'string' && value.trim()) {
        return value;
      }
    }
  }

  return undefined;
}
