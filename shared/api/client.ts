export interface AuthProvider {
  getAccessToken(): Promise<string | null>;
}

export interface ApiClient {
  post<TResponse>(
    path: string,
    body?: unknown,
  ): Promise<TResponse>;
}

const SUPABASE_FUNCTIONS_URL =
  'https://pnzskonxnmbinsfxmcqp.supabase.co/functions/v1';

export function createApiClient(authProvider: AuthProvider): ApiClient {
  return {
    async post<TResponse>(
      path: string,
      body?: unknown,
    ): Promise<TResponse> {
      const accessToken = await authProvider.getAccessToken();

      if (!accessToken) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });

      const responseText = await response.text();

      let responseBody: unknown;

      if (responseText) {
        try {
          responseBody = JSON.parse(responseText);
        } catch {
          responseBody = responseText;
        }
      }

      if (!response.ok) {
        const message =
          typeof responseBody === 'object' &&
          responseBody !== null &&
          'message' in responseBody &&
          typeof responseBody.message === 'string'
            ? responseBody.message
            : `API request failed with status ${response.status}`;

        throw new Error(message);
      }

      return responseBody as TResponse;
    },
  };
}