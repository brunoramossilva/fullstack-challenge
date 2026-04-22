"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Icon,
  InputText,
  Paginator,
  Tag,
  Typography,
  type IconName,
} from "@uigovpe/components";
import api, { resolveApiAssetUrl } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { PaginatedResponse, Product } from "@/types";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const limit = 10;

  const router = useRouter();
  const { getUser } = useAuth();
  const currentUser = getUser();

  async function loadProducts() {
    const { data } = await api.get<PaginatedResponse<Product>>("/products", {
      params: { page, limit, search: search || undefined },
    });
    setProducts(data.data);
    setTotal(data.total);
  }

  async function loadFavorites() {
    const { data } = await api.get<Product[]>("/products/favorites");
    setFavorites(new Set(data.map((p) => p.id)));
  }

  useEffect(() => {
    void loadProducts();
    void loadFavorites();
  }, [page, search]);

  async function handleFavorite(productId: string) {
    await api.post(`/products/${productId}/favorite`);
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  }

  async function handleDelete(productId: string) {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    await api.delete(`/products/${productId}`);
    void loadProducts();
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
          Produtos
        </Typography>
        <Typography variant="p" className="dashboard-subtitle">
          Gerencie os produtos cadastrados no sistema
        </Typography>
      </section>

      <div className="mb-4 flex justify-end">
        <Button
          label="Novo Produto"
          onClick={() => router.push("/dashboard/products/new")}
        />
      </div>

      <Card elevation="low">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1">
            <InputText
              label=""
              placeholder="Buscar por nome ou descrição..."
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
                  Produto
                </th>
                <th className="pb-3 font-semibold dashboard-text-secondary hidden sm:table-cell">
                  Categorias
                </th>
                <th className="pb-3 font-semibold dashboard-text-secondary hidden md:table-cell">
                  Dono
                </th>
                <th className="pb-3 font-semibold dashboard-text-secondary">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center dashboard-text-muted"
                  >
                    Nenhum produto encontrado.
                  </td>
                </tr>
              )}
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b dashboard-border dashboard-row-hover"
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      {product.imageUrl ? (
                        <img
                          src={resolveApiAssetUrl(product.imageUrl)}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg dashboard-avatar-fallback flex items-center justify-center">
                          <span className="material-icons dashboard-avatar-fallback-text text-base">
                            inventory_2
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium dashboard-text-primary">
                          {product.name}
                        </p>
                        {product.description && (
                          <p className="text-xs dashboard-text-muted line-clamp-1">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 hidden sm:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {product.categories.length === 0 && (
                        <span className="dashboard-text-muted text-xs">
                          Sem categoria
                        </span>
                      )}
                      {product.categories.map(({ category }) => (
                        <Tag key={category.id} value={category.name} />
                      ))}
                    </div>
                  </td>
                  <td className="py-3 pr-4 hidden md:table-cell dashboard-text-secondary">
                    {product.owner.name}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => void handleFavorite(product.id)}
                        className="p-1 rounded hover:bg-gray-100 transition"
                        title={
                          favorites.has(product.id)
                            ? "Remover favorito"
                            : "Favoritar"
                        }
                      >
                        <Icon
                          icon={
                            (favorites.has(product.id)
                              ? "favorite"
                              : "favorite_border") as IconName
                          }
                        />
                      </button>

                      <button
                        onClick={() =>
                          router.push(`/dashboard/products/${product.id}/edit`)
                        }
                        className="p-1 rounded hover:bg-gray-100 transition"
                        title="Editar"
                      >
                        <Icon icon={"edit" as IconName} />
                      </button>

                      {(currentUser?.id === product.ownerId ||
                        currentUser?.role === "ADMIN") && (
                        <button
                          onClick={() => void handleDelete(product.id)}
                          className="p-1 rounded hover:bg-red-50 transition text-red-500"
                          title="Excluir"
                        >
                          <Icon icon={"delete" as IconName} />
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
