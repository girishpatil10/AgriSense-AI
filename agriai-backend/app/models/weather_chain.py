from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from app.models.llm_factory import get_llm

WEATHER_ADVISORY_PROMPT = """
You are an expert agricultural weather advisor. 
Given the following weather forecast for the next few days, provide a concise agricultural advisory.
Focus on:
1. Irrigation needs (based on precipitation and temperature).
2. Risk of pests or diseases (humidity/temperature).
3. Best days for planting, harvesting, or fertilizing.
4. Any critical warnings (frost, heatwave, heavy rain).

Forecast Data:
{forecast_json}

Provide the advisory in 3-4 bullet points. Keep it professional and actionable.
"""

async def generate_agricultural_advisory(forecast_data: list) -> str:
    try:
        llm = get_llm()
        prompt = ChatPromptTemplate.from_template(WEATHER_ADVISORY_PROMPT)
        chain = prompt | llm | StrOutputParser()
        
        # Format forecast for the prompt
        forecast_str = ""
        for item in forecast_data:
            forecast_str += f"- {item['date']}: {item['condition']}, Max: {item['temp_max']}°C, Min: {item['temp_min']}°C, Precip: {item['precipitation']}mm\n"
        
        response = await chain.ainvoke({"forecast_json": forecast_str})
        return response
    except Exception as e:
        print(f"Error generating agricultural advisory: {e}")
        return "Weather advisory currently unavailable. Please monitor local conditions."
