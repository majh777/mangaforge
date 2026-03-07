import { ApiError } from '@/lib/server/errors';

interface StringOptions {
  required?: boolean;
  min?: number;
  max?: number;
  field: string;
  fallback?: string;
}

interface NumberOptions {
  required?: boolean;
  min?: number;
  max?: number;
  field: string;
  fallback?: number;
}

export function readString(value: unknown, options: StringOptions): string {
  const {
    required = true,
    min = 0,
    max = 5000,
    field,
    fallback = '',
  } = options;

  if (value == null || value === '') {
    if (!required) return fallback;
    throw new ApiError(400, 'VALIDATION_ERROR', `${field} is required`);
  }

  if (typeof value !== 'string') {
    throw new ApiError(400, 'VALIDATION_ERROR', `${field} must be a string`);
  }

  const trimmed = value.trim();
  if (trimmed.length < min) {
    throw new ApiError(400, 'VALIDATION_ERROR', `${field} must be at least ${min} characters`);
  }

  if (trimmed.length > max) {
    throw new ApiError(400, 'VALIDATION_ERROR', `${field} must be at most ${max} characters`);
  }

  return trimmed;
}

export function readNumber(value: unknown, options: NumberOptions): number {
  const {
    required = true,
    min = Number.NEGATIVE_INFINITY,
    max = Number.POSITIVE_INFINITY,
    field,
    fallback = 0,
  } = options;

  if (value == null || value === '') {
    if (!required) return fallback;
    throw new ApiError(400, 'VALIDATION_ERROR', `${field} is required`);
  }

  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new ApiError(400, 'VALIDATION_ERROR', `${field} must be a number`);
  }

  if (value < min || value > max) {
    throw new ApiError(
      400,
      'VALIDATION_ERROR',
      `${field} must be between ${min} and ${max}`
    );
  }

  return value;
}

export function readEnum<T extends string>(
  value: unknown,
  values: readonly T[],
  field: string,
  fallback?: T
): T {
  if (value == null || value === '') {
    if (fallback !== undefined) return fallback;
    throw new ApiError(400, 'VALIDATION_ERROR', `${field} is required`);
  }

  if (typeof value !== 'string' || !values.includes(value as T)) {
    throw new ApiError(
      400,
      'VALIDATION_ERROR',
      `${field} must be one of: ${values.join(', ')}`
    );
  }

  return value as T;
}

export function readStringArray(value: unknown, field: string, max = 20): string[] {
  if (value == null) return [];
  if (!Array.isArray(value)) {
    throw new ApiError(400, 'VALIDATION_ERROR', `${field} must be an array`);
  }

  if (value.length > max) {
    throw new ApiError(400, 'VALIDATION_ERROR', `${field} can contain at most ${max} items`);
  }

  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function safeJson<T = Record<string, unknown>>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new ApiError(400, 'INVALID_JSON', 'Body must be valid JSON');
  }
}
