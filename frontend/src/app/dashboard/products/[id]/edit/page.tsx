"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import api, { resolveApiAssetUrl } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { Category, PaginatedResponse, Product } from "@/types";

const schema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { getUser } = useAuth();
  const currentUser = getUser();

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [error, setError] = useState("");

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    async function loadProduct() {
      try {
        const { data: product } = await api.get<Product>(`/products/${id}`);

        if (currentUser?.id !== product.ownerId) {
          setError("Você só pode editar seus próprios produtos.");
          return;
        }

        reset({
          name: product.name,
          description: product.description ?? "",
        });
        setExistingImageUrl(product.imageUrl ?? null);
        setSelectedCategoryIds(
          product.categories.map(({ category }) => category.id),
        );

        try {
          const { data: categoriesData } = await api.get<
            PaginatedResponse<Category>
          >("/categories", {
            params: { limit: 1000 },
          });
          setCategories(categoriesData.data);
        } catch {
          setError("Erro ao carregar categorias.");
        }
      } catch {
        setError("Produto não encontrado.");
      } finally {
        setLoadingData(false);
      }
    }
    void loadProduct();
  }, [currentUser?.id, id, reset]);

  function toggleCategory(categoryId: string) {
    setSelectedCategoryIds((current) =>
      current.includes(categoryId)
        ? current.filter((value) => value !== categoryId)
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

      await api.patch(`/products/${id}`, payload);

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        await api.post(`/upload/product/${id}/image`, formData);
      }

      router.push("/dashboard/products");
    } catch {
      setError("Erro ao atualizar produto.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="dashboard-text-muted">Carregando...</p>
      </div>
    );
  }

  return (
    <>
      <section className="mb-6">
        <Typography variant="h1" className="mb-2 dashboard-title">
          Editar Produto
        </Typography>
        <Typography variant="p" className="dashboard-subtitle">
          Atualize os dados do produto
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
              {existingImageUrl && (
                <div className="mb-3 flex items-center gap-3">
                  <img
                    src={resolveApiAssetUrl(existingImageUrl)}
                    alt="Imagem atual do produto"
                    className="h-20 w-20 rounded-xl object-cover"
                  />
                  <span className="text-xs dashboard-text-muted">
                    Imagem atual
                  </span>
                </div>
              )}
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
