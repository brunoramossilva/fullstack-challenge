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
import api from "@/lib/api";

const schema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
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
        const { data } = await api.get(`/products/${id}`);
        reset({
          name: data.name,
          description: data.description ?? "",
        });
      } catch {
        setError("Produto não encontrado.");
      } finally {
        setLoadingData(false);
      }
    }
    void loadProduct();
  }, [id, reset]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError("");
    try {
      await api.patch(`/products/${id}`, data);
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
