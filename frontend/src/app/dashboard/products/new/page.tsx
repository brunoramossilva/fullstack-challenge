"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  Card,
  FlexContainer,
  InputText,
  Typography,
} from "@uigovpe/components";
import api from "@/lib/api";
import type { Category, PaginatedResponse } from "@/types";

const schema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    async function loadCategories() {
      try {
        const { data } = await api.get<PaginatedResponse<Category>>(
          "/categories",
          {
            params: { limit: 1000 },
          },
        );
        setCategories(data.data);
      } catch {
        setError("Erro ao carregar categorias.");
      } finally {
        setLoadingCategories(false);
      }
    }

    void loadCategories();
  }, []);

  function toggleCategory(categoryId: string) {
    setSelectedCategoryIds((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId],
    );
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...data,
        categoryIds: selectedCategoryIds,
      };

      const { data: product } = await api.post<{ id: string }>(
        "/products",
        payload,
      );

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        await api.post(`/upload/product/${product.id}/image`, formData);
      }

      router.push("/dashboard/products");
    } catch {
      setError("Erro ao criar produto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="mb-6">
        <Typography variant="h1" className="mb-2 dashboard-title">
          Novo Produto
        </Typography>
        <Typography variant="p" className="dashboard-subtitle">
          Preencha os dados para cadastrar um novo produto
        </Typography>
      </section>

      <Card elevation="low">
        <form onSubmit={handleSubmit(onSubmit)}>
          <FlexContainer direction="col" gap="4" align="start">
            {error && (
              <div className="w-full bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}
            <div className="w-full max-w-lg">
              <Controller
                name="name"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <InputText
                    {...field}
                    label="Nome"
                    placeholder="Nome do produto"
                    invalid={!!errors.name}
                    supportText={errors.name?.message}
                  />
                )}
              />
            </div>
            <div className="w-full max-w-lg">
              <Controller
                name="description"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <InputText
                    {...field}
                    label="Descrição"
                    placeholder="Descrição do produto (opcional)"
                  />
                )}
              />
            </div>
            <div className="w-full max-w-lg">
              <label className="mb-2 block text-sm font-medium dashboard-text-secondary">
                Imagem do produto
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(event) =>
                  setImageFile(event.target.files?.[0] ?? null)
                }
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dashboard-text-primary file:mr-4 file:rounded-md file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white cursor-pointer"
              />
            </div>

            <div className="w-full max-w-lg">
              <p className="mb-2 text-sm font-medium dashboard-text-secondary">
                Categorias
              </p>
              {loadingCategories ? (
                <p className="text-sm dashboard-text-muted">
                  Carregando categorias...
                </p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {categories.map((category) => (
                    <label
                      key={category.id}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm dashboard-text-primary"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategoryIds.includes(category.id)}
                        onChange={() => toggleCategory(category.id)}
                      />
                      {category.name}
                    </label>
                  ))}
                  {categories.length === 0 && (
                    <p className="text-sm dashboard-text-muted">
                      Nenhuma categoria cadastrada.
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-2">
              <Button
                type="submit"
                label={loading ? "Salvando..." : "Salvar"}
                loading={loading}
              />
              <Button
                label="Cancelar"
                onClick={() => router.push("/dashboard/products")}
              />
            </div>
          </FlexContainer>
        </form>
      </Card>
    </>
  );
}
