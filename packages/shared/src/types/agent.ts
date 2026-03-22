import { z } from 'zod';

export const TaskStatus = z.enum([
  'pending',
  'running',
  'paused_for_input',
  'completed',
  'failed',
]);
export type TaskStatus = z.infer<typeof TaskStatus>;

export const StepStatus = z.enum([
  'pending',
  'running',
  'paused_for_input',
  'completed',
  'failed',
  'skipped',
]);
export type StepStatus = z.infer<typeof StepStatus>;

export const WorkflowType = z.enum([
  'hotel_booking',
  'grocery_order',
  'food_delivery',
  'bill_payment',
  'generic',
]);
export type WorkflowType = z.infer<typeof WorkflowType>;

export interface AgentTask {
  id: string;
  userId: string;
  description: string;
  workflowType: WorkflowType;
  status: TaskStatus;
  steps: AgentStep[];
  result?: Record<string, unknown>;
  createdAt: Date;
  completedAt?: Date;
}

export interface AgentStep {
  id: string;
  taskId: string;
  stepNumber: number;
  action: string;
  status: StepStatus;
  requiresConfirmation: boolean;
  inputNeeded?: string;
  userInput?: string;
  result?: Record<string, unknown>;
  error?: string;
}

export interface AgentMessage {
  id: string;
  taskId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

// --- Rich Input Pattern Types ---

export interface CardItem {
  id: string;
  label: string;
  emoji?: string;
  image?: string;
  subtitle?: string;
  badge?: string;
  url?: string;
}

/** Rich product data for the product_card widget */
export interface ProductCardData {
  id: string;
  name: string;
  image?: string;
  url?: string;
  price: number;
  mrp?: number;
  discount?: string;
  rating?: number;
  ratingCount?: string;
  delivery?: string;
  deliveryFree?: boolean;
  specs?: string[];
  offers?: string[];
  color?: string;
  store: string;
}

export interface CounterConfig {
  label: string;
  min?: number;
  max?: number;
  default?: number;
}

export interface InputSavedAddress {
  label: string;
  address: string;
}

export type RichInputType =
  | 'otp'
  | 'confirmation'
  | 'choice'
  | 'freetext'
  | 'payment'
  | 'card_grid'
  | 'carousel'
  | 'chip_bar'
  | 'address'
  | 'calendar'
  | 'stepper'
  | 'slider'
  | 'text'
  | 'layout'
  | 'product_card';

export interface InputSection {
  name: string;
  label: string;
  type: RichInputType;
  required?: boolean;
  collapsed?: boolean;
  // card_grid / carousel props
  cards?: CardItem[];
  show_quantity?: boolean;
  allow_custom?: boolean;
  multi_select?: boolean;
  // address props
  saved?: InputSavedAddress[];
  // calendar props
  mode?: 'single' | 'range';
  shortcuts?: string[];
  // stepper props
  counters?: CounterConfig[];
  // slider props
  min?: number;
  max?: number;
  step?: number;
  presets?: number[];
  // chip_bar / choice props
  options?: string[];
  // text props
  placeholder?: string;
  format_hint?: string;
}

export interface UserInputRequest {
  taskId: string;
  stepId: string;
  question: string;
  inputType: RichInputType;
  options?: string[];
  timeout?: number;
  // Rich input props (passed through for new widget types)
  cards?: CardItem[];
  show_quantity?: boolean;
  allow_custom?: boolean;
  multi_select?: boolean;
  saved?: InputSavedAddress[];
  mode?: 'single' | 'range';
  shortcuts?: string[];
  counters?: CounterConfig[];
  min?: number;
  max?: number;
  step?: number;
  presets?: number[];
  placeholder?: string;
  format_hint?: string;
  // Layout composite
  sections?: InputSection[];
  // Product card widget
  product?: ProductCardData;
}

export interface UserInputResponse {
  taskId: string;
  stepId: string;
  value: string;
}
