const DEBUG = false
function log(...args: unknown[]) { if (DEBUG) log(...args) }

import { tool } from 'ai'
import { z } from 'zod'

async function geocodeCity(
  city: string
): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    )

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    if (!data.results || data.results.length === 0) {
      return null
    }

    const result = data.results[0]
    return {
      latitude: result.latitude,
      longitude: result.longitude,
    }
  } catch {
    return null
  }
}

export const getWeather = tool({
  description:
    'Get the current weather at a location. You can provide either coordinates or a city name.',
  inputSchema: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    city: z
      .string()
      .describe("City name (e.g., 'San Francisco', 'New York', 'London')")
      .optional(),
  }),
  execute: async (input) => {
    log('[Tool:getWeather] Called with input:', input)

    let latitude: number
    let longitude: number

    if (input.city) {
      log('[Tool:getWeather] Geocoding city:', input.city)
      const coords = await geocodeCity(input.city)
      if (!coords) {
        log('[Tool:getWeather] Geocoding failed for:', input.city)
        return {
          error: `Could not find coordinates for "${input.city}". Please check the city name.`,
        }
      }
      log('[Tool:getWeather] Geocoded to:', coords)
      latitude = coords.latitude
      longitude = coords.longitude
    } else if (input.latitude !== undefined && input.longitude !== undefined) {
      latitude = input.latitude
      longitude = input.longitude
    } else {
      log('[Tool:getWeather] Missing required parameters')
      return {
        error:
          'Please provide either a city name or both latitude and longitude coordinates.',
      }
    }

    log('[Tool:getWeather] Fetching weather for:', { latitude, longitude })
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto`
    )

    const weatherData = await response.json()
    log('[Tool:getWeather] Weather data received:', {
      current: weatherData.current,
      cityName: input.city,
    })

    if (input.city) {
      weatherData.cityName = input.city
    }

    return weatherData
  },
})
