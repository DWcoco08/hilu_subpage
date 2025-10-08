// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log("Save campaign draft function started")

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    // Create Supabase client with user's auth token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Get current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Parse request body
    const requestData = await req.json()
    const {
      title,
      description,
      creatorName,
      baseCost,
      profit,
      currency,
      campaignDuration,
      salesGoal,
      selectedColors,
      featuredColorId,
      selectedProducts,
    } = requestData

    // Validate required fields
    if (!title || !creatorName) {
      throw new Error('Missing required fields: title, creatorName')
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    // TODO: Team backend implement logic here
    // 1. Insert campaign record
    const { data: campaign, error: campaignError } = await supabaseClient
      .from('campaigns')
      .insert({
        user_id: user.id,
        title,
        slug,
        description,
        creator_name: creatorName,
        base_cost: baseCost || 20.00,
        profit: profit || 5.00,
        currency: currency || 'GBP',
        campaign_duration: campaignDuration || 14,
        sales_goal: salesGoal || 1,
        status: 'draft',
      })
      .select()
      .single()

    if (campaignError) {
      throw campaignError
    }

    // 2. Insert campaign colors (if provided)
    if (selectedColors && selectedColors.length > 0) {
      const colorsData = selectedColors.map((colorId: string) => ({
        campaign_id: campaign.id,
        color_id: colorId,
        is_featured: colorId === featuredColorId,
      }))

      await supabaseClient
        .from('campaign_colors')
        .insert(colorsData)
    }

    // 3. Insert campaign products (if provided)
    if (selectedProducts && selectedProducts.length > 0) {
      const productsData = selectedProducts.map((productId: string) => ({
        campaign_id: campaign.id,
        product_id: productId,
      }))

      await supabaseClient
        .from('campaign_products')
        .insert(productsData)
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        data: campaign,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

/* To invoke locally:

  1. Run `supabase start` (you need Docker installed)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/save-campaign-draft' \
    --header 'Authorization: Bearer YOUR_ANON_KEY' \
    --header 'Content-Type: application/json' \
    --data '{"title":"My Campaign","creatorName":"John Doe"}'

*/
