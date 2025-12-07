export class ApiError extends Error {
  constructor(message: string, public status: number, public code?: string) {
    super(message)
    this.name = 'ApiError'
  }
}

export interface RequestConfig extends RequestInit {
  timeout?: number
}

const DEFAULT_TIMEOUT = 10000

/**
 * Base API client with fetch wrapper
 */
export const apiClient = async <T>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<T> => {
  const { timeout = DEFAULT_TIMEOUT, ...fetchConfig } = config

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  const baseUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'http://localhost:3000'

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...fetchConfig,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...fetchConfig.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(
        errorData.error || `HTTP Error: ${response.status}`,
        response.status,
        errorData.code
      )
    }

    const data = await response.json()
    return data as T
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Request timeout', 408, 'TIMEOUT')
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error',
      500,
      'UNKNOWN'
    )
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * GET request helper
 */
export const get = <T>(
  endpoint: string,
  config?: RequestConfig
): Promise<T> => {
  return apiClient<T>(endpoint, { ...config, method: 'GET' })
}

/**
 * POST request helper
 */
export const post = <T>(
  endpoint: string,
  body?: unknown,
  config?: RequestConfig
): Promise<T> => {
  return apiClient<T>(endpoint, {
    ...config,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  })
}
