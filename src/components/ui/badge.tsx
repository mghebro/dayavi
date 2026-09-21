import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md border border-[#18181B] px-2 py-0.5 text-xs font-semibold select-none shadow-retro-sm transition-all",
  {
    variants: {
      variant: {
        default: "bg-[#18181B] text-white",
        secondary: "bg-[#F5F2EB] text-[#18181B]",
        urgent: "bg-[#FF6B4A] text-white",
        high: "bg-[#FEF08A] text-[#18181B]",
        medium: "bg-[#E0D8FF] text-[#18181B]",
        low: "bg-[#D1FAE5] text-[#18181B]",
        none: "bg-white text-[#71717A] border-dashed",
        completed: "bg-[#10B981] text-white",
        active: "bg-[#3B82F6] text-white",
        planning: "bg-[#E0D8FF] text-[#18181B]",
        onHold: "bg-[#F59E0B] text-white",
        archived: "bg-[#71717A] text-white",
      },
      size: {
        default: "text-xs px-2 py-0.5",
        sm: "text-[10px] px-1.5 py-0.2",
        lg: "text-sm px-3 py-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { Badge, badgeVariants };
