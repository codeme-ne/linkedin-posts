import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock environment variables for testing
vi.mock('@/config/app.config', () => ({
  default: {
    appName: 'Social Transformer Test',
    appDescription: 'Test environment',
    domainName: 'localhost',
    companyName: 'Test Company',
    urls: {
      app: '/app',
      landing: '/',
      signup: '/signup',
      settings: '/settings',
      generator: '/app'
    },
    stripe: {
      plans: [],
      defaultPlan: 'monthly',
      features: {
        free: ['Standard URL-Extraktion'],
        premium: ['Premium URL-Extraktion']
      }
    },
    features: {
      linkedinPosting: { name: 'LinkedIn', description: 'Test', enabled: false },
      premiumExtraction: { name: 'Premium', description: 'Test', enabled: true },
      postSaving: { name: 'Saving', description: 'Test', enabled: true },
      multiPlatform: { name: 'Multi', description: 'Test', enabled: true },
      directPosting: { name: 'Direct', description: 'Test', enabled: false }
    },
    limits: {
      freeExtractions: 3,
      premiumExtractions: 20,
      maxPostLength: {
        linkedin: 3000,
        x: 280,
        instagram: 2200
      }
    },
    env: {
      isDevelopment: true,
      isProduction: false,
      baseUrl: 'http://localhost:5173'
    }
  }
}));

// Mock Supabase client
vi.mock('@/api/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } })
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null })
    }))
  }
}));

// Mock toast notifications
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  }
}));

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
vi.stubGlobal('localStorage', localStorageMock);

// Mock fetch for API calls
global.fetch = vi.fn();

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
});
vi.stubGlobal('IntersectionObserver', mockIntersectionObserver);

// Mock ResizeObserver
const mockResizeObserver = vi.fn();
mockResizeObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
});
vi.stubGlobal('ResizeObserver', mockResizeObserver);