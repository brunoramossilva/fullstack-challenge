"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  Button,
  Card,
  Chip,
  InputText,
  Paginator,
  Typography,
} from "@uigovpe/components";
import api, { resolveApiAssetUrl } from "@/lib/api";
import type { PaginatedResponse, User } from "@/types";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const limit = 10;

  const router = useRouter();
  const { getUser } = useAuth();
  const currentUser = getUser();

  async function loadUsers() {
    const { data } = await api.get<PaginatedResponse<User>>("/users", {
      params: { page, limit, search: search || undefined },
    });
    setUsers(data.data);
    setTotal(data.total);
  }

  useEffect(() => {
    void loadUsers();
  }, [page, search]);

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
          Usuários
        </Typography>
        <Typography variant="p" className="dashboard-subtitle">
          Gerencie os usuários cadastrados no sistema
        </Typography>
      </section>

      {currentUser?.role === "ADMIN" && (
        <div className="mb-4 flex justify-end">
          <Button
            label="Novo Usuário"
            onClick={() => router.push("/dashboard/users/new")}
          />
        </div>
      )}

      <Card elevation="low">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1">
            <InputText
              label=""
              placeholder="Buscar por nome ou email..."
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
                  Usuário
                </th>
                <th className="pb-3 font-semibold dashboard-text-secondary hidden sm:table-cell">
                  Perfil
                </th>
                <th className="pb-3 font-semibold dashboard-text-secondary hidden md:table-cell">
                  Criado em
                </th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="py-8 text-center dashboard-text-muted"
                  >
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b dashboard-border dashboard-row-hover"
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img
                          src={resolveApiAssetUrl(user.avatar)}
                          alt={user.name}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full dashboard-avatar-fallback flex items-center justify-center">
                          <span className="dashboard-avatar-fallback-text font-semibold text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium dashboard-text-primary">
                          {user.name}
                        </p>
                        <p className="text-xs dashboard-text-muted">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 hidden sm:table-cell">
                    <Chip
                      label={user.role === "ADMIN" ? "Admin" : "Usuário"}
                      className={
                        user.role === "ADMIN"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-100 text-gray-600"
                      }
                    />
                  </td>
                  <td className="py-3 hidden md:table-cell dashboard-text-muted">
                    {new Date(user.createdAt).toLocaleDateString("pt-BR")}
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
