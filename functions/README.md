# Functions

Python HTTP functions for the internal app.

## Endpoints

- `health`: unauthenticated health check
- `me`: authenticated endpoint that requires a Firebase ID token in the `Authorization: Bearer <token>` header

## Local development

1. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

2. Run the health endpoint locally:

   ```bash
   functions-framework --target health --port 8080
   ```

3. Run the authenticated endpoint locally:

   ```bash
   functions-framework --target me --port 8080
   ```

## Firebase Admin authentication

When running locally, set `GOOGLE_APPLICATION_CREDENTIALS` to a service account JSON file or use Application Default Credentials.
