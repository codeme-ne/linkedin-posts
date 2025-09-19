import { toast } from 'sonner';

// Custom error types
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends ApiError {
  constructor(message = 'Netzwerkfehler - Bitte überprüfe deine Internetverbindung') {
    super(message, 0);
    this.name = 'NetworkError';
  }
}

export class AuthError extends ApiError {
  constructor(message = 'Authentifizierung fehlgeschlagen - Bitte melde dich erneut an') {
    super(message, 401);
    this.name = 'AuthError';
  }
}

export class RateLimitError extends ApiError {
  constructor(message = 'Zu viele Anfragen - Bitte warte einen Moment') {
    super(message, 429);
    this.name = 'RateLimitError';
  }
}

export class ValidationError extends ApiError {
  constructor(message = 'Ungültige Eingabedaten') {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

// Error handler utility
export const handleApiError = (error: unknown): ApiError => {
  // Already an ApiError
  if (error instanceof ApiError) {
    return error;
  }

  // Fetch response error
  if (error instanceof Response) {
    switch (error.status) {
      case 401:
        return new AuthError();
      case 403:
        return new ApiError('Keine Berechtigung für diese Aktion', 403);
      case 404:
        return new ApiError('Ressource nicht gefunden', 404);
      case 429:
        return new RateLimitError();
      case 500:
      case 502:
      case 503:
        return new ApiError('Serverfehler - Bitte versuche es später erneut', error.status);
      default:
        return new ApiError(`Unerwarteter Fehler (${error.status})`, error.status);
    }
  }

  // Network error
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new NetworkError();
  }

  // Generic JavaScript error
  if (error instanceof Error) {
    return new ApiError(error.message);
  }

  // Unknown error
  return new ApiError('Ein unerwarteter Fehler ist aufgetreten');
};

// Toast error helper
export const showErrorToast = (error: unknown, context?: string) => {
  const apiError = handleApiError(error);
  const message = context ? `${context}: ${apiError.message}` : apiError.message;

  // Show different toast types based on error severity
  if (apiError instanceof NetworkError) {
    toast.error(message, {
      duration: 5000,
      action: {
        label: 'Erneut versuchen',
        onClick: () => window.location.reload(),
      },
    });
  } else if (apiError instanceof AuthError) {
    toast.error(message, {
      duration: 5000,
      action: {
        label: 'Anmelden',
        onClick: () => {
          window.location.href = '/signup';
        },
      },
    });
  } else if (apiError instanceof RateLimitError) {
    toast.warning(message, {
      duration: 10000,
    });
  } else {
    toast.error(message, {
      duration: 5000,
    });
  }

  // Log error in development
  if (import.meta.env.DEV) {
    console.error('Error details:', {
      error: apiError,
      context,
      originalError: error,
    });
  }
};

// Retry logic for transient failures
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> => {
  let lastError: unknown;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on client errors (4xx except 429)
      const apiError = handleApiError(error);
      if (apiError.statusCode && apiError.statusCode >= 400 && apiError.statusCode < 500 && apiError.statusCode !== 429) {
        throw error;
      }

      // Wait before retry with exponential backoff
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};