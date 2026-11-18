export type EntityType = 'hardware' | 'software' | 'model' | 'ai';
export type QuestionStatus = 'planned' | 'drafted' | 'reviewed' | 'published';
export type Lane = 'hardware' | 'software' | 'ai' | 'idea';

export interface SourceRef {
  id?: string;
  title: string;
  publisher?: string;
  url?: string;
  tier?: string;
  accessed?: string;
}

export interface BookRef {
  chapter: number;
  section: string;
  pages: string;
}

export interface Spec {
  label: string;
  value: string;
  note?: string;
}

export interface ModelVariable {
  symbol: string;
  name: string;
  unit?: string;
}

export interface EntitySummary {
  slug: string;
  name: string;
  nameEn: string;
  type: EntityType;
  category: string;
  icon: string;
  accent: string;
  summary: string;
  sceneKey?: string | null;
}

export interface Relation {
  direction: 'in' | 'out';
  kind: string;
  label: string;
  entity: EntitySummary;
}

export interface Entity extends EntitySummary {
  id: number;
  layer: string;
  eraSlug: string | null;
  year: number | null;
  maker: string | null;
  formFactor: string | null;
  sceneKey: string | null;
  sceneConfig: Record<string, unknown> | null;
  description: string[];
  specs: Spec[];
  highlights: string[];
  tags: string[];
  significance: string[];
  book: BookRef | null;
  sources: SourceRef[];
  formula: string | null;
  variables: ModelVariable[];
  calculator: string | null;
  relations?: Relation[];
}

export interface TimelineEvent {
  id: number;
  slug: string;
  year: number;
  dateLabel: string | null;
  lane: TimelineLane;
  title: string;
  summary: string;
  eraSlug: string | null;
  importance: number;
  entitySlugs: string[];
  sources: SourceRef[];
}

export interface Era {
  id: number;
  slug: string;
  name: string;
  startYear: number;
  endYear: number;
  sortOrder: number;
  tagline: string;
  keyIdea: string;
  heroMachine: Entity | null;
  narrative: string[];
  transition: { title: string; body: string } | null;
  accent: string;
  machines: Entity[];
  events: TimelineEvent[];
  prev?: { slug: string; name: string } | null;
  next?: { slug: string; name: string } | null;
}

export type TimelineLane = 'hardware' | 'software' | 'algorithm';

export interface TimelineNode {
  id: number;
  slug: string;
  periodSlug: string;
  lane: TimelineLane;
  year: number;
  title: string;
  summary: string;
  body: string;
  generation: number;
  frontier: boolean;
  entitySlug: string | null;
  sceneKey: string | null;
  modelSlugs: string[];
  aiModuleSlugs: string[];
  sources: SourceRef[];
  questionSlugs: string[];
  lensSlugs: string[];
  entity: EntitySummary | null;
  period?: {
    slug: string;
    name: string;
    startYear: number;
    endYear: number;
  };
}

export interface Period extends Era {
  nodes: TimelineNode[];
  lanes: Record<TimelineLane, TimelineNode[]>;
  frontier: TimelineNode[];
}

export interface LensSummary {
  id: number;
  number: number;
  slug: string;
  title: string;
  titleEn: string;
  group: 'classic' | 'frontier';
  coreQuestion: string;
  summary: string;
  accent: string;
  sortOrder: number;
  nodeCount: number;
}

export interface LensDetail extends LensSummary {
  nodes: TimelineNode[];
}

export interface TimelineResponse {
  periods: Period[];
}

export interface AnswerSection {
  heading: string;
  body: string[];
}

export interface TimelineAnchor {
  eraSlug?: string;
  machineSlug?: string;
  eventSlug?: string;
  label: string;
  era?: { slug: string; name: string } | null;
  machine?: { slug: string; name: string } | null;
  event?: { slug: string; title: string; year: number } | null;
}

export interface KeyConcept {
  name: string;
  slug?: string;
}

export interface QuizItem {
  question: string;
  options: string[];
  answer: number;
  explain?: string;
}

export interface QuestionSummary {
  id: number;
  slug: string;
  number: number;
  title: string;
  shortTitle: string;
  question: string;
  oneLineAnswer: string;
  summary: string;
  status: QuestionStatus;
  sceneKeys: string[];
  calculator: string | null;
}

export interface Question extends Omit<QuestionSummary, 'id'> {
  id: number;
  sortOrder: number;
  answerSections: AnswerSection[];
  keyConcepts: KeyConcept[];
  timelineAnchors: TimelineAnchor[];
  entitySlugs: string[];
  modelSlugs: string[];
  aiModuleSlugs: string[];
  interaction: { type?: string } | null;
  book: BookRef | null;
  misconceptions: string[];
  quiz: QuizItem[];
  sources: SourceRef[];
  entities: EntitySummary[];
  models: EntitySummary[];
  aiModules: AiModuleSummary[];
  timelineNodes: TimelineNode[];
}

export interface AiModuleSummary {
  slug: string;
  title: string;
  level: string;
  durationMin: number | null;
  summary: string;
  sortOrder?: number;
  entitySlugs?: string[];
  calculator?: string | null;
}

export interface AiModuleSection {
  heading: string;
  type: string;
  body: string[];
}

export interface AiModule extends AiModuleSummary {
  id: number;
  sortOrder: number;
  objectives: string[];
  sections: AiModuleSection[];
  entitySlugs: string[];
  calculator: string | null;
  quiz: QuizItem[];
  sources: SourceRef[];
  entities: EntitySummary[];
}

export interface Annotation {
  id: number;
  targetType: 'entity' | 'question' | 'ai_module' | 'era';
  targetSlug: string;
  targetLabel: string;
  kind: 'favorite' | 'note';
  content: string;
  createdAt: string;
}

export interface Stats {
  entities: number;
  hardware: number;
  software: number;
  model: number;
  ai: number;
  relations: number;
  eras: number;
  timelineNodes: number;
  lenses: number;
  events: number;
  questions: number;
  aiModules: number;
  instructions: number;
  chapters: number;
}
