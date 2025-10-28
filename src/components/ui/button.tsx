import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-primary font-semibold ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-brand-accent text-white rounded-md hover:opacity-90",
        destructive: "bg-error text-white rounded-md hover:opacity-90",
        outline: "border-[1.5px] border-border-heavy bg-transparent text-text-primary rounded-md hover:bg-bg-secondary font-medium",
        secondary: "bg-transparent text-text-primary rounded-md hover:bg-bg-secondary font-medium border-0",
        ghost: "hover:bg-bg-secondary hover:text-text-primary rounded-md",
        link: "text-brand-accent font-medium hover:opacity-70",
        success: "bg-success text-white rounded-md hover:opacity-90",
      },
      size: {
        default: "h-11 px-6 py-3 text-[15px]",
        sm: "h-9 rounded-md px-4 text-sm",
        lg: "h-12 rounded-md px-6 text-base",
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
