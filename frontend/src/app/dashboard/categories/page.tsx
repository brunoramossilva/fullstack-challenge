"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Icon,
  InputText,
  Paginator,
  Typography,
} from "@uigovpe/components";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { Category, PaginatedResponse } from "@/types";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const limit = 10;

  const router = useRouter();
  const { getUser } = useAuth();
  const currentUser = getUser();

  async function loadCategories() {
    const { data } = await api.get<PaginatedResponse<Category>>("/categories", {
      params: { page, limit, search: search || undefined },
    });
    setCategories(data.data);
    setTotal(data.total);
  }

  useEffect(() => {
    void loadCategories();
  }, [page, search]);

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;
    await api.delete(`/categories/${id}`);
    void loadCategories();
  }

  function handleSearch() {
    setPage(1);
    setSearch(searchInput);
  }
  function handleClear() {
    setSearchInput("");
    setSearch("");
    setPage(1);
  }

  return (
    <>
      <section className="mb-6">
        <Typography variant="h1" className="mb-2 dashboard-title">
          Categorias
        </Typography>
        <Typography variant="p" className="dashboard-subtitle">
          Gerencie as categorias cadastradas no sistema
        </Typography>
      </section>

      <div className="mb-4 flex justify-end">
        <Button
          label="Nova Categoria"
          onClick={() => router.push("/dashboard/categories/new")}
        />
      </div>

      <Card elevation="low">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1">
            <InputText
              label=""
              placeholder="Buscar por nome..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <div className="flex gap-2">
            <Button label="Buscar" onClick={handleSearch} />
            {search && <Button label="Limpar" onClick={handleClear} />}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b dashboard-border text-left">
                <th className="pb-3 font-semibold dashboard-text-secondary">
                  Nome
                </th>
                <th className="pb-3 font-semibold dashboard-text-secondary hidden sm:table-cell">
                  Dono
                </th>
                <th className="pb-3 font-semibold dashboard-text-secondary hidden md:table-cell">
                  Criado em
                </th>
                <th className="pb-3 font-semibold dashboard-text-secondary">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center dashboard-text-muted"
                  >
                    Nenhuma categoria encontrada.
                  </td>
                </tr>
              )}
              {categories.map((category) => (
                <tr
                  key={category.id}
                  className="border-b dashboard-border dashboard-row-hover"
                >
                  <td className="py-3 pr-4 font-medium dashboard-text-primary">
                    {category.name}
                  </td>
                  <td className="py-3 pr-4 hidden sm:table-cell dashboard-text-secondary">
                    {category.owner.name}
                  </td>
                  <td className="py-3 hidden md:table-cell dashboard-text-muted">
                    {new Date(category.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          router.push(
                            `/dashboard/categories/${category.id}/edit`,
                          )
                        }
                        className="cursor-pointer p-1 rounded hover:bg-gray-100 transition"
                        title="Editar"
                      >
                        <Icon icon="edit" />
                      </button>
                      {(currentUser?.id === category.ownerId ||
                        currentUser?.role === "ADMIN") && (
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="cursor-pointer p-1 rounded hover:bg-red-50 transition text-red-500"
                          title="Excluir"
                        >
                          <Icon icon="delete" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {total > limit && (
          <div className="mt-4 flex justify-center">
            <Paginator
              first={(page - 1) * limit}
              rows={limit}
              totalRecords={total}
              onPageChange={(e) => setPage(Math.floor(e.first / limit) + 1)}
            />
          </div>
        )}
      </Card>
    </>
  );
}
