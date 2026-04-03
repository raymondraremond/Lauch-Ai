/**
 * Centralized configuration for AI models across the entire application.
 * This prevents model naming mismatches and allows easy updates in the future.
 */
export const AI_MODELS = {
  // Stable, mid-tier model for general generation tasks (Builder, Chat, Companion)
  DEFAULT_GENERATION: 'gemini-2.5-flash',
  
  // High-capability model for complex reasoning and critique (Backend Project Critique)
  ADVANCED_REASONING: 'gemini-3.1-pro-preview',
};
