"use client";

import { useState } from "react";
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
} from "@uigovpe/components";
import { useAuth } from "@/hooks/useAuth";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido").min(1, "E-mail é obrigatório"),
  password: z
    .string()
    .min(6, "A senha deve ter no mínimo 6 caracteres")
    .max(20, "A senha pode ter no máximo 20 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError("");
    setLoading(true);
    try {
      await login({ email: data.email, password: data.password });
    } catch {
      setError("Email ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 mb-4">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"
              />
            </svg>
          </div>
          <Typography variant="h1">Product Manager</Typography>
          <Typography variant="p">
            Entre com sua conta para continuar
          </Typography>
        </div>

        <Card title="Login">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSubmit(onSubmit)(e);
            }}
          >
            <FlexContainer
              direction="col"
              gap="4"
              justify="center"
              align="start"
            >
              {error && (
                <div className="w-full bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                  {error}
                </div>
              )}

              <div className="w-full">
                <Controller
                  name="email"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <InputText
                      {...field}
                      label="Email"
                      placeholder="seu@email.com"
                      invalid={!!errors.email}
                      supportText={errors.email?.message}
                    />
                  )}
                />
              </div>

              <div className="w-full">
                <Controller
                  name="password"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <InputPassword
                      {...field}
                      label="Senha"
                      placeholder="Digite sua senha"
                      invalid={!!errors.password}
                      supportText={errors.password?.message}
                    />
                  )}
                />
              </div>

              <Button
                type="submit"
                label={loading ? "Entrando..." : "Entrar"}
                className="w-full"
                loading={loading}
              />
            </FlexContainer>
          </form>
        </Card>
      </div>
    </main>
  );
}
