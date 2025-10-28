import * as Sentry from "@sentry/react";

export const initSentry = () => {
  // Only initialize Sentry in production
  if (import.meta.env.PROD) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN || "",
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],
      // Performance Monitoring
      tracesSampleRate: 1.0, // Capture 100% of the transactions in production
      // Session Replay
      replaysSessionSampleRate: 0.1, // Sample 10% of sessions
      replaysOnErrorSampleRate: 1.0, // Sample 100% of sessions with errors
      
      // Filter sensitive data
      beforeSend(event, hint) {
        // Remove sensitive user data
        if (event.user) {
          delete event.user.email;
          delete event.user.ip_address;
        }
        return event;
      },
      
      // Environment
      environment: import.meta.env.MODE,
    });
  }
};
