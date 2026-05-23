## Especificacao

Improve mobile error handling for extraction failures.

## Entregavel

- Clear error message when extraction fails
- Retry action
- No navigation to review on extraction failure
- Loading state while OpenAI extraction is running

## Definicao de pronto

- User can distinguish network failure from extraction failure
- User can retry without restarting the app
- Failed extraction does not create a confirmed receipt

## Teste

- Trigger backend extraction error
- Trigger network error
- Confirm retry works after backend recovers
