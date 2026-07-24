import { ApiErrorResponse } from '../types/auth';

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: any;
  params?: Record<string, string | number | boolean | undefined | null>;
  skipAuth?: boolean;
  retries?: number;
}

class ApiClient {
  private baseUrl: string = '';
  private isRefreshing: boolean = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  private getAccessToken(): string | null {
    return localStorage.getItem('dairysphere_access_token');
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('dairysphere_refresh_token');
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('dairysphere_access_token', accessToken);
    localStorage.setItem('dairysphere_refresh_token', refreshToken);
  }

  public clearTokens(): void {
    localStorage.removeItem('dairysphere_access_token');
    localStorage.removeItem('dairysphere_refresh_token');
    localStorage.removeItem('dairysphere_user');
  }

  private onRefreshed(token: string) {
    this.refreshSubscribers.map((cb) => cb(token));
    this.refreshSubscribers = [];
  }

  private addRefreshSubscriber(cb: (token: string) => void) {
    this.refreshSubscribers.push(cb);
  }

  public async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const {
      body,
      params,
      skipAuth = false,
      retries = 1,
      headers: customHeaders,
      ...customInit
    } = options;

    let url = `${this.baseUrl}${endpoint}`;

    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, String(val));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(customHeaders as Record<string, string>),
    };

    if (!skipAuth) {
      const token = this.getAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const init: RequestInit = {
      ...customInit,
      headers,
    };

    if (body !== undefined) {
      init.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    let attempt = 0;
    while (attempt <= retries) {
      try {
        const response = await fetch(url, init);

        // Handle 401 Unauthorized - Attempt Token Refresh
        if (response.status === 401 && !skipAuth && endpoint !== '/api/auth/login' && endpoint !== '/api/auth/refresh') {
          const refreshToken = this.getRefreshToken();
          if (refreshToken) {
            if (!this.isRefreshing) {
              this.isRefreshing = true;
              try {
                const refreshRes = await fetch('/api/auth/refresh', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ refreshToken }),
                });

                if (refreshRes.ok) {
                  const data = await refreshRes.json();
                  this.setTokens(data.accessToken, data.refreshToken);
                  this.isRefreshing = false;
                  this.onRefreshed(data.accessToken);
                } else {
                  this.isRefreshing = false;
                  this.clearTokens();
                  window.dispatchEvent(new Event('dairysphere:unauthorized'));
                  throw new Error('Session expired. Please log in again.');
                }
              } catch (err) {
                this.isRefreshing = false;
                this.clearTokens();
                window.dispatchEvent(new Event('dairysphere:unauthorized'));
                throw err;
              }
            }

            // Wait for refresh to complete
            const newToken = await new Promise<string>((resolve) => {
              this.addRefreshSubscriber((token: string) => {
                resolve(token);
              });
            });

            headers['Authorization'] = `Bearer ${newToken}`;
            return this.request<T>(endpoint, { ...options, retries: 0 });
          } else {
            this.clearTokens();
            window.dispatchEvent(new Event('dairysphere:unauthorized'));
            throw new Error('Unauthorized access. Please login.');
          }
        }

        if (!response.ok) {
          let errorData: ApiErrorResponse | null = null;
          try {
            errorData = await response.json();
          } catch {
            // Non-JSON response
          }

          const errorMessage =
            errorData?.error?.message || `HTTP Error ${response.status}: ${response.statusText}`;
          const err = new Error(errorMessage) as Error & {
            status: number;
            code?: string;
            details?: any;
          };
          err.status = response.status;
          err.code = errorData?.error?.code;
          err.details = errorData?.error?.details;

          // If 5xx server error, maybe retry if retries left
          if (response.status >= 500 && attempt < retries) {
            attempt++;
            await new Promise((r) => setTimeout(r, 500 * attempt));
            continue;
          }

          throw err;
        }

        // Return parsed JSON or null if empty response
        if (response.status === 204) {
          return null as T;
        }

        return await response.json();
      } catch (error) {
        if (attempt < retries && (error as any)?.status >= 500) {
          attempt++;
          await new Promise((r) => setTimeout(r, 500 * attempt));
          continue;
        }
        throw error;
      }
    }

    throw new Error('Request failed after retries.');
  }

  public get<T = any>(endpoint: string, params?: Record<string, any>, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET', params });
  }

  public post<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  public put<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  public patch<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  public delete<T = any>(endpoint: string, params?: Record<string, any>, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE', params });
  }
}

export const apiClient = new ApiClient();
