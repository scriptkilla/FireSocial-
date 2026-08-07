
import { Themes, Reaction, Achievement } from './types';

export const GIPHY_API_KEY = 'gLCzOuI9WiPhZI4vjYEzR57DLi9NL8Ev';

export const THEMES: Themes = {
  orange: {
    from: 'from-orange-500',
    to: 'to-red-500',
    light: 'from-orange-50 via-red-50 to-pink-50',
    text: 'text-orange-500',
    ring: 'focus:ring-orange-500',
    border: 'border-orange-500',
    hoverText: 'hover:text-orange-500',
  },
  blue: {
    from: 'from-blue-500',
    to: 'to-purple-500',
    light: 'from-blue-50 via-purple-50 to-pink-50',
    text: 'text-blue-500',
    ring: 'focus:ring-blue-500',
    border: 'border-blue-500',
    hoverText: 'hover:text-blue-500',
  },
  green: {
    from: 'from-green-500',
    to: 'to-teal-500',
    light: 'from-green-50 via-teal-50 to-blue-50',
    text: 'text-green-500',
    ring: 'focus:ring-green-500',
    border: 'border-green-500',
    hoverText: 'hover:text-green-500',
  },
  pink: {
    from: 'from-pink-500',
    to: 'to-rose-500',
    light: 'from-pink-50 via-rose-50 to-red-50',
    text: 'text-pink-500',
    ring: 'focus:ring-pink-500',
    border: 'border-pink-500',
    hoverText: 'hover:text-pink-500',
  },
};

export const REACTIONS: Reaction[] = [
  { name: 'like', emoji: '👍', color: 'text-blue-500' },
  { name: 'love', emoji: '❤️', color: 'text-red-500' },
  { name: 'fire', emoji: '🔥', color: 'text-orange-500' },
  { name: 'star', emoji: '⭐', color: 'text-yellow-500' },
];

export const ALL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_post', icon: '🎯', name: 'First Post', description: 'Created your first post' },
  { id: '10_posts', icon: '✍️', name: 'Prolific Poster', description: 'Made 10 posts' },
  { id: '100_followers', icon: '💯', name: '100 Followers', description: 'Reached 100 followers' },
  { id: '50_following', icon: '🤝', name: 'Social Butterfly', description: 'Followed 50 people' },
  { id: '10_day_streak', icon: '🔥', name: '10 Day Streak', description: 'Posted for 10 days straight' },
  { id: 'popular_post', icon: '⭐', name: 'Popular Post', description: 'Got 100+ likes on a post' }
];

export const API_CONFIG: { [key: string]: { storageKey: string; url: string; baseUrlKey?: string; modelNameKey?: string } } = {
  'Aries AI': { storageKey: 'apiKey_aries_ai', url: 'https://ariesai.com' },
  'Google AI': { storageKey: 'apiKey_google_ai', url: 'https://aistudio.google.com/apikeys' },
  'OpenAI': { storageKey: 'apiKey_openai', url: 'https://platform.openai.com/api-keys' },
  'Anthropic': { storageKey: 'apiKey_anthropic', url: 'https://console.anthropic.com/settings/keys' },
  'Meta (Llama)': { storageKey: 'apiKey_meta', url: 'https://ai.meta.com/resources/models-and-libraries/' },
  'xAI (Grok)': { storageKey: 'apiKey_xai', url: 'https://x.ai/product' },
  'DeepSeek': { storageKey: 'apiKey_deepseek', url: 'https://platform.deepseek.com/api_keys' },
  'Mistral AI': { storageKey: 'apiKey_mistral', url: 'https://console.mistral.ai/api-keys/' },
  'Custom': {
    storageKey: 'apiKey_custom',
    url: '#',
    baseUrlKey: 'baseUrl_custom',
    modelNameKey: 'modelName_custom'
  }
};
export type ApiService = keyof typeof API_CONFIG;

