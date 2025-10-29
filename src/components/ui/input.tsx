import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-md border-2 border-border-light bg-bg-elevated px-4 py-3 text-base text-text-primary font-primary ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-text-tertiary transition-all duration-200 focus-visible:outline-none focus-visible:border-brand-accent focus-visible:shadow-[0_0_0_3px_rgba(212,112,79,0.1)] disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
