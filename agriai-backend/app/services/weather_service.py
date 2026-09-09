import httpx
import logging
from datetime import datetime, date
from typing import List, Optional
from app.config import settings
from app.utils.circuit_breaker import circuit_breaker
from app.schemas.weather import WeatherForecastItem, WeatherResponse
from app.models.weather_chain import generate_agricultural_advisory
from app.utils.cache import cache_get, cache_set, make_cache_key

logger = logging.getLogger(__name__)

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"
OPEN_WEATHER_URL = "https://api.openweathermap.org/data/2.5/forecast"

async def fetch_from_open_meteo(lat: float, lon: float, days: int) -> List[WeatherForecastItem]:
    params = {
        "latitude": lat,
        "longitude": lon,
        "daily": ["temperature_2m_max", "temperature_2m_min", "precipitation_sum", "weathercode"],
        "timezone": "auto",
        "forecast_days": days
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(OPEN_METEO_URL, params=params)
        response.raise_for_status()
        data = response.json()
        
        daily = data["daily"]
        forecast = []
        for i in range(len(daily["time"])):
            # Simple weather code mapping
            code = daily["weathercode"][i]
            condition = "Clear" if code == 0 else "Cloudy" if code < 50 else "Rainy" if code < 80 else "Stormy"
            
            forecast.append(WeatherForecastItem(
                date=datetime.strptime(daily["time"][i], "%Y-%m-%d").date(),
                temp_max=daily["temperature_2m_max"][i],
                temp_min=daily["temperature_2m_min"][i],
                precipitation=daily["precipitation_sum"][i],
                condition=condition
            ))
        return forecast

async def fetch_from_openweathermap(lat: float, lon: float, days: int) -> List[WeatherForecastItem]:
    if not settings.OPENWEATHERMAP_API_KEY:
        raise ValueError("OpenWeatherMap API key not configured")
        
    params = {
        "lat": lat,
        "lon": lon,
        "appid": settings.OPENWEATHERMAP_API_KEY,
        "units": "metric",
        "cnt": days * 8 # OWM provides 3-hour steps, 8 steps per day
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(OPEN_WEATHER_URL, params=params)
        response.raise_for_status()
        data = response.json()
        
        # OpenWeatherMap 5-day forecast is in 3-hour intervals. 
        # We need to aggregate it into daily items.
        daily_data = {}
        for item in data["list"]:
            dt = datetime.fromtimestamp(item["dt"]).date()
            if dt not in daily_data:
                daily_data[dt] = {
                    "temp_max": item["main"]["temp_max"],
                    "temp_min": item["main"]["temp_min"],
                    "precipitation": item.get("rain", {}).get("3h", 0) + item.get("snow", {}).get("3h", 0),
                    "condition": item["weather"][0]["main"]
                }
            else:
                daily_data[dt]["temp_max"] = max(daily_data[dt]["temp_max"], item["main"]["temp_max"])
                daily_data[dt]["temp_min"] = min(daily_data[dt]["temp_min"], item["main"]["temp_min"])
                daily_data[dt]["precipitation"] += item.get("rain", {}).get("3h", 0) + item.get("snow", {}).get("3h", 0)

        forecast = []
        sorted_dates = sorted(daily_data.keys())[:days]
        for dt in sorted_dates:
            forecast.append(WeatherForecastItem(
                date=dt,
                temp_max=daily_data[dt]["temp_max"],
                temp_min=daily_data[dt]["temp_min"],
                precipitation=daily_data[dt]["precipitation"],
                condition=daily_data[dt]["condition"]
            ))
        return forecast

@circuit_breaker("weather_api")
async def get_forecast_with_fallback(lat: float, lon: float, days: int) -> List[WeatherForecastItem]:
    try:
        return await fetch_from_open_meteo(lat, lon, days)
    except Exception as e:
        logger.warning(f"Open-Meteo failed, falling back to OpenWeatherMap: {e}")
        return await fetch_from_openweathermap(lat, lon, days)

async def get_weather_forecast(lat: float, lon: float, days: int = 7) -> WeatherResponse:
    # 1. Check Cache
    cache_key = f"weather:{round(lat, 2)}:{round(lon, 2)}:{days}"
    cached = await cache_get(cache_key)
    if cached:
        return WeatherResponse(**cached)

    # 2. Fetch Data
    forecast_items = await get_forecast_with_fallback(lat, lon, days)
    
    # 3. Generate Advisory
    advisory = await generate_agricultural_advisory([item.model_dump() for item in forecast_items])
    
    # 4. Construct Response
    response = WeatherResponse(
        location=f"Lat: {lat}, Lon: {lon}",
        latitude=lat,
        longitude=lon,
        current_temp=forecast_items[0].temp_max if forecast_items else None,
        summary=f"{forecast_items[0].condition} today" if forecast_items else "No data",
        forecast=forecast_items,
        agricultural_advisory=advisory
    )
    
    # 5. Cache result
    await cache_set(cache_key, response.model_dump(mode='json'), ttl=3600)
    
    return response
import random
from typing import Dict, Any

class WeatherService:
    @staticmethod
    async def get_seasonal_forecast(region: str, season: str) -> Dict[str, float]:
        """
        Mock weather service returning average temperature and rainfall for a season.
        In a real app, this would call a weather API.
        """
        # Mock logic based on season
        if season.lower() == "kharif":
            return {"avg_temp": 28.0 + random.uniform(-2, 2), "avg_rain": 1000.0 + random.uniform(-100, 100)}
        elif season.lower() == "rabi":
            return {"avg_temp": 20.0 + random.uniform(-2, 2), "avg_rain": 100.0 + random.uniform(-20, 20)}
        elif season.lower() == "zaid":
            return {"avg_temp": 32.0 + random.uniform(-2, 2), "avg_rain": 50.0 + random.uniform(-10, 10)}
        else:
            return {"avg_temp": 25.0, "avg_rain": 500.0}

weather_service = WeatherService()
