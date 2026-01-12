"use client"
import { FileText, Search, Settings, Upload, Activity, Database, Download, UserPlus, LogOut, User } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth-provider"

const items = [
  {
    title: "Visão Geral",
    url: "/",
    icon: Activity,
  },
  {
    title: "Processos",
    url: "/processes",
    icon: FileText,
  },
  {
    title: "Processamento",
    url: "/processing",
    icon: Database,
  },
  {
    title: "Importar PDF",
    url: "/import",
    icon: Upload,
  },
  {
    title: "Exportar",
    url: "/export",
    icon: Download,
  },
  {
    title: "Buscar Processo",
    url: "/search",
    icon: Search,
  },
  {
    title: "Configurações",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user, isAdmin, logout, isAuthenticated } = useAuth()

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">JurisTrackSP</p>
            <p className="text-xs text-muted-foreground">Gerenciamento de Processos</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/users/create"}>
                    <Link href="/users/create">
                      <UserPlus className="h-4 w-4" />
                      <span>Criar Usuário</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4 space-y-3">
        {isAuthenticated && (
          <>
            {user ? (
              <div className="flex items-center gap-2 px-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-accent-foreground">
                  <User className="h-4 w-4" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium truncate">{user.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-accent-foreground animate-pulse">
                  <User className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Carregando...</p>
                </div>
              </div>
            )}
            <Separator />
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => logout()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </>
        )}
        <p className="text-xs text-muted-foreground px-2">Sistema de gerenciamento de processos jurídicos</p>
      </SidebarFooter>
    </Sidebar>
  )
}
