/**
 * Colors Service
 *
 * Service cho quản lý product colors và campaign colors
 */

import { supabase } from '../lib/supabase'

/**
 * Lấy tất cả product colors có sẵn
 * @returns {Promise<{data: Array, error: Error}>}
 */
export const getProductColors = async () => {
  const { data, error } = await supabase
    .from('product_colors')
    .select('*')
    .order('name')

  return { data, error }
}

/**
 * Thêm colors vào campaign
 * @param {string} campaignId - UUID của campaign
 * @param {Array<string>} colorIds - Array of color UUIDs
 * @param {string} featuredColorId - UUID của featured color
 * @returns {Promise<{data: Array, error: Error}>}
 */
export const addCampaignColors = async (campaignId, colorIds, featuredColorId) => {
  // Prepare data
  const colorsData = colorIds.map(colorId => ({
    campaign_id: campaignId,
    color_id: colorId,
    is_featured: colorId === featuredColorId,
  }))

  // Insert colors
  const { data, error } = await supabase
    .from('campaign_colors')
    .insert(colorsData)
    .select(`
      *,
      product_colors(*)
    `)

  return { data, error }
}

/**
 * Update featured color của campaign
 * @param {string} campaignId - UUID của campaign
 * @param {string} newFeaturedColorId - UUID của color mới
 * @returns {Promise<{error: Error}>}
 */
export const updateFeaturedColor = async (campaignId, newFeaturedColorId) => {
  // Set all colors to not featured
  await supabase
    .from('campaign_colors')
    .update({ is_featured: false })
    .eq('campaign_id', campaignId)

  // Set new featured color
  const { error } = await supabase
    .from('campaign_colors')
    .update({ is_featured: true })
    .eq('campaign_id', campaignId)
    .eq('color_id', newFeaturedColorId)

  return { error }
}

/**
 * Lấy colors của một campaign
 * @param {string} campaignId - UUID của campaign
 * @returns {Promise<{data: Array, error: Error}>}
 */
export const getCampaignColors = async (campaignId) => {
  const { data, error } = await supabase
    .from('campaign_colors')
    .select(`
      *,
      product_colors(*)
    `)
    .eq('campaign_id', campaignId)

  return { data, error }
}
