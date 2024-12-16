FROM python:3.12

ENV PYTHONUNBUFFERED True

WORKDIR /app
COPY . ./

ENV PORT 8000

ENV LANGCHAIN_TRACING_V2 true
ENV LANGCHAIN_ENDPOINT "https://api.smith.langchain.com"
ENV LANGCHAIN_API_KEY replace_with_api_key
ENV LANGCHAIN_PROJECT replace_with_project

ENV OPENAI_API_KEY replace_with_api_key
ENV TWILIO_ACCOUNT_SID replace_with_account_sid
ENV TWILIO_AUTH_TOKEN replace_with_auth_token
ENV TWILIO_PHONE_NUMBER replace_with_phone_number

RUN pip install -r requirements.txt

# As an example here we're running the web service with one worker on uvicorn.
CMD exec uvicorn app:app --host 0.0.0.0 --port ${PORT} --workers 1