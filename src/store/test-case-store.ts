import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TestCase {
  id: string;
  workItemId: string;
  workItemType: 'initiative' | 'feature' | 'epic' | 'story';
  title: string;
  summary: string;
  description: string;
  type: 'positive' | 'negative' | 'edge';
  testPyramidType: 'unit' | 'integration' | 'system' | 'acceptance' | 'performance' | 'security';
  status: 'not_run' | 'passed' | 'failed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  preconditions: string[];
  steps: string[];
  expectedResult: string;
  actualResult?: string;
  assignee?: string;
  createdBy: string;
  createdAt: Date;
  lastExecuted?: Date;
  estimatedTime?: number; // in minutes
  tags: string[];
}

interface TestCaseStore {
  testCases: TestCase[];
  selectedTestCase: TestCase | null;
  addTestCase: (testCase: Omit<TestCase, 'id' | 'createdAt'>) => TestCase;
  addGeneratedTestCases: (workItemId: string, testCases: Omit<TestCase, 'id' | 'createdAt' | 'workItemId'>[]) => TestCase[];
  updateTestCase: (id: string, updates: Partial<TestCase>) => void;
  deleteTestCase: (id: string) => void;
  selectTestCase: (id: string) => void;
  clearSelection: () => void;
  getTestCaseById: (id: string) => TestCase | undefined;
  getTestCasesByWorkItemId: (workItemId: string) => TestCase[];
  getTestCasesByType: (type: TestCase['type']) => TestCase[];
  getTestCasesByStatus: (status: TestCase['status']) => TestCase[];
  executeTestCase: (id: string, result: 'passed' | 'failed' | 'blocked', actualResult?: string) => void;
  updateTestCaseStatus: (id: string, status: TestCase['status']) => void;
  loadFromDatabase: () => Promise<void>;
  clearTestCases: () => void;
}

export const useTestCaseStore = create<TestCaseStore>()(
  persist(
    (set, get) => ({
  testCases: [],
  selectedTestCase: null,

  addTestCase: (testCase) => {
    const newTestCase: TestCase = {
      ...testCase,
      id: `TC-${String(get().testCases.length + 1).padStart(3, '0')}`,
      createdAt: new Date(),
    };
    set((state) => ({
      testCases: [...state.testCases, newTestCase],
    }));
    return newTestCase;
  },

  addGeneratedTestCases: (workItemId, testCases) => {
    const currentCount = get().testCases.length;
    const newTestCases: TestCase[] = testCases.map((testCase, index) => ({
      ...testCase,
      id: `TC-${String(currentCount + index + 1).padStart(3, '0')}`,
      workItemId,
      createdAt: new Date(),
    }));
    
    set((state) => ({
      testCases: [...state.testCases, ...newTestCases],
    }));
    return newTestCases;
  },

  updateTestCase: (id, updates) => {
    set((state) => ({
      testCases: state.testCases.map((testCase) =>
        testCase.id === id ? { ...testCase, ...updates } : testCase
      ),
    }));
  },

  deleteTestCase: (id) => {
    set((state) => ({
      testCases: state.testCases.filter((testCase) => testCase.id !== id),
      selectedTestCase: state.selectedTestCase?.id === id ? null : state.selectedTestCase,
    }));
  },

  selectTestCase: (id) => {
    const testCase = get().testCases.find((tc) => tc.id === id);
    set({ selectedTestCase: testCase || null });
  },

  clearSelection: () => {
    set({ selectedTestCase: null });
  },

  getTestCaseById: (id) => {
    return get().testCases.find((testCase) => testCase.id === id);
  },

  getTestCasesByWorkItemId: (workItemId) => {
    return get().testCases.filter((testCase) => testCase.workItemId === workItemId);
  },

  getTestCasesByType: (type) => {
    return get().testCases.filter((testCase) => testCase.type === type);
  },

  getTestCasesByStatus: (status) => {
    return get().testCases.filter((testCase) => testCase.status === status);
  },

  executeTestCase: (id, result, actualResult) => {
    set((state) => ({
      testCases: state.testCases.map((testCase) =>
        testCase.id === id
          ? {
              ...testCase,
              status: result,
              actualResult,
              lastExecuted: new Date(),
            }
          : testCase
      ),
    }));
  },

  updateTestCaseStatus: (id, status) => {
    set((state) => ({
      testCases: state.testCases.map((testCase) =>
        testCase.id === id
          ? {
              ...testCase,
              status,
              lastExecuted: new Date(),
            }
          : testCase
      ),
    }));
  },

  loadFromDatabase: async () => {
    try {
      console.log('🧪 Loading test cases from database...');
      
      const response = await fetch('/api/test-cases/list');
      const data = await response.json();
      
      if (data.success) {
        const testCases: TestCase[] = data.data.map((dbTestCase: any) => ({
          id: dbTestCase.id,
          workItemId: dbTestCase.workItemId,
          workItemType: dbTestCase.workItemType,
          title: dbTestCase.description.split('\n')[0] || 'Untitled Test', // Use first line as title
          summary: dbTestCase.description.split('\n')[0] || 'Test case summary',
          description: dbTestCase.description,
          type: 'positive' as const, // Default since database doesn't have this field
          testPyramidType: dbTestCase.testType as any || 'functional',
          status: dbTestCase.status,
          priority: 'medium' as const, // Default since database doesn't have this field
          preconditions: [], // Parse from steps if needed
          steps: dbTestCase.steps ? dbTestCase.steps.split('\n').filter(Boolean) : [],
          expectedResult: dbTestCase.expectedResult || '',
          createdBy: 'System',
          createdAt: new Date(dbTestCase.createdAt),
          lastExecuted: dbTestCase.updatedAt ? new Date(dbTestCase.updatedAt) : undefined,
          tags: []
        }));

        set({ testCases });
        console.log(`✅ Loaded ${testCases.length} test cases from database`);
      } else {
        console.error('❌ Failed to load test cases:', data.error);
      }
    } catch (error) {
      console.error('❌ Error loading test cases from database:', error);
    }
  },

  clearTestCases: () => {
    console.log('🗑️ Clearing all test cases from store');
    set({ testCases: [], selectedTestCase: null });
  },
}),
{
  name: 'test-case-storage',
  // Persist all test case data
}
)
); 