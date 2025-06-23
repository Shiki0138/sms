import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { clsx } from 'clsx';
const Alert = React.forwardRef(({ className, variant = 'default', ...props }, ref) => (_jsx("div", { ref: ref, role: "alert", className: clsx("relative w-full rounded-lg border p-4", {
        "bg-background text-foreground": variant === 'default',
        "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive": variant === 'destructive',
    }, className), ...props })));
Alert.displayName = "Alert";
const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (_jsx("h5", { ref: ref, className: clsx("mb-1 font-medium leading-none tracking-tight", className), ...props })));
AlertTitle.displayName = "AlertTitle";
const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (_jsx("div", { ref: ref, className: clsx("text-sm [&_p]:leading-relaxed", className), ...props })));
AlertDescription.displayName = "AlertDescription";
export { Alert, AlertTitle, AlertDescription };