export const API_VERSIONS: Record<string, { name: string; description: string }[]> = {
    'Aries AI': [
        { name: 'Ember 1.0', description: 'Aries AI 1.0 Ember model, optimized for intelligence, speed, and versatility.' },
    ],
    'Google AI': [
        { name: 'Gemini 2.5 Pro', description: "Google's state-of-the-art model for complex tasks, excelling in advanced reasoning, coding, and multi-step workflows with a 1M token context window." },
        { name: 'Gemini 2.5 Flash', description: 'Optimized for speed and efficiency, ideal for large-scale processing and low-latency tasks.' },
        { name: 'Gemini 2.5 Flash-Lite', description: 'The fastest model in the Flash family, optimized for cost-efficiency and high-throughput tasks.' },
        { name: 'Gemini 2.5 Flash Image', description: 'A specialized variant fine-tuned for high-quality image generation and visual editing.' },
        { name: 'Gemini 2.5 Computer Use', description: 'Allows AI agents to interact directly with user interfaces to perform complex desktop and web automation.' },
        { name: 'Gemini 2.0 Flash', description: 'Next-generation multimodal model offering fast processing speeds and real-time interaction capabilities.' },
        { name: 'Gemini 1.5 Pro', description: 'Versatile model with a 2M token context window for deep analysis and software development.' },
        { name: 'Gemini 1.5 Flash', description: 'Lightweight and agile model built for speed and everyday assistant applications.' },
    ],
    'OpenAI': [
        { name: 'gpt-5.1', description: 'Flagship series featuring adaptive conversational intelligence with Instant & Deep Thinking modes.' },
        { name: 'gpt-5.1-chat', description: 'High-throughput, conversationally tuned version of the GPT-5.1 model architecture.' },
        { name: 'gpt-5.1-codex', description: 'Specialized model trained specifically for advanced code architecture and automated software engineering.' },
        { name: 'gpt-5.0', description: 'Universal multimodal model delivering high precision in reasoning and visual understanding.' },
        { name: 'gpt-5.0-mini', description: 'A lightweight, ultra-fast edition of GPT-5.0 for low-latency tasks.' },
        { name: 'gpt-5.0-nano', description: 'Compact low-footprint version designed for instant execution.' },
        { name: 'gpt-4.5', description: 'Research preview focusing on broad knowledge and natural human-like interaction.' },
        { name: 'gpt-4o', description: 'Universal text and vision model with balanced latency and accuracy.' },
        { name: 'gpt-4o-mini', description: 'Affordable, fast, and light multimodal model for general applications.' },
        { name: 'o4-mini', description: 'Advanced reasoning model optimized for complex STEM, logic, and mathematics.' },
        { name: 'o3-mini', description: 'Specialized reasoning engine built for structured problem solving and coding.' },
    ],
    'Anthropic': [
        { name: 'Claude Opus 4.1', description: 'Frontier intelligence for complex research, maximum precision, and deep multi-domain reasoning.' },
        { name: 'Claude Sonnet 4.5', description: 'Best balance of intelligence and speed; industry standard for coding, agents, and computer use.' },
        { name: 'Claude Haiku 4.5', description: 'Ultra-fast, cost-effective model designed for real-time customer interactions and rapid tasks.' },
        { name: 'Claude 3.7 Sonnet', description: 'Hybrid reasoning model featuring dynamic extended thinking mode for hard technical challenges.' },
        { name: 'Claude 3.5 Sonnet', description: 'Highly capable model excelled at complex coding, math, and multi-step agent workflows.' },
        { name: 'Claude 3.5 Haiku', description: 'Blazing fast responses with impressive logic and analysis capabilities.' },
        { name: 'Claude 3 Opus', description: 'Deep reasoning model for specialized academic, financial, and enterprise workloads.' },
    ],
    'Meta (Llama)': [
        { name: 'Llama 4.0 Scout (17B)', description: 'Next-gen open multimodal model optimized for efficiency, visual reasoning, and tool use.' },
        { name: 'Llama 4.0 Maverick (17B)', description: 'Specialized reasoning and coding open model built for high-throughput AI agents.' },
        { name: 'Llama 3.3 (70B)', description: 'High-performance 70B open text model rivaling top proprietary models.' },
        { name: 'Llama 3.2 Vision (90B / 11B)', description: 'Open vision-language models capable of visual reasoning, chart parsing, and document QA.' },
        { name: 'Llama 3.2 (3B / 1B)', description: 'Ultra-lightweight models designed for privacy-focused on-device execution.' },
        { name: 'Llama 3.1 (405B)', description: 'Frontier-class open weights model for complex reasoning and synthetic data generation.' },
    ],
    'xAI (Grok)': [
        { name: 'Grok 4.0', description: 'Flagship model with native tool execution, 256k context window, and live voice-camera capabilities.' },
        { name: 'Grok 4.0 Heavy', description: 'Employs multi-agent parallel reasoning for intricate problem solving.' },
        { name: 'Grok 4.0 Fast', description: 'Optimized for speed and responsiveness while maintaining high intelligence.' },
        { name: 'Grok 3.0', description: 'Advanced reasoning model with built-in Think mode and DeepSearch capabilities.' },
        { name: 'Grok 3.0 Mini', description: 'Fast, compact version of Grok 3.0 for agile task completion.' },
        { name: 'Grok 2.0', description: 'Multimodal model with advanced image generation and real-time social context.' },
        { name: 'Grok 1.5', description: 'Enhanced reasoning model featuring a 128k token context window.' },
        { name: 'Grok 1.0', description: 'Original Grok foundation model with real-time access to live information.' },
    ],
    'DeepSeek': [
        { name: 'DeepSeek-V3.2-Exp', description: 'Experimental Sparse Attention model engineered for ultra long-context efficiency.' },
        { name: 'DeepSeek-V3.1', description: 'Unified hybrid architecture seamlessly combining dynamic thinking and non-thinking execution.' },
        { name: 'DeepSeek-R1', description: 'Frontier open reasoning model utilizing step-by-step chain-of-thought logic.' },
        { name: 'DeepSeek-V3', description: '671B Mixture-of-Experts (MoE) foundation model excel in math, logic, and coding.' },
    ],
    'Mistral AI': [
        { name: 'Magistral Medium 1.2', description: 'Enterprise-grade reasoning model tailored for complex corporate operations.' },
        { name: 'Magistral Small 1.2', description: 'Open-weights reasoning model delivering fast, accurate structured outputs.' },
        { name: 'Mistral Medium 3.0', description: 'Enterprise flagship model optimized for software engineering and STEM applications.' },
        { name: 'Mistral Small 3.2', description: 'General-purpose compact model equipped with vision understanding capabilities.' },
        { name: 'Devstral Medium 1.0', description: 'Dedicated AI agent model purpose-built for end-to-end software engineering.' },
        { name: 'Devstral Small 1.1', description: 'Open-source coding model optimized for developer workflow automation.' },
        { name: 'Codestral 2.0', description: 'Specialized high-speed model for code synthesis, editing, and bug fixing.' },
        { name: 'Voxtral Small 1.0', description: 'Open-source audio intelligence model for voice conversation and transcription.' },
        { name: 'Voxtral Mini 1.0', description: 'Compact audio processing model for real-time speech-to-text.' },
        { name: 'Ministral 8B', description: 'High-density model optimized for edge devices and localized deployments.' },
        { name: 'Ministral 3B', description: 'Ultra-compact on-device AI model for instant local task execution.' },
        { name: 'Pixtral Large 1.0', description: 'Massive multimodal model capable of high-resolution document and image understanding.' },
        { name: 'Mistral OCR 1.0', description: 'Specialized document parsing and optical character recognition model.' },
    ],
    'Custom': [],
};
