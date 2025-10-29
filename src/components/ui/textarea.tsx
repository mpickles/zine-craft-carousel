import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[120px] w-full rounded-md border-2 border-border-light bg-bg-elevated px-4 py-3 text-base text-text-primary font-primary ring-offset-background placeholder:text-text-tertiary transition-all duration-200 resize-vertical focus-visible:outline-none focus-visible:border-brand-accent focus-visible:shadow-[0_0_0_3px_rgba(212,112,79,0.1)] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
