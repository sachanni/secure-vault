import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Function to get auth headers
function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Overloaded function signatures
export async function apiRequest(url: string, options?: RequestInit): Promise<any>;
export async function apiRequest(method: string, url: string, data?: any): Promise<Response>;

export async function apiRequest(
  urlOrMethod: string,
  urlOrOptions?: string | RequestInit,
  data?: any,
): Promise<any> {
  let method: string;
  let url: string;
  let options: RequestInit = {};

  // Handle both signatures
  if (typeof urlOrOptions === 'string') {
    // New signature: apiRequest(method, url, data)
    method = urlOrMethod;
    url = urlOrOptions;
    options = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    };
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }
  } else {
    // Old signature: apiRequest(url, options)
    url = urlOrMethod;
    options = {
      ...urlOrOptions,
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
        ...urlOrOptions?.headers,
      },
    };
    method = options.method || 'GET';
  }

  const res = await fetch(url, options);

  // Handle 401 errors for token refresh
  if (res.status === 401) {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        // Try to refresh the token
        const refreshRes = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          if (refreshData.success) {
            // Update stored tokens
            localStorage.setItem('accessToken', refreshData.accessToken);
            localStorage.setItem('refreshToken', refreshData.refreshToken);
            localStorage.setItem('tokenExpiry', (Date.now() + refreshData.expiresIn * 1000).toString());

            // Retry original request with new token
            const newHeaders = {
              "Content-Type": "application/json",
              Authorization: `Bearer ${refreshData.accessToken}`,
              ...options?.headers,
            };

            const retryOptions: RequestInit = {
              method,
              headers: newHeaders,
            };

            if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
              retryOptions.body = JSON.stringify(data);
            }

            const retryRes = await fetch(url, retryOptions);
            return retryRes;
          }
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    }

    // If refresh failed, clear tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiry');
  }

  // For new signature, return Response object
  if (typeof urlOrOptions === 'string') {
    return res;
  }
  
  // For old signature, handle response and return JSON
  await throwIfResNotOk(res);
  return await res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      const response = await apiRequest("GET", queryKey.join("/") as string);
      if (!response.ok) {
        if (unauthorizedBehavior === "returnNull" && response.status === 401) {
          return null;
        }
        const text = await response.text();
        throw new Error(`${response.status}: ${text}`);
      }
      return await response.json();
    } catch (error: any) {
      if (unauthorizedBehavior === "returnNull" && error.message.includes("401")) {
        return null;
      }
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
