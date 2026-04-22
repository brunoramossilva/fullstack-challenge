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
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

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

  const user = {
    name: currentUser?.email ?? "Usuário",
    profile: currentUser?.role?.toLowerCase() ?? "user",
  };

  return (
    <AppLayout>
      <GovBar />
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
  );
}
