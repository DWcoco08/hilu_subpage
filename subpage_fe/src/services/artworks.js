/**
 * Artwork Service
 *
 * Service cho upload và quản lý artworks.
 * Note: Storage bucket hiện tại chưa được tạo do lỗi config.
 * Có thể dùng external storage (Cloudinary, AWS S3) hoặc base64 encode tạm thời.
 */

import { supabase } from '../lib/supabase'

/**
 * Upload artwork file to Supabase Storage
 * @param {File} file - File object từ input
 * @param {string} campaignId - UUID của campaign
 * @param {string} side - 'front' hoặc 'back'
 * @returns {Promise<{data: Object, error: Error}>}
 */
export const uploadArtwork = async (file, campaignId, side) => {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: new Error('User not authenticated') }
  }

  // Generate unique file path
  const fileExt = file.name.split('.').pop()
  const fileName = `${side}.${fileExt}`
  const filePath = `${user.id}/${campaignId}/${fileName}`

  // Upload to storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('campaign-artworks')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (uploadError) {
    return { data: null, error: uploadError }
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('campaign-artworks')
    .getPublicUrl(filePath)

  // Save to database
  const { data, error } = await supabase
    .from('campaign_artworks')
    .upsert({
      campaign_id: campaignId,
      side: side,
      storage_path: filePath,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
    })
    .select()
    .single()

  return { data: { ...data, publicUrl }, error }
}

/**
 * Get artwork URL
 * @param {string} storagePath - Path trong storage
 * @returns {string} Public URL
 */
export const getArtworkUrl = (storagePath) => {
  const { data } = supabase.storage
    .from('campaign-artworks')
    .getPublicUrl(storagePath)

  return data.publicUrl
}

/**
 * Delete artwork
 * @param {string} campaignId - UUID của campaign
 * @param {string} side - 'front' hoặc 'back'
 * @returns {Promise<{error: Error}>}
 */
export const deleteArtwork = async (campaignId, side) => {
  // Get artwork record
  const { data: artwork } = await supabase
    .from('campaign_artworks')
    .select('storage_path')
    .eq('campaign_id', campaignId)
    .eq('side', side)
    .single()

  if (!artwork) {
    return { error: new Error('Artwork not found') }
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('campaign-artworks')
    .remove([artwork.storage_path])

  if (storageError) {
    return { error: storageError }
  }

  // Delete from database
  const { error } = await supabase
    .from('campaign_artworks')
    .delete()
    .eq('campaign_id', campaignId)
    .eq('side', side)

  return { error }
}

/**
 * WORKAROUND: Convert image to base64 (tạm thời nếu storage không hoạt động)
 * @param {File} file - File object
 * @returns {Promise<string>} Base64 string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })
}
