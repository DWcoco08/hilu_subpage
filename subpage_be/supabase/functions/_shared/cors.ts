/**
 * CORS Headers
 *
 * Shared CORS configuration for all Edge Functions.
 * Allows requests from frontend application.
 */

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
