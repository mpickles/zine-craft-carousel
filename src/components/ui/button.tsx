import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-primary font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-brand-accent text-[hsl(var(--color-ivory))] rounded-md hover:bg-[hsl(var(--accent-burnt-orange-hover))] hover:translate-y-[-1px] hover:shadow-[0_4px_12px_rgba(212,112,79,0.2)] active:translate-y-0 active:shadow-[0_2px_8px_rgba(212,112,79,0.2)]",
        destructive: "bg-error text-[hsl(var(--color-ivory))] rounded-md hover:opacity-90",
        outline: "border-2 border-text-primary bg-transparent text-text-primary rounded-md hover:bg-text-primary hover:text-[hsl(var(--color-eggshell))]",
        secondary: "bg-bg-tertiary text-text-primary rounded-md hover:bg-[hsl(var(--border-heavy))]",
        ghost: "bg-transparent text-text-primary hover:bg-[rgba(212,112,79,0.08)] hover:text-brand-accent rounded-md",
        link: "text-brand-accent font-medium hover:underline underline-offset-4",
        success: "bg-success text-[hsl(var(--color-ivory))] rounded-md hover:opacity-90",
      },
      size: {
        default: "h-11 px-6 py-3 text-base min-w-[44px]",
        sm: "h-9 rounded-md px-4 text-sm min-w-[44px]",
        lg: "h-12 rounded-md px-6 text-lg min-w-[44px]",
        icon: "h-11 w-11 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
