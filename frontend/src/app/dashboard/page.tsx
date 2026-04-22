"use client";

import { useEffect, useState } from "react";
import { Card, Icon, Typography } from "@uigovpe/components";
import type { IconName } from "@uigovpe/components";
import api from "@/lib/api";

interface Stats {
  users: number;
  products: number;
  categories: number;
}

export default function DashboardPage() {
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

  return (
    <>
      <section className="mb-6">
        <Typography variant="h1" className="mb-2 dashboard-title">
          Visão Geral
        </Typography>
        <Typography variant="p" className="dashboard-subtitle">
          Resumo do sistema
        </Typography>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
    </>
  );
}
