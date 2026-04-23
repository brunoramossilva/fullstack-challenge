"use client";

import {
  AdminSideBar,
  AdminUserBar,
  AppLayout,
  BreadCrumb,
  BreadcrumbProps,
  GovBar,
  Icon,
  MenuAction,
  type IconName,
} from "@uigovpe/components";
import api from "@/lib/api";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";

const pathLabels: Record<string, string> = {
  "/dashboard": "Visão Geral",
  "/dashboard/products": "Produtos",
  "/dashboard/categories": "Categorias",
  "/dashboard/users": "Usuários",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout, getUser } = useAuth();
  const pathname = usePathname();
  const currentUser = getUser();

  const allItems = [
    {
      id: "dashboard",
      label: "Visão Geral",
      icon: "dashboard" as IconName,
      link: "/dashboard",
    },
    {
      id: "products",
      label: "Produtos",
      icon: "inventory_2" as IconName,
      link: "/dashboard/products",
    },
    {
      id: "categories",
      label: "Categorias",
      icon: "category" as IconName,
      link: "/dashboard/categories",
    },
    // Only the admin can see these:
    ...(currentUser?.role === "ADMIN"
      ? [
          {
            id: "users",
            label: "Usuários",
            icon: "group" as IconName,
            link: "/dashboard/users",
          },
          {
            id: "audit",
            label: "Auditoria",
            icon: "history" as IconName,
            link: "/dashboard/audit",
          },
        ]
      : []),
  ];

  const sections = [{ id: "main", title: "Menu", items: allItems }];

  const breadcrumb: BreadcrumbProps = {
    home: {
      label: "Home",
      url: "/dashboard",
      template: (
        <Link href="/dashboard">
          <Icon icon="home" />
        </Link>
      ),
    },
    items:
      pathname !== "/dashboard" ? [{ label: pathLabels[pathname] ?? "" }] : [],
  };

  const userMenuActions: MenuAction = [
    {
      label: "Sair",
      icon: <Icon icon="logout" />,
      command: () => logout(),
    },
  ];

  const fallbackDisplayName =
    currentUser?.name?.trim() ||
    currentUser?.email?.split("@")[0]?.replace(/\./g, " ") ||
    "Usuário";
  const [displayName, setDisplayName] = useState(fallbackDisplayName);

  useEffect(() => {
    setDisplayName(fallbackDisplayName);
  }, [fallbackDisplayName]);

  useEffect(() => {
    async function loadCurrentUserName() {
      if (!currentUser?.id) return;

      try {
        const { data } = await api.get<{ name?: string }>(
          `/users/${currentUser.id}`,
        );
        if (data.name?.trim()) {
          setDisplayName(data.name.trim());
        }
      } catch {
        // Mantém o fallback quando não for possível carregar o perfil.
      }
    }

    void loadCurrentUserName();
  }, [currentUser?.id]);

  const user = {
    name: displayName,
    profile: currentUser?.role?.toLowerCase() ?? "user",
  };

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<
    { id: string; message: string; read: boolean; createdAt: string }[]
  >([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    async function loadNotifications() {
      const { data } =
        await api.get<
          { id: string; message: string; read: boolean; createdAt: string }[]
        >("/notifications");
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    }
    void loadNotifications();
  }, []);

  async function handleMarkAllRead() {
    await api.patch("/notifications/read-all");
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }

  return (
    <>
      <div className="fixed bottom-6 right-4 md:bottom-8 md:right-6 z-50">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative h-14 w-14 rounded-full bg-white border-2 border-gray-200 shadow-lg hover:shadow-xl hover:scale-105 transition flex items-center justify-center"
          title="Notificações"
          aria-label="Abrir notificações"
        >
          <span className="text-2xl leading-none">
            <Icon icon={"notifications" as IconName} />
          </span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-6 h-6 px-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
              {unreadCount}
            </span>
          )}
        </button>

        {showNotifications && (
          <div className="absolute bottom-16 right-0 w-80 max-w-[calc(100vw-2rem)] bg-white border border-gray-200 rounded-xl shadow-lg">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="font-semibold text-sm text-gray-700">
                Notificações
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={() => void handleMarkAllRead()}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6">
                  Nenhuma notificação
                </p>
              )}
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-gray-50 text-sm ${
                    n.read
                      ? "text-gray-400"
                      : "text-gray-700 font-medium bg-blue-50"
                  }`}
                >
                  <p>{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(n.createdAt).toLocaleString("pt-BR")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AppLayout>
        <GovBar
          showCookies={false}
          showThemeController={false}
          showFontSizeController={true}
        />
        <AppLayout.MainLayout>
          <AdminSideBar
            theme="primary"
            sections={sections}
            version="1.0.0"
            title="Product Manager"
          />
          <AppLayout.ContentSection>
            <AdminUserBar
              user={user}
              menuActions={userMenuActions}
              breadcrumb={breadcrumb}
            />
            <AppLayout.MainContent>
              <AppLayout.BreadCrumbSection>
                <BreadCrumb model={breadcrumb.items} home={breadcrumb.home} />
              </AppLayout.BreadCrumbSection>
              <AppLayout.PageContent>{children}</AppLayout.PageContent>
            </AppLayout.MainContent>
          </AppLayout.ContentSection>
        </AppLayout.MainLayout>
      </AppLayout>
    </>
  );
}
