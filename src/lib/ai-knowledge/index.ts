// ─── AI Knowledge Module — Barrel Export ─────────────────────────────────────
import { Language } from '../translations';

export type Intent = 'price' | 'delivery' | 'contact' | 'material' | 'model_info' | 'greeting' | 'moq' | 'validation' | 'design_ai' | 'export_decree' | 'standards' | 'product_catalog' | 'printing' | 'payment' | 'materials_detail' | 'dimensions' | 'affirmative' | 'negative' | 'unknown';

export interface KnowledgeArticle {
    id: Intent;
    keywords: Partial<Record<Language, string[]>>;
    responses: Partial<Record<Language, string>>;
}

export { KNOWLEDGE_BASE } from './articles';
export { FALLBACK_RESPONSES, CONVERSATION_PROMPTS } from './prompts';
