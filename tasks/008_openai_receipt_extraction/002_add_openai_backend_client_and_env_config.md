## Especificacao

Add backend OpenAI client configuration for receipt image extraction.

## Entregavel

- OpenAI SDK dependency
- Backend extraction client module
- `OPENAI_API_KEY` documented in `.env.example`
- Sensible model configuration in backend environment/config

## Definicao de pronto

- API key is only used by the backend
- Mobile app never receives the OpenAI key
- Missing API key produces a clear backend startup or request error

## Teste

- Run typecheck
- Confirm backend can detect missing `OPENAI_API_KEY`
- Confirm `.env.example` documents the required variable
