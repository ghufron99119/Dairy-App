import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> { }

const GlassInput = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-12 w-full border-b border-white/20 bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-cyan-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-300",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
GlassInput.displayName = "Input"

export { GlassInput }
