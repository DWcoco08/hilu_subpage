/**
 * Products Service
 *
 * Service cho quản lý products
 */

import { supabase } from '../lib/supabase'

/**
 * Lấy tất cả products có sẵn
 * @param {Object} filters - Filters: {type, gender, fit}
 * @returns {Promise<{data: Array, error: Error}>}
 */
export const getProducts = async (filters = {}) => {
  let query = supabase
    .from('products')
    .select('*')
    .eq('is_active', true)

  if (filters.type) {
    query = query.eq('product_type', filters.type)
  }

  if (filters.gender) {
    query = query.eq('gender', filters.gender)
  }

  if (filters.fit) {
    query = query.eq('fit', filters.fit)
  }

  const { data, error } = await query.order('name')

  return { data, error }
}

/**
 * Thêm products vào campaign
 * @param {string} campaignId - UUID của campaign
 * @param {Array<string>} productIds - Array of product UUIDs
 * @returns {Promise<{data: Array, error: Error}>}
 */
export const addCampaignProducts = async (campaignId, productIds) => {
  const productsData = productIds.map(productId => ({
    campaign_id: campaignId,
    product_id: productId,
  }))

  const { data, error } = await supabase
    .from('campaign_products')
    .insert(productsData)
    .select(`
      *,
      products(*)
    `)

  return { data, error }
}

/**
 * Lấy products của một campaign
 * @param {string} campaignId - UUID của campaign
 * @returns {Promise<{data: Array, error: Error}>}
 */
export const getCampaignProducts = async (campaignId) => {
  const { data, error } = await supabase
    .from('campaign_products')
    .select(`
      *,
      products(*)
    `)
    .eq('campaign_id', campaignId)

  return { data, error }
}
