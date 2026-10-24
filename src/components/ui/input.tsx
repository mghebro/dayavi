import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border-2 border-[#18181B] dark:border-[#3F3F4A] bg-white dark:bg-[#15151A] px-3 py-2 text-sm text-[#18181B] dark:text-[#F4F4F5] placeholder:text-[#A1A1AA] dark:placeholder:text-[#71717A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B4A] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-lg border-2 border-[#18181B] dark:border-[#3F3F4A] bg-white dark:bg-[#15151A] px-3 py-2 text-sm text-[#18181B] dark:text-[#F4F4F5] placeholder:text-[#A1A1AA] dark:placeholder:text-[#71717A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B4A] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 transition-all resize-y",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Input, Textarea };
