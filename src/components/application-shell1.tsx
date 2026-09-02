import * as React from "react"
import {
  CheckCircle2,
  Calculator,
  Bookmark,
  Bot,
  ChevronRight,
  ChevronsUpDown,
  CircleDollarSign,
  ClipboardList,
  Clapperboard,
  LayoutDashboard,
  Landmark,
  Download,
  ListTodo,
  LogOut,
  Repeat2,
  Search,
  Star,
  Sparkles,
  Settings2,
  TrendingUp,
  User,
  Building2,
  FileText,
  Users,
  Scale,
} from "lucide-react"
import { NavLink, Outlet, useLocation, useNavigate } from "react-router"
import { useTranslation } from "react-i18next"

import { ProfileAvatar } from "src/components/profile-avatar"
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
  labelKey: string
  href: string
  icon: IconType
  exact?: boolean
  children?: Array<{ labelKey: string; href: string; icon: IconType }>
}
const navigation: Array<{ title: string; items: NavItem[] }> = [
  {
    title: "nav.groups.home",
    items: [
      { labelKey: "nav.dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    title: "nav.groups.life",
    items: [
      {
        labelKey: "nav.tasks",
        href: "/todos",
        icon: ClipboardList,
        children: [
          { labelKey: "nav.allTasks", href: "/todos", icon: ListTodo },
          { labelKey: "nav.today", href: "/todos/today", icon: Sparkles },
          { labelKey: "nav.completed", href: "/todos/completed", icon: CheckCircle2 },
          { labelKey: "nav.aiTaskAssistant", href: "/todos/assistant", icon: Bot },
        ],
      },
      {
        labelKey: "nav.expenses",
        href: "/expenses",
        icon: CircleDollarSign,
        children: [
          { labelKey: "nav.allExpenses", href: "/expenses", icon: CircleDollarSign },
          { labelKey: "nav.recurring", href: "/expenses/recurring", icon: Repeat2 },
          { labelKey: "nav.coveragePlan", href: "/expenses/coverage", icon: Calculator },
          { labelKey: "nav.spendingOverview", href: "/expenses/overview", icon: TrendingUp },
          { labelKey: "nav.bankAccounts", href: "/expenses/bank-accounts", icon: Landmark },
          { labelKey: "nav.importInbox", href: "/expenses/import", icon: Download },
        ],
      },
      {
        labelKey: "nav.netWorth",
        href: "/net-worth",
        icon: Scale,
        exact: true,
      },
      {
        labelKey: "nav.movies",
        href: "/movies",
        icon: Clapperboard,
        children: [
          { labelKey: "nav.discover", href: "/movies", icon: Search },
          { labelKey: "nav.wantToWatch", href: "/movies/want-to-watch", icon: Bookmark },
          { labelKey: "nav.watchedRated", href: "/movies/watched", icon: Star },
          { labelKey: "nav.aiSuggestions", href: "/movies/suggestions", icon: Sparkles },
        ],
      },
      {
        labelKey: "nav.business",
        href: "/business",
        icon: Building2,
        children: [
          { labelKey: "nav.overview", href: "/business", icon: Landmark },
          { labelKey: "nav.clients", href: "/business/clients", icon: Users },
          { labelKey: "nav.invoices", href: "/business/invoices", icon: FileText },
        ],
      },
    ],
  },
  {
    title: "nav.groups.account",
    items: [
      { labelKey: "nav.profile", href: "/profile", icon: User, exact: true },
      { labelKey: "nav.settings", href: "/settings", icon: Settings2, exact: true },
    ],
  },
]

const pageNames: Record<string, [string, string, IconType]> = {
  "/dashboard": ["nav.groups.home", "nav.dashboard", LayoutDashboard],
  "/profile": ["account.myAccount", "nav.profile", User],
  "/settings": ["account.myAccount", "nav.settings", Settings2],
  "/todos": ["nav.tasks", "nav.allTasks", ListTodo],
  "/todos/today": ["nav.tasks", "nav.today", Sparkles],
  "/todos/completed": ["nav.tasks", "nav.completed", CheckCircle2],
  "/todos/assistant": ["nav.tasks", "nav.aiTaskAssistant", Bot],
  "/expenses": ["nav.expenses", "nav.allExpenses", CircleDollarSign],
  "/expenses/recurring": ["nav.expenses", "nav.recurring", Repeat2],
  "/expenses/coverage": ["nav.expenses", "nav.coveragePlan", Calculator],
  "/expenses/overview": ["nav.expenses", "nav.spendingOverview", TrendingUp],
  "/expenses/bank-accounts": ["nav.expenses", "nav.bankAccounts", Landmark],
  "/expenses/bank-accounts/callback": ["nav.expenses", "nav.bankAccounts", Landmark],
  "/expenses/import": ["nav.expenses", "nav.importInbox", Download],
  "/net-worth": ["nav.groups.life", "nav.netWorth", Scale],
  "/movies": ["nav.movies", "nav.discover", Search],
  "/movies/want-to-watch": ["nav.movies", "nav.wantToWatch", Bookmark],
  "/movies/watched": ["nav.movies", "nav.watchedRated", Star],
  "/movies/suggestions": ["nav.movies", "nav.aiSuggestions", Sparkles],
  "/business": ["nav.business", "nav.overview", Landmark],
  "/business/clients": ["nav.business", "nav.clients", Users],
  "/business/invoices": ["nav.business", "nav.invoices", FileText],
}

function Brand() {
  const { t } = useTranslation()
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" asChild>
          <NavLink to="/dashboard">
            <div className="flex size-9 items-center justify-center rounded-lg bg-foreground text-background">
              <Sparkles className="size-4" />
            </div>
            <div className="grid flex-1 text-left leading-tight">
              <span className="font-semibold tracking-tight">Life Stack</span>
              <span className="text-xs text-muted-foreground">{t("brand.subtitle")}</span>
            </div>
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

function NavigationItem({ item }: { item: NavItem }) {
  const { t } = useTranslation()
  const location = useLocation()
  const Icon = item.icon
  const hasChildren = Boolean(item.children?.length)
  const isSectionActive = item.exact ? location.pathname === item.href : location.pathname.startsWith(item.href)

  if (!hasChildren) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isSectionActive} tooltip={t(item.labelKey)} className="data-active:[&>svg]:text-primary">
          <NavLink to={item.href} end={item.exact}>
            <Icon className="size-4" />
            <span>{t(item.labelKey)}</span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <Collapsible asChild defaultOpen={isSectionActive} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton isActive={isSectionActive} tooltip={t(item.labelKey)} className="data-active:[&>svg]:text-primary">
            <Icon className="size-4" />
            <span>{t(item.labelKey)}</span>
            <ChevronRight className="ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.children?.map((child) => {
              const ChildIcon = child.icon
              const isActive = location.pathname === child.href || (
                child.href === "/todos/assistant" && location.pathname.startsWith("/todos/assistant/")
              )
              return (
                <SidebarMenuSubItem key={child.href}>
                  <SidebarMenuSubButton asChild isActive={isActive} className="data-active:bg-primary/10 data-active:font-medium data-active:text-primary">
                    <NavLink to={child.href} end>
                      <ChildIcon className="size-3.5" />
                      <span>{t(child.labelKey)}</span>
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
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const name = user?.display_name || user?.username || "User"

  function handleLogout() {
    void logout().finally(() => navigate("/login", { replace: true }))
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
              <ProfileAvatar user={user} className="size-8 rounded-lg" fallbackClassName="rounded-lg text-xs" />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{name}</span>
                <span className="truncate text-xs text-muted-foreground">{user?.email ?? t("account.signedIn")}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-56" side="top" align="end">
            <DropdownMenuLabel>{t("account.myAccount")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate("/profile")}><User className="size-4" /> {t("account.profile")}</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => navigate("/settings")}><Settings2 className="size-4" /> {t("account.settings")}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleLogout}><LogOut className="size-4" /> {t("account.logout")}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation()
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader className="border-b border-sidebar-border/70 p-3"><Brand /></SidebarHeader>
      <SidebarContent>
        <ScrollArea className="min-h-0 flex-1">
          {navigation.map((group) => (
            <SidebarGroup key={group.title} className="px-3 py-2">
              <SidebarGroupLabel className="px-2 text-[10px] font-bold uppercase tracking-[0.16em]">{t(group.title)}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => <NavigationItem key={item.href} item={item} />)}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border/70 p-3"><UserMenu /></SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

export function ApplicationShell1({ className }: { className?: string }) {
  const { t } = useTranslation()
  const location = useLocation()
  const dynamicPage = location.pathname.startsWith("/todos/assistant/")
    ? ["nav.tasks", "nav.aiTaskAssistant", Bot] as [string, string, IconType]
    : undefined
  const [sectionKey, pageKey, PageIcon] = pageNames[location.pathname] ?? dynamicPage ?? ["nav.groups.home", "nav.dashboard", LayoutDashboard]

  return (
    <SidebarProvider className={cn("bg-sidebar", className)}>
      <AppSidebar />
      <SidebarInset className="overflow-hidden border border-border/70 shadow-sm">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-card px-4 sm:h-16 sm:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden sm:block"><span className="text-muted-foreground">{t(sectionKey)}</span></BreadcrumbItem>
              <BreadcrumbSeparator className="hidden sm:block" />
              <BreadcrumbItem><BreadcrumbPage className="flex items-center gap-2 font-semibold"><PageIcon className="size-4 text-primary" />{t(pageKey)}</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="min-w-0 flex-1 overflow-auto">
          <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-6 p-4 sm:p-6 lg:p-8 xl:p-10">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
