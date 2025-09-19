import { useReducer, useCallback, useEffect } from 'react';
import type { Platform } from '@/config/platforms';
import type { WorkflowStep } from '@/components/common/WorkflowStepper';

// Types
export interface GeneratedPost {
  content: string;
  platform: Platform;
  isEdited: boolean;
  regenerationCount: number;
  createdAt: Date;
  characterCount: number;
}

export interface PostGeneratorState {
  // Workflow
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];

  // Input
  sourceUrl: string;
  inputText: string;
  usePremiumExtraction: boolean;

  // Platform Selection
  selectedPlatforms: Platform[];

  // Generated Content
  generatedPosts: Partial<Record<Platform, GeneratedPost>>;

  // Loading States
  isExtracting: boolean;
  isGenerating: Set<Platform>;
  extractionProgress: number;
  generationProgress: {
    current: Platform | null;
    completed: number;
    total: number;
  };

  // Error States
  errors: {
    extraction?: string;
    generation?: Partial<Record<Platform, string>>;
  };

  // Meta
  lastSavedAt?: Date;
  isDirty: boolean;
}

// Action Types
type PostGeneratorAction =
  | { type: 'SET_STEP'; step: WorkflowStep }
  | { type: 'COMPLETE_STEP'; step: WorkflowStep }
  | { type: 'SET_SOURCE_URL'; url: string }
  | { type: 'SET_INPUT_TEXT'; text: string }
  | { type: 'SET_PREMIUM_EXTRACTION'; enabled: boolean }
  | { type: 'TOGGLE_PLATFORM'; platform: Platform }
  | { type: 'SET_PLATFORMS'; platforms: Platform[] }
  | { type: 'START_EXTRACTION' }
  | { type: 'COMPLETE_EXTRACTION'; content: string }
  | { type: 'FAIL_EXTRACTION'; error: string }
  | { type: 'START_GENERATION'; platform: Platform }
  | { type: 'COMPLETE_GENERATION'; platform: Platform; post: GeneratedPost }
  | { type: 'FAIL_GENERATION'; platform: Platform; error: string }
  | { type: 'UPDATE_POST'; platform: Platform; content: string }
  | { type: 'SET_GENERATION_PROGRESS'; current: Platform | null; completed: number; total: number }
  | { type: 'SET_EXTRACTION_PROGRESS'; progress: number }
  | { type: 'MARK_SAVED' }
  | { type: 'RESET_WORKFLOW' }
  | { type: 'CLEAR_ERRORS' };

// Initial State
const initialState: PostGeneratorState = {
  currentStep: 'input',
  completedSteps: [],
  sourceUrl: '',
  inputText: '',
  usePremiumExtraction: false,
  selectedPlatforms: ['linkedin'],
  generatedPosts: {},
  isExtracting: false,
  isGenerating: new Set(),
  extractionProgress: 0,
  generationProgress: {
    current: null,
    completed: 0,
    total: 0,
  },
  errors: {},
  isDirty: false,
};

// Reducer
function postGeneratorReducer(
  state: PostGeneratorState,
  action: PostGeneratorAction
): PostGeneratorState {
  switch (action.type) {
    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.step,
      };

    case 'COMPLETE_STEP':
      return {
        ...state,
        completedSteps: [...new Set([...state.completedSteps, action.step])] as WorkflowStep[],
      };

    case 'SET_SOURCE_URL':
      return {
        ...state,
        sourceUrl: action.url,
        isDirty: true,
      };

    case 'SET_INPUT_TEXT':
      return {
        ...state,
        inputText: action.text,
        isDirty: true,
      };

    case 'SET_PREMIUM_EXTRACTION':
      return {
        ...state,
        usePremiumExtraction: action.enabled,
      };

    case 'TOGGLE_PLATFORM':
      const platforms = state.selectedPlatforms.includes(action.platform)
        ? state.selectedPlatforms.filter(p => p !== action.platform)
        : [...state.selectedPlatforms, action.platform];
      return {
        ...state,
        selectedPlatforms: platforms,
        isDirty: true,
      };

    case 'SET_PLATFORMS':
      return {
        ...state,
        selectedPlatforms: action.platforms,
        isDirty: true,
      };

    case 'START_EXTRACTION':
      return {
        ...state,
        isExtracting: true,
        extractionProgress: 0,
        errors: { ...state.errors, extraction: undefined },
      };

    case 'COMPLETE_EXTRACTION':
      return {
        ...state,
        inputText: action.content,
        isExtracting: false,
        extractionProgress: 100,
        completedSteps: [...new Set([...state.completedSteps, 'input'])] as WorkflowStep[],
        currentStep: 'generate',
        errors: { ...state.errors, extraction: undefined },
      };

    case 'FAIL_EXTRACTION':
      return {
        ...state,
        isExtracting: false,
        extractionProgress: 0,
        errors: { ...state.errors, extraction: action.error },
      };

    case 'START_GENERATION':
      const newGenerating = new Set(state.isGenerating);
      newGenerating.add(action.platform);
      return {
        ...state,
        isGenerating: newGenerating,
        errors: {
          ...state.errors,
          generation: {
            ...state.errors.generation,
            [action.platform]: undefined,
          },
        },
      };

    case 'COMPLETE_GENERATION':
      const updatedGenerating = new Set(state.isGenerating);
      updatedGenerating.delete(action.platform);

      // Check if all selected platforms have been generated
      const allGenerated = state.selectedPlatforms.every(
        p => state.generatedPosts[p] || p === action.platform
      );

      return {
        ...state,
        generatedPosts: {
          ...state.generatedPosts,
          [action.platform]: action.post,
        },
        isGenerating: updatedGenerating,
        completedSteps: allGenerated
          ? [...new Set([...state.completedSteps, 'generate'])] as WorkflowStep[]
          : state.completedSteps,
        currentStep: allGenerated ? 'share' : state.currentStep,
        errors: {
          ...state.errors,
          generation: {
            ...state.errors.generation,
            [action.platform]: undefined,
          },
        },
      };

    case 'FAIL_GENERATION':
      const failGenerating = new Set(state.isGenerating);
      failGenerating.delete(action.platform);
      return {
        ...state,
        isGenerating: failGenerating,
        errors: {
          ...state.errors,
          generation: {
            ...state.errors.generation,
            [action.platform]: action.error,
          },
        },
      };

    case 'UPDATE_POST':
      const post = state.generatedPosts[action.platform];
      if (!post) return state;

      return {
        ...state,
        generatedPosts: {
          ...state.generatedPosts,
          [action.platform]: {
            ...post,
            content: action.content,
            isEdited: true,
            characterCount: action.content.length,
          },
        },
        isDirty: true,
      };

    case 'SET_GENERATION_PROGRESS':
      return {
        ...state,
        generationProgress: {
          current: action.current,
          completed: action.completed,
          total: action.total,
        },
      };

    case 'SET_EXTRACTION_PROGRESS':
      return {
        ...state,
        extractionProgress: action.progress,
      };

    case 'MARK_SAVED':
      return {
        ...state,
        lastSavedAt: new Date(),
        isDirty: false,
      };

    case 'RESET_WORKFLOW':
      return initialState;

    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: {},
      };

    default:
      return state;
  }
}

