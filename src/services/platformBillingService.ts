import { supabase } from '../lib/supabase';

export interface PlatformPlan {
  id: string;
  name: string;
  code: string;
  description?: string;
  price: number;
  priceSuffix: string;
  billingCycle: string;
  modules: string[];
  features: string[];
  maxUsers?: number;
  trialDays: number;
  isPopular: boolean;
  sortOrder: number;
  color?: string;
  archived: boolean;
  createdAt?: string;
  updatedAt?: string;
}

function mapPlan(row: Record<string, unknown>): PlatformPlan {
  return {
    id: row.id as string,
    name: row.name as string,
    code: row.code as string,
    description: row.description as string | undefined,
    price: (row.price as number) ?? 0,
    priceSuffix: (row.price_suffix as string) ?? '/mo',
    billingCycle: (row.billing_cycle as string) ?? 'monthly',
    modules: (row.modules as string[]) ?? [],
    features: (row.features as string[]) ?? [],
    maxUsers: row.max_users as number | undefined,
    trialDays: (row.trial_days as number) ?? 14,
    isPopular: (row.is_popular as boolean) ?? false,
    sortOrder: (row.sort_order as number) ?? 0,
    color: row.color as string | undefined,
    archived: (row.archived as boolean) ?? false,
    createdAt: row.created_at as string | undefined,
    updatedAt: row.updated_at as string | undefined,
  };
}

export async function fetchPlatformPlans(): Promise<PlatformPlan[]> {
  const client = supabase;
  if (!client) return [];

  const { data, error } = await client
    .from('platform_plans')
    .select('*')
    .eq('archived', false)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data || []).map(mapPlan);
}
