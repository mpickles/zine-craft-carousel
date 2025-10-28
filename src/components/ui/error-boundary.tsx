import React from "react";
import * as Sentry from "@sentry/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface ErrorBoundaryFallbackProps {
  error: Error;
  resetError: () => void;
}

const ErrorBoundaryFallback: React.FC<ErrorBoundaryFallbackProps> = ({
  error,
  resetError,
}) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        <div className="flex justify-center">
          <AlertTriangle className="w-16 h-16 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="text-muted-foreground">
            We're sorry, but something unexpected happened. Our team has been notified.
          </p>
        </div>
        <div className="space-y-2">
          <Button onClick={resetError} className="w-full">
            Try again
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = "/feed"}
            className="w-full"
          >
            Go to feed
          </Button>
        </div>
        {process.env.NODE_ENV === "development" && (
          <details className="text-left text-xs">
            <summary className="cursor-pointer text-muted-foreground">
              Error details (dev only)
            </summary>
            <pre className="mt-2 p-2 bg-muted rounded overflow-auto">
              {error.message}
              {"\n\n"}
              {error.stack}
            </pre>
          </details>
        )}
      </Card>
    </div>
  );
};

export const ErrorBoundary = Sentry.withErrorBoundary(
  ({ children }: { children: React.ReactNode }) => <>{children}</>,
  {
    fallback: (props) => <ErrorBoundaryFallback error={props.error as Error} resetError={props.resetError} />,
  }
);
