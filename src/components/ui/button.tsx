import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B4A] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none btn-retro",
  {
    variants: {
      variant: {
        primary:
          "bg-[#FF6B4A] text-white border-2 border-[#18181B] shadow-retro hover:bg-[#FA5530]",
        secondary:
          "bg-[#F5F2EB] text-[#18181B] border-2 border-[#18181B] shadow-retro hover:bg-[#EAE4D9]",
        outline:
          "bg-white text-[#18181B] border-2 border-[#18181B] shadow-retro-sm hover:bg-[#FDFBF7]",
        ghost:
          "text-[#18181B] hover:bg-[#F5F2EB] hover:text-[#18181B] border-none shadow-none",
        danger:
          "bg-[#EF4444] text-white border-2 border-[#18181B] shadow-retro hover:bg-[#DC2626]",
        lavender:
          "bg-[#E0D8FF] text-[#18181B] border-2 border-[#18181B] shadow-retro hover:bg-[#D4C8FF]",
        butter:
          "bg-[#FEF08A] text-[#18181B] border-2 border-[#18181B] shadow-retro hover:bg-[#FDE047]",
        sage:
          "bg-[#D1FAE5] text-[#18181B] border-2 border-[#18181B] shadow-retro hover:bg-[#A7F3D0]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-xl px-6 text-base",
        icon: "h-9 w-9 p-0",
        "icon-sm": "h-7 w-7 p-0 text-xs",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
