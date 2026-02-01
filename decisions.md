# Decisions Log

## Backend Decisions

### Framework: Node.js (Express)
- **Decision**: Use Node.js with Express.
- **Reasoning**:
    - **Unified Stack**: Javascript/Node.js for both frontend and backend simplifies development and maintenance.
    - **Performance**: Async nature of Node.js is ideal for handling concurrent API requests to multiple providers.
    - **Replaced Python**: Originally planned for Python/FastAPI, but switched to Node.js per user requirement.

### Architecture: Robust Fallback with Freshness Priority
- **Strategy**: Primary (ExchangeRate-API) -> Fallback 1 (Open Exchange Rates) -> Fallback 2 (Fixer.io).
- **Implementation**:
    - The system iterates through providers.
    - **Freshness Check**: If a provider returns data that is "stale" (> 1 hour old), we **do not** accept it immediately. We continue checking other providers for "fresh" data.
    - **Best-Effort Fallback**: If all providers are stale or failing, we return the "freshest" stale data available to ensure the app doesn't crash.

### Caching Strategy
- **Library**: `node-cache` (In-memory).
- **TTL**: 1 hour (3600 seconds).
- **Logic**:
    - Cache hits are served immediately.
    - Successful fetches from providers update the cache.
    - This minimizes API usage (preserving free tier limits) while keeping data reasonably current.

## Frontend Decisions

### Framework: React (Vite)
- **Decision**: Use Vite for scaffolding.
- **Reasoning**: Faster startup and HMR compared to Create React App.

### UI Metrics & Transparency
- **Freshness Indicators**:
    - **Relative Time**: "X mins ago" for quick context.
    - **Absolute Time**: "Updated: [Local Time]" for precision.
    - **Color Coding**: Green (< 5m), Yellow (< 1h), Red (> 1h) to verify data quality.
- **Source Attribution**:
    - Explicitly showing the provider name (e.g., "Source: ExchangeRate-API") so users know where the data is coming from.

### Styling: Tailwind CSS
- **Decision**: Use Tailwind.
- **Reasoning**: Rapid UI component development with consistent design tokens.
