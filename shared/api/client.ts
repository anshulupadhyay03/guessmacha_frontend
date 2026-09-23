export interface AuthProvider {
  getAccessToken(): Promise<string | null>;
}

export interface ApiClientOptions {
  baseUrl?: string;
  apiKey?: string;
}

export type QueryValue =
  | string
  | number
  | boolean
  | null
  | undefined;

export type QueryParams = Record<
  string,
  QueryValue | QueryValue[]
>;

export interface RequestOptions {
  params?: QueryParams;
  headers?: Record<string, string>;
  body?: unknown;
  requiresAuth?: boolean;
}

export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS';

export interface RequestConfig extends RequestOptions {
  method: HttpMethod | string;
  path: string;
}

export interface ApiClient {
  request<TResponse>(config: RequestConfig): Promise<TResponse>;
  get<TResponse>(
    path: string,
    paramsOrOptions?: QueryParams | RequestOptions,
  ): Promise<TResponse>;
  post<TResponse>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<TResponse>;
  put<TResponse>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<TResponse>;
  patch<TResponse>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<TResponse>;
  delete<TResponse>(
    path: string,
    bodyOrOptions?: unknown,
    options?: RequestOptions,
  ): Promise<TResponse>;
}

function isRequestOptions(value: unknown): value is RequestOptions {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  return 'params' in value || 'headers' in value || 'requiresAuth' in value || 'body' in value;
}

function buildUrl(baseUrl: string, path: string, params?: QueryParams): string {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const cleanPath = path.replace(/^\/+/, '');
  let fullUrl = cleanPath ? `${cleanBase}/${cleanPath}` : cleanBase;

  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) {
        continue;
      }
      if (Array.isArray(value)) {
        for (const item of value) {
          if (item !== undefined && item !== null) {
            searchParams.append(key, String(item));
          }
        }
      } else {
        searchParams.append(key, String(value));
      }
    }
    const queryString = searchParams.toString();
    if (queryString) {
      fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryString;
    }
  }

  return fullUrl;
}

export function createApiClient(
  authProviderOrOptions?: AuthProvider | ApiClientOptions | string,
  maybeOptions?: string | ApiClientOptions,
): ApiClient {
  let authProvider: AuthProvider | undefined;
  let rawOptions: ApiClientOptions | string | undefined;

  if (
    authProviderOrOptions &&
    typeof authProviderOrOptions === 'object' &&
    'getAccessToken' in authProviderOrOptions
  ) {
    authProvider = authProviderOrOptions;
    rawOptions = maybeOptions;
  } else {
    rawOptions = authProviderOrOptions as ApiClientOptions | string | undefined;
  }

  const resolvedOptions =
    typeof rawOptions === 'string' ? { baseUrl: rawOptions } : rawOptions;
  const baseUrl = resolvedOptions?.baseUrl?.replace(/\/+$/, '');
  const apiKey = resolvedOptions?.apiKey;

  const client: ApiClient = {
    async request<TResponse>(config: RequestConfig): Promise<TResponse> {
      if (!baseUrl) {
        throw new Error('Supabase functions base URL is required');
      }

      const {
        method,
        path,
        body,
        params,
        headers: customHeaders,
        requiresAuth,
      } = config;

      let accessToken: string | null = null;
      if (authProvider) {
        accessToken = await authProvider.getAccessToken();
      }

      const shouldRequireAuth = requiresAuth ?? Boolean(authProvider);

      if (shouldRequireAuth && !accessToken) {
        throw new Error('Authentication required');
      }

      const headers: Record<string, string> = {
        ...customHeaders,
      };

      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      } else if (apiKey) {
        headers.Authorization = `Bearer ${apiKey}`;
      }

      if (apiKey && !headers.apikey) {
        headers.apikey = apiKey;
      }

      let requestBody: BodyInit | undefined = undefined;

      if (
        body !== undefined &&
        body !== null &&
        method !== 'GET' &&
        method !== 'HEAD'
      ) {
        if (
          typeof body === 'string' ||
          (typeof Blob !== 'undefined' && body instanceof Blob) ||
          (typeof ArrayBuffer !== 'undefined' && body instanceof ArrayBuffer) ||
          (typeof FormData !== 'undefined' && body instanceof FormData) ||
          (typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams)
        ) {
          requestBody = body as BodyInit;
          if (typeof body === 'string' && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
          }
        } else {
          requestBody = JSON.stringify(body);
          if (!headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
          }
        }
      }

      const url = buildUrl(baseUrl, path, params);

      const response = await fetch(url, {
        method,
        headers,
        body: requestBody,
      });

      const responseText = await response.text();

      let responseBody: unknown = undefined;

      if (responseText) {
        try {
          responseBody = JSON.parse(responseText);
        } catch {
          responseBody = responseText;
        }
      }

      if (!response.ok) {
        let message = `API request failed with status ${response.status}`;

        if (typeof responseBody === 'object' && responseBody !== null) {
          if ('message' in responseBody && typeof responseBody.message === 'string') {
            message = responseBody.message;
          } else if ('error' in responseBody) {
            if (typeof responseBody.error === 'string') {
              message = responseBody.error;
            } else if (
              typeof responseBody.error === 'object' &&
              responseBody.error !== null &&
              'message' in responseBody.error &&
              typeof (responseBody.error as { message: unknown }).message === 'string'
            ) {
              message = (responseBody.error as { message: string }).message;
            }
          } else if ('msg' in responseBody && typeof responseBody.msg === 'string') {
            message = responseBody.msg;
          }
        } else if (typeof responseBody === 'string' && responseBody.trim()) {
          message = responseBody;
        }

        const error = new Error(message);
        (error as Error & { status?: number; response?: unknown }).status = response.status;
        (error as Error & { status?: number; response?: unknown }).response = responseBody;
        throw error;
      }

      return responseBody as TResponse;
    },

    async get<TResponse>(
      path: string,
      paramsOrOptions?: QueryParams | RequestOptions,
    ): Promise<TResponse> {
      if (paramsOrOptions && isRequestOptions(paramsOrOptions)) {
        return client.request<TResponse>({
          method: 'GET',
          path,
          ...paramsOrOptions,
        });
      }

      return client.request<TResponse>({
        method: 'GET',
        path,
        params: paramsOrOptions as QueryParams | undefined,
      });
    },

    async post<TResponse>(
      path: string,
      body?: unknown,
      options?: RequestOptions,
    ): Promise<TResponse> {
      return client.request<TResponse>({
        method: 'POST',
        path,
        body,
        ...options,
      });
    },

    async put<TResponse>(
      path: string,
      body?: unknown,
      options?: RequestOptions,
    ): Promise<TResponse> {
      return client.request<TResponse>({
        method: 'PUT',
        path,
        body,
        ...options,
      });
    },

    async patch<TResponse>(
      path: string,
      body?: unknown,
      options?: RequestOptions,
    ): Promise<TResponse> {
      return client.request<TResponse>({
        method: 'PATCH',
        path,
        body,
        ...options,
      });
    },

    async delete<TResponse>(
      path: string,
      bodyOrOptions?: unknown,
      options?: RequestOptions,
    ): Promise<TResponse> {
      if (options !== undefined) {
        return client.request<TResponse>({
          method: 'DELETE',
          path,
          body: bodyOrOptions,
          ...options,
        });
      }

      if (isRequestOptions(bodyOrOptions)) {
        return client.request<TResponse>({
          method: 'DELETE',
          path,
          ...bodyOrOptions,
        });
      }

      return client.request<TResponse>({
        method: 'DELETE',
        path,
        body: bodyOrOptions,
      });
    },
  };

  return client;
}