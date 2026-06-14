def extract_resume_text(message) -> str:
    """Extract resume text from the latest user message. For the MVP, the frontend
    sends pasted resume text directly as the message content."""
    content = getattr(message, "content", message)
    return content if isinstance(content, str) else str(content)
