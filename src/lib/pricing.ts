export interface ToolPlan {
  id: string
  label: string
  pricePerSeat?: number
  flatPrice?: number
}

export interface ToolPricing {
  id: string
  name: string
  plans: ToolPlan[]
}

export const TOOLS: ToolPricing[] = [
  {
    id: 'cursor',
    name: 'Cursor',
    plans: [
      { id: 'hobby', label: 'Hobby', pricePerSeat: 0 },
      { id: 'pro', label: 'Pro', pricePerSeat: 20 },
      { id: 'business', label: 'Business', pricePerSeat: 40 },
      { id: 'enterprise', label: 'Enterprise', pricePerSeat: 0 },
    ],
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    plans: [
      { id: 'individual', label: 'Individual', pricePerSeat: 10 },
      { id: 'business', label: 'Business', pricePerSeat: 19 },
      { id: 'enterprise', label: 'Enterprise', pricePerSeat: 39 },
    ],
  },
  {
    id: 'claude',
    name: 'Claude',
    plans: [
      { id: 'free', label: 'Free', flatPrice: 0 },
      { id: 'pro', label: 'Pro', flatPrice: 20 },
      { id: 'max', label: 'Max', flatPrice: 100 },
      { id: 'team', label: 'Team', pricePerSeat: 30 },
      { id: 'enterprise', label: 'Enterprise', pricePerSeat: 0 },
      { id: 'api', label: 'API', flatPrice: 0 },
    ],
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    plans: [
      { id: 'plus', label: 'Plus', flatPrice: 20 },
      { id: 'team', label: 'Team', pricePerSeat: 30 },
      { id: 'enterprise', label: 'Enterprise', pricePerSeat: 0 },
      { id: 'api', label: 'API', flatPrice: 0 },
    ],
  },
  {
    id: 'anthropic-api',
    name: 'Anthropic API',
    plans: [{ id: 'direct', label: 'Direct', flatPrice: 0 }],
  },
  {
    id: 'openai-api',
    name: 'OpenAI API',
    plans: [{ id: 'direct', label: 'Direct', flatPrice: 0 }],
  },
  {
    id: 'gemini',
    name: 'Gemini',
    plans: [
      { id: 'free', label: 'Free', flatPrice: 0 },
      { id: 'premium', label: 'Premium', flatPrice: 19.99 },
      { id: 'business', label: 'Business', pricePerSeat: 24 },
      { id: 'api', label: 'API', flatPrice: 0 },
    ],
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    plans: [
      { id: 'free', label: 'Free', pricePerSeat: 0 },
      { id: 'pro', label: 'Pro', pricePerSeat: 15 },
      { id: 'teams', label: 'Teams', pricePerSeat: 35 },
    ],
  },
]
