def optimize_context_tokens(context: str, max_length: int = 15000) -> str:
    """
    Google Gemini vb. modellerde token limitini aşmamak için
    çok uzun bağlam metinlerini sonundan kırparak güvenli boyuta indirger.
    İleride Semantic Search (Eklenecek Embeddings) ile RAG mimarisine dönüştürülebilir.
    """
    if len(context) > max_length:
        return context[:max_length] + "\\n... (Daha fazla sistem verisi var ancak token limiti nedeniyle kırpıldı)"
    return context
