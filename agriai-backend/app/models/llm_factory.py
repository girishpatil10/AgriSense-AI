from langchain_openai import ChatOpenAI
from langchain_community.chat_models import ChatOllama
from app.config import settings

def get_llm(provider=None):
    """
    Factory function to get the LLM based on the provider.
    """
    provider = provider or settings.LLM_PROVIDER
    
    if provider == "ollama":
        return ChatOllama(
            model=settings.OLLAMA_MODEL,
            base_url=settings.OLLAMA_BASE_URL
        )
    elif provider == "openai":
        return ChatOpenAI(
            model=settings.OPENAI_MODEL,
            api_key=settings.OPENAI_API_KEY
        )
    else:
        # Fallback to local Ollama llama3 if nothing else is configured
        return ChatOllama(
            model="llama3",
            base_url="http://localhost:11434"
        )
