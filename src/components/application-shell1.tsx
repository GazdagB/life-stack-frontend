import * as React from "react"
import {
  CheckCircle2,
  Calculator,
  ChevronRight,
  ChevronsUpDown,
  CircleDollarSign,
  ClipboardList,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Repeat2,
  Settings,
  Sparkles,
  TrendingUp,
  User,
} from "lucide-react"
import { NavLink, Outlet, useLocation, useNavigate } from "react-router"

import { Avatar, AvatarFallback } from "src/components/ui/avatar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "src/components/ui/breadcrumb"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "src/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "src/components/ui/dropdown-menu"
import { ScrollArea } from "src/components/ui/scroll-area"
import { Separator } from "src/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "src/components/ui/sidebar"
import { useAuth } from "src/lib/auth"
import { cn } from "src/lib/utils"

type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>

type NavItem = {
  label: string
  href: string
  icon: IconType
  exact?: boolean
  children?: Array<{ label: string; href: string; icon: IconType }>
}
const navigation: Array<{ title: string; items: NavItem[] }> = [
  {
    title: "Home",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    title: "Life management",
    items: [
      {
        label: "Tasks",
        href: "/todos",
        icon: ClipboardList,
        children: [
          { label: "All tasks", href: "/todos", icon: ListTodo },
          { label: "Today", href: "/todos/today", icon: Sparkles },
          { label: "Completed", href: "/todos/completed", icon: CheckCircle2 },
        ],
      },
      {
        label: "Expenses",
        href: "/expenses",
        icon: CircleDollarSign,
        children: [
          { label: "All expenses", href: "/expenses", icon: CircleDollarSign },
          { label: "Recurring", href: "/expenses/recurring", icon: Repeat2 },
          { label: "Coverage plan", href: "/expenses/coverage", icon: Calculator },
          { label: "Spending overview", href: "/expenses/overview", icon: TrendingUp },
        ],
      },
    ],
  },
]

const pageNames: Record<string, [string, string]> = {
  "/dashboard": ["Home", "Dashboard"],
  "/todos": ["Tasks", "All tasks"],
  "/todos/today": ["Tasks", "Today"],
  "/todos/completed": ["Tasks", "Completed"],
  "/expenses": ["Expenses", "All expenses"],
  "/expenses/recurring": ["Expenses", "Recurring"],
  "/expenses/coverage": ["Expenses", "Coverage plan"],
  "/expenses/overview": ["Expenses", "Spending overview"],
}

function Brand() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" asChild>
          <NavLink to="/dashboard">
            <div className="flex size-9 items-center justify-center rounded-xl bg-foreground text-background shadow-sm">
              <Sparkles className="size-4" />
            </div>
            <div className="grid flex-1 text-left leading-tight">
              <span className="font-semibold tracking-tight">Life Stack</span>
              <span className="text-xs text-muted-foreground">Personal operating system</span>
            </div>
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

function NavigationItem({ item }: { item: NavItem }) {
  const location = useLocation()
  const Icon = item.icon
  const hasChildren = Boolean(item.children?.length)
  const isSectionActive = item.exact ? location.pathname === item.href : location.pathname.startsWith(item.href)

  if (!hasChildren) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isSectionActive}>
          <NavLink to={item.href} end={item.exact}>
            <Icon className="size-4" />
            <span>{item.label}</span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <Collapsible asChild defaultOpen={isSectionActive} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton isActive={isSectionActive}>
            <Icon className="size-4" />
            <span>{item.label}</span>
            <ChevronRight className="ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.children?.map((child) => {
              const ChildIcon = child.icon
              const isActive = location.pathname === child.href
              return (
                <SidebarMenuSubItem key={child.href}>
                  <SidebarMenuSubButton asChild isActive={isActive}>
                    <NavLink to={child.href} end>
                      <ChildIcon className="size-3.5" />
                      <span>{child.label}</span>
                    </NavLink>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              )
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

function UserMenu() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const name = user?.username ?? "User"
  const initials = name.slice(0, 2).toUpperCase()

  function handleLogout() {
    void logout().finally(() => navigate("/login", { replace: true }))
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
              <Avatar className="size-8 rounded-lg">
                <AvatarFallback className="rounded-lg bg-foreground text-xs text-background">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{name}</span>
                <span className="truncate text-xs text-muted-foreground">{user?.email ?? "Signed in"}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-56" side="top" align="end">
            <DropdownMenuLabel>My account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem><User className="size-4" /> Account</DropdownMenuItem>
            <DropdownMenuItem><Settings className="size-4" /> Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleLogout}><LogOut className="size-4" /> Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader><Brand /></SidebarHeader>
      <SidebarContent>
        <ScrollArea className="min-h-0 flex-1">
          {navigation.map((group) => (
            <SidebarGroup key={group.title}>
              <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => <NavigationItem key={item.href} item={item} />)}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter><UserMenu /></SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

export function ApplicationShell1({ className }: { className?: string }) {
  const location = useLocation()
  const [section, page] = pageNames[location.pathname] ?? ["Life Stack", "Dashboard"]

  return (
    <SidebarProvider className={cn("bg-muted/30", className)}>
      <AppSidebar />
      <SidebarInset className="overflow-hidden shadow-sm">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden sm:block"><span className="text-muted-foreground">{section}</span></BreadcrumbItem>
              <BreadcrumbSeparator className="hidden sm:block" />
              <BreadcrumbItem><BreadcrumbPage>{page}</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="min-w-0 flex-1 overflow-auto">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
