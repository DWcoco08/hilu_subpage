/**
 * Campaign Service
 *
 * Service layer cho tất cả operations liên quan đến campaigns.
 * Team backend sẽ implement logic trong các Edge Functions,
 * sau đó replace các direct database calls này bằng API calls.
 */

import { supabase } from '../lib/supabase'

/**
 * Lấy danh sách campaigns của user hiện tại
 * @returns {Promise<{data: Array, error: Error}>}
 */
export const listCampaigns = async () => {
  const { data, error } = await supabase
    .from('campaigns')
    .select(`
      *,
      campaign_artworks(*),
      campaign_colors(
        *,
        product_colors(*)
      ),
      campaign_products(
        *,
        products(*)
      )
    `)
    .order('created_at', { ascending: false })

  return { data, error }
}

/**
 * Lấy chi tiết một campaign
 * @param {string} campaignId - UUID của campaign
 * @returns {Promise<{data: Object, error: Error}>}
 */
export const getCampaign = async (campaignId) => {
  const { data, error } = await supabase
    .from('campaigns')
    .select(`
      *,
      campaign_artworks(*),
      campaign_colors(
        *,
        product_colors(*)
      ),
      campaign_products(
        *,
        products(*)
      )
    `)
    .eq('id', campaignId)
    .single()

  return { data, error }
}

/**
 * Tạo campaign draft mới
 * @param {Object} campaignData - Dữ liệu campaign
 * @returns {Promise<{data: Object, error: Error}>}
 */
export const saveCampaignDraft = async (campaignData) => {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: new Error('User not authenticated') }
  }

  // Generate slug from title
  const slug = generateSlug(campaignData.campaignTitle)

  const { data, error } = await supabase
    .from('campaigns')
    .insert({
      user_id: user.id,
      title: campaignData.campaignTitle,
      slug: slug,
      description: campaignData.description,
      creator_name: campaignData.creatorName,
      base_cost: campaignData.baseCost,
      profit: campaignData.profit,
      currency: campaignData.currency,
      campaign_duration: campaignData.campaignDuration,
      sales_goal: campaignData.salesGoal || 1,
      status: 'draft',
    })
    .select()
    .single()

  return { data, error }
}

/**
 * Update campaign
 * @param {string} campaignId - UUID của campaign
 * @param {Object} updates - Dữ liệu cần update
 * @returns {Promise<{data: Object, error: Error}>}
 */
export const updateCampaign = async (campaignId, updates) => {
  const { data, error } = await supabase
    .from('campaigns')
    .update(updates)
    .eq('id', campaignId)
    .select()
    .single()

  return { data, error }
}

/**
 * Launch campaign (chuyển từ draft sang active)
 * @param {string} campaignId - UUID của campaign
 * @returns {Promise<{data: Object, error: Error}>}
 */
export const launchCampaign = async (campaignId) => {
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('campaigns')
    .update({
      status: 'active',
      starts_at: now,
      launched_at: now,
    })
    .eq('id', campaignId)
    .select()
    .single()

  return { data, error }
}

/**
 * Delete campaign
 * @param {string} campaignId - UUID của campaign
 * @returns {Promise<{error: Error}>}
 */
export const deleteCampaign = async (campaignId) => {
  const { error } = await supabase
    .from('campaigns')
    .delete()
    .eq('id', campaignId)

  return { error }
}

/**
 * Helper: Generate slug from title
 * @param {string} title - Campaign title
 * @returns {string} URL-friendly slug
 */
function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
