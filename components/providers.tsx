"use client"

import type React from "react"

import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/auth-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SidebarProvider>
        {children}
        <Toaster />
      </SidebarProvider>
    </AuthProvider>
  )
}
