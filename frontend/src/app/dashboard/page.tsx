"use client";

import { useEffect, useState } from "react";
import { Card, Icon, Typography } from "@uigovpe/components";
import type { IconName } from "@uigovpe/components";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

interface Stats {
  users: number;
  products: number;
  categories: number;
}

export default function DashboardPage() {
  const { getUser } = useAuth();
  const currentUser = getUser();
  const isAdmin = currentUser?.role === "ADMIN";

  const [stats, setStats] = useState<Stats>({
    users: 0,
    products: 0,
    categories: 0,
  });

  useEffect(() => {
    async function loadStats() {
      const [users, products, categories] = await Promise.all([
        api.get<{ total: number }>("/users?limit=1"),
        api.get<{ total: number }>("/products?limit=1"),
        api.get<{ total: number }>("/categories?limit=1"),
      ]);
      setStats({
        users: users.data.total,
        products: products.data.total,
        categories: categories.data.total,
      });
    }
    void loadStats();
  }, []);

  const cards: {
    label: string;
    value: number;
    icon: IconName;
    color: string;
  }[] = [
    {
      label: "Usuários",
      value: stats.users,
      icon: "group",
      color: "bg-blue-100 text-blue-700",
    },
    {
      label: "Produtos",
      value: stats.products,
      icon: "inventory_2",
      color: "bg-green-100 text-green-700",
    },
    {
      label: "Categorias",
      value: stats.categories,
      icon: "category",
      color: "bg-purple-100 text-purple-700",
    },
  ];

  const shortcuts: {
    label: string;
    description: string;
    href: string;
    icon: IconName;
    color: string;
  }[] = [
    {
      label: "Visão Geral",
      description: "Resumo e indicadores principais",
      href: "/dashboard",
      icon: "dashboard",
      color: "bg-slate-100 text-slate-700",
    },
    {
      label: "Produtos",
      description: "Listar, criar, editar e excluir produtos",
      href: "/dashboard/products",
      icon: "inventory_2",
      color: "bg-green-100 text-green-700",
    },
    {
      label: "Categorias",
      description: "Organizar produtos por categoria",
      href: "/dashboard/categories",
      icon: "category",
      color: "bg-amber-100 text-amber-700",
    },
    ...(isAdmin
      ? [
          {
            label: "Usuários",
            description: "Gerenciar contas e perfis",
            href: "/dashboard/users",
            icon: "group" as IconName,
            color: "bg-blue-100 text-blue-700",
          },
          {
            label: "Auditoria",
            description: "Rastrear ações e eventos do sistema",
            href: "/dashboard/audit",
            icon: "history" as IconName,
            color: "bg-rose-100 text-rose-700",
          },
        ]
      : []),
  ];

  const adminActions: {
    title: string;
    description: string;
    href: string;
    icon: IconName;
  }[] = [
    {
      title: "Criar usuário",
      description: "Cadastrar novos usuários ou administradores",
      href: "/dashboard/users/new",
      icon: "person_add",
    },
    {
      title: "Gerir produtos",
      description: "Editar e excluir qualquer produto do sistema",
      href: "/dashboard/products",
      icon: "inventory_2",
    },
    {
      title: "Gerir categorias",
      description: "Criar, atualizar e remover categorias",
      href: "/dashboard/categories",
      icon: "category",
    },
    {
      title: "Acompanhar auditoria",
      description: "Visualizar histórico completo de alterações",
      href: "/dashboard/audit",
      icon: "history",
    },
  ];

  return (
    <div className="space-y-10 pb-4">
      <section className="pb-1">
        <Typography variant="h1" className="mb-2 dashboard-title">
          {isAdmin ? "Painel Administrativo" : "Visão Geral"}
        </Typography>
        <Typography variant="p" className="dashboard-subtitle">
          {isAdmin
            ? "Central de administração com acesso completo aos recursos do sistema"
            : "Resumo do sistema e acessos rápidos"}
        </Typography>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Card key={card.label} elevation="low">
            <div className="flex items-center gap-4 p-2">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${card.color}`}
              >
                <Icon icon={card.icon} />
              </div>
              <div>
                <p className="text-sm dashboard-text-secondary">{card.label}</p>
                <p className="text-3xl font-bold dashboard-text-primary">
                  {card.value}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div aria-hidden="true" style={{ height: 36 }} />

      <section
        className="pt-2 pb-2"
        style={{ marginTop: 24, marginBottom: 24 }}
      >
        <div className="mb-6">
          <Typography variant="h2" className="dashboard-title">
            Acessos rápidos
          </Typography>
          <Typography variant="p" className="dashboard-subtitle">
            Atalhos das opções do menu lateral em uma visão centralizada
          </Typography>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {shortcuts.map((item) => (
            <Link key={item.href} href={item.href} className="block h-full">
              <Card elevation="low" className="h-full">
                <div className="p-4 flex items-start gap-3">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${item.color}`}
                  >
                    <Icon icon={item.icon} />
                  </div>
                  <div>
                    <p className="font-semibold dashboard-text-primary">
                      {item.label}
                    </p>
                    <p className="text-sm dashboard-text-secondary">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <div aria-hidden="true" style={{ height: 40 }} />

      {isAdmin && (
        <section className="pt-2" style={{ marginTop: 32 }}>
          <div style={{ paddingTop: 20 }}>
            <Card elevation="low">
              <div className="p-7 md:p-9">
                <div
                  className="mb-10 rounded-xl border border-red-200 bg-red-50 px-7 py-6"
                  style={{ padding: "28px 30px", marginBottom: 40 }}
                >
                  <p className="text-sm font-semibold leading-relaxed text-red-700">
                    Modo administrador ativo
                  </p>
                  <p
                    className="mt-3 text-sm leading-relaxed text-red-700/90"
                    style={{ marginTop: 12 }}
                  >
                    Você possui permissão total para criar, editar e excluir
                    usuários, categorias e produtos.
                  </p>
                </div>

                <div aria-hidden="true" style={{ height: 12 }} />

                <Typography
                  variant="h2"
                  className="mb-7 dashboard-title"
                  style={{ marginBottom: 28 }}
                >
                  Permissões administrativas
                </Typography>

                <div aria-hidden="true" style={{ height: 10 }} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {adminActions.map((action) => (
                    <div
                      key={action.title}
                      className="rounded-xl border border-slate-200 bg-white p-6"
                      style={{ padding: 24 }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center">
                          <Icon icon={action.icon} />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold dashboard-text-primary">
                            {action.title}
                          </p>
                          <p
                            className="text-sm leading-relaxed dashboard-text-secondary mb-5"
                            style={{ marginBottom: 20 }}
                          >
                            {action.description}
                          </p>
                          <Link
                            href={action.href}
                            className="inline-flex items-center rounded-md bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white! hover:bg-blue-700 transition"
                            style={{ padding: "14px 28px" }}
                          >
                            Acessar
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </section>
      )}
    </div>
  );
}