// Hook
export function usePostGeneratorState() {
  const [state, dispatch] = useReducer(postGeneratorReducer, initialState);

  // Auto-save to localStorage
  useEffect(() => {
    if (state.isDirty && state.inputText) {
      const savedState = {
        inputText: state.inputText,
        sourceUrl: state.sourceUrl,
        selectedPlatforms: state.selectedPlatforms,
      };
      localStorage.setItem('postGeneratorDraft', JSON.stringify(savedState));
    }
  }, [state.isDirty, state.inputText, state.sourceUrl, state.selectedPlatforms]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('postGeneratorDraft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.inputText) {
          dispatch({ type: 'SET_INPUT_TEXT', text: parsed.inputText });
        }
        if (parsed.sourceUrl) {
          dispatch({ type: 'SET_SOURCE_URL', url: parsed.sourceUrl });
        }
        if (parsed.selectedPlatforms?.length) {
          dispatch({ type: 'SET_PLATFORMS', platforms: parsed.selectedPlatforms });
        }
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    }
  }, []);

  // Action creators
  const actions = {
    setStep: useCallback((step: WorkflowStep) => {
      dispatch({ type: 'SET_STEP', step });
    }, []),

    completeStep: useCallback((step: WorkflowStep) => {
      dispatch({ type: 'COMPLETE_STEP', step });
    }, []),

    setSourceUrl: useCallback((url: string) => {
      dispatch({ type: 'SET_SOURCE_URL', url });
    }, []),

    setInputText: useCallback((text: string) => {
      dispatch({ type: 'SET_INPUT_TEXT', text });
    }, []),

    setPremiumExtraction: useCallback((enabled: boolean) => {
      dispatch({ type: 'SET_PREMIUM_EXTRACTION', enabled });
    }, []),

    togglePlatform: useCallback((platform: Platform) => {
      dispatch({ type: 'TOGGLE_PLATFORM', platform });
    }, []),

    startExtraction: useCallback(() => {
      dispatch({ type: 'START_EXTRACTION' });
    }, []),

    completeExtraction: useCallback((content: string) => {
      dispatch({ type: 'COMPLETE_EXTRACTION', content });
    }, []),

    failExtraction: useCallback((error: string) => {
      dispatch({ type: 'FAIL_EXTRACTION', error });
    }, []),

    startGeneration: useCallback((platform: Platform) => {
      dispatch({ type: 'START_GENERATION', platform });
    }, []),

    completeGeneration: useCallback((platform: Platform, post: GeneratedPost) => {
      dispatch({ type: 'COMPLETE_GENERATION', platform, post });
    }, []),

    failGeneration: useCallback((platform: Platform, error: string) => {
      dispatch({ type: 'FAIL_GENERATION', platform, error });
    }, []),

    updatePost: useCallback((platform: Platform, content: string) => {
      dispatch({ type: 'UPDATE_POST', platform, content });
    }, []),

    setGenerationProgress: useCallback(
      (current: Platform | null, completed: number, total: number) => {
        dispatch({ type: 'SET_GENERATION_PROGRESS', current, completed, total });
      },
      []
    ),

    setExtractionProgress: useCallback((progress: number) => {
      dispatch({ type: 'SET_EXTRACTION_PROGRESS', progress });
    }, []),

    markSaved: useCallback(() => {
      dispatch({ type: 'MARK_SAVED' });
    }, []),

    resetWorkflow: useCallback(() => {
      localStorage.removeItem('postGeneratorDraft');
      dispatch({ type: 'RESET_WORKFLOW' });
    }, []),

    clearErrors: useCallback(() => {
      dispatch({ type: 'CLEAR_ERRORS' });
    }, []),
  };

  // Computed values
  const computed = {
    canExtract: state.sourceUrl.trim().length > 0,
    canGenerate: state.inputText.trim().length > 0 && state.selectedPlatforms.length > 0,
    hasGeneratedPosts: Object.keys(state.generatedPosts).length > 0,
    isGeneratingAny: state.isGenerating.size > 0,
    allPlatformsGenerated: state.selectedPlatforms.every(p => state.generatedPosts[p]),
  };

  return {
    state,
    actions,
    computed,
  };
}