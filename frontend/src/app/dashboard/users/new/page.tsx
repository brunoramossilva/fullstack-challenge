"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  Card,
  FlexContainer,
  InputText,
  InputPassword,
  Typography,
  Dropdown,
} from "@uigovpe/components";
import api from "@/lib/api";

const schema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  role: z.enum(["USER", "ADMIN"]),
});

type FormData = z.infer<typeof schema>;

export default function NewUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "USER" },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError("");
    try {
      await api.post("/users", data);
      router.push("/dashboard/users");
    } catch {
      setError("Erro ao criar usuário. Verifique os dados e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { label: "Usuário", value: "USER" },
    { label: "Administrador", value: "ADMIN" },
  ];

  return (
    <>
      <section className="mb-6">
        <Typography variant="h1" className="mb-2 dashboard-title">
          Novo Usuário
        </Typography>
        <Typography variant="p" className="dashboard-subtitle">
          Preencha os dados para cadastrar um novo usuário
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
                    placeholder="Nome completo"
                    invalid={!!errors.name}
                    supportText={errors.name?.message}
                  />
                )}
              />
            </div>

            <div className="w-full max-w-lg">
              <Controller
                name="email"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <InputText
                    {...field}
                    label="E-mail"
                    placeholder="email@exemplo.com"
                    invalid={!!errors.email}
                    supportText={errors.email?.message}
                  />
                )}
              />
            </div>

            <div className="w-full max-w-lg">
              <Controller
                name="password"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <InputPassword
                    {...field}
                    label="Senha"
                    placeholder="Mínimo 6 caracteres"
                    invalid={!!errors.password}
                    supportText={errors.password?.message}
                  />
                )}
              />
            </div>

            <div className="w-full max-w-lg">
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Dropdown
                    {...field}
                    label="Perfil"
                    options={roleOptions}
                    optionLabel="label"
                    optionValue="value"
                    invalid={!!errors.role}
                    supportText={errors.role?.message}
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
                onClick={() => router.push("/dashboard/users")}
              />
            </div>
          </FlexContainer>
        </form>
      </Card>
    </>
  );
}
