"use client"
import React, { createContext, useContext, useState } from "react"
import { cn } from "../../lib/utils"

const SelectContext = createContext<any>(null)

export const Select = ({ children, value, onValueChange }: any) => {
  const [open, setOpen] = useState(false)
  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="relative inline-block w-full">{children}</div>
    </SelectContext.Provider>
  )
}

export const SelectTrigger = ({ className, children, ...props }: any) => {
  const { setOpen, open } = useContext(SelectContext)
  return (
    <button
      onClick={() => setOpen(!open)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-slate-200",
        className
      )}
      {...props}
    >
      {children}
      <span className="opacity-50">▼</span>
    </button>
  )
}

export const SelectValue = ({ placeholder }: any) => {
  const { value } = useContext(SelectContext)
  return <span>{value || placeholder}</span>
}

export const SelectContent = ({ children, className }: any) => {
    const { open } = useContext(SelectContext)
    if (!open) return null
    
    return (
        <div className={cn("absolute z-50 min-w-[8rem] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80 bg-white mt-1 border-slate-200", className)}>
            <div className="p-1">
                {children}
            </div>
        </div>
    )
}

export const SelectItem = ({ children, value, className }: any) => {
    const { onValueChange, setOpen } = useContext(SelectContext)
    return (
        <div 
            className={cn("relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-2 text-sm outline-none hover:bg-slate-100 cursor-pointer", className)}
            onClick={() => {
                onValueChange(value)
                setOpen(false)
            }}
        >
            {children}
        </div>
    )
}
