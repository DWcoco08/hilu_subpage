/**
 * Convert Currency Endpoint
 *
 * Converts amounts between VND and USD using real-time exchange rates.
 *
 * Endpoint: POST /convert-currency
 *
 * Request Body:
 * {
 *   "amount": 100,
 *   "fromCurrency": "USD",  // "USD" or "VND"
 *   "toCurrency": "VND"     // "USD" or "VND"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "originalAmount": 100,
 *     "fromCurrency": "USD",
 *     "toCurrency": "VND",
 *     "convertedAmount": 2500000,
 *     "rate": 25000,
 *     "timestamp": "2025-11-21T10:30:00Z"
 *   }
 * }
 */

import { corsHeaders } from '../_shared/cors.ts'

interface ConvertRequest {
  amount: number
  fromCurrency: string
  toCurrency: string
}

interface ConvertResponse {
  originalAmount: number
  fromCurrency: string
  toCurrency: string
  convertedAmount: number
  rate: number
  timestamp: string
}

// Cache for exchange rates (with TTL)
interface RateCache {
  rate: number
  timestamp: number
}

const rateCache = new Map<string, RateCache>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Fetch real-time exchange rate from public API
 * Using exchangerate-api.com (free tier)
 */
async function getExchangeRate(from: string, to: string): Promise<number> {
  const cacheKey = `${from}_${to}`
  const cached = rateCache.get(cacheKey)

  // Return cached rate if still valid
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.rate
  }

  try {
    // Using exchangerate-api.com free API (no key required for basic usage)
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${from}`
    )

    if (!response.ok) {
      throw new Error(`Exchange rate API error: ${response.status}`)
    }

    const data = await response.json() as Record<string, unknown>
    const rates = data.rates as Record<string, number>
    const rate = rates[to]

    if (!rate) {
      throw new Error(`Currency conversion rate not found for ${from} to ${to}`)
    }

    // Cache the rate
    rateCache.set(cacheKey, {
      rate,
      timestamp: Date.now(),
    })

    return rate
  } catch (error) {
    // Fallback: use hardcoded rates if API fails
    console.error('Error fetching exchange rate:', error)
    return getFallbackRate(from, to)
  }
}

/**
 * Fallback rates (updated manually as needed)
 * These are approximate rates as of 2025
 */
function getFallbackRate(from: string, to: string): number {
  const rates: Record<string, Record<string, number>> = {
    USD: {
      USD: 1,
      VND: 25000, // Approximate: 1 USD = 25,000 VND
    },
    VND: {
      USD: 0.00004, // Approximate: 1 VND = 0.00004 USD
      VND: 1,
    },
  }

  return rates[from]?.[to] ?? 1
}

/**
 * Validate currency code
 */
function isValidCurrency(currency: string): boolean {
  return ['USD', 'VND'].includes(currency.toUpperCase())
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  try {
    // Parse request body
    const body = await req.json() as ConvertRequest

    // Validate input
    const { amount, fromCurrency, toCurrency } = body

    if (typeof amount !== 'number' || amount <= 0) {
      throw new Error('Amount must be a positive number')
    }

    if (!isValidCurrency(fromCurrency)) {
      throw new Error(`Invalid currency: ${fromCurrency}. Supported: USD, VND`)
    }

    if (!isValidCurrency(toCurrency)) {
      throw new Error(`Invalid currency: ${toCurrency}. Supported: USD, VND`)
    }

    // If same currency, return 1:1
    if (fromCurrency.toUpperCase() === toCurrency.toUpperCase()) {
      const response: ConvertResponse = {
        originalAmount: amount,
        fromCurrency: fromCurrency.toUpperCase(),
        toCurrency: toCurrency.toUpperCase(),
        convertedAmount: amount,
        rate: 1,
        timestamp: new Date().toISOString(),
      }

      return new Response(
        JSON.stringify({ success: true, data: response }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get exchange rate
    const rate = await getExchangeRate(
      fromCurrency.toUpperCase(),
      toCurrency.toUpperCase()
    )

    // Calculate converted amount
    const convertedAmount = Number((amount * rate).toFixed(2))

    const response: ConvertResponse = {
      originalAmount: amount,
      fromCurrency: fromCurrency.toUpperCase(),
      toCurrency: toCurrency.toUpperCase(),
      convertedAmount,
      rate,
      timestamp: new Date().toISOString(),
    }

    return new Response(
      JSON.stringify({ success: true, data: response }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error in convert-currency:', error)

    const errorMessage = error instanceof Error ? error.message : String(error)

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
