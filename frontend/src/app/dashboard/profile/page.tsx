"use client";

import { useEffect, useRef, useState } from "react";
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
import api, { resolveApiAssetUrl } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

const schema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  email: z.string().email("E-mail inválido"),
});

const passwordSchema = z
  .object({
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z.string().min(6, "Confirme a senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  createdAt: string;
}

export default function ProfilePage() {
  const { getUser } = useAuth();
  const currentUser = getUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    async function loadProfile() {
      if (!currentUser?.id) return;
      const { data } = await api.get<UserProfile>(`/users/${currentUser.id}`);
      setProfile(data);
      reset({ name: data.name, email: data.email });
    }
    void loadProfile();
  }, [currentUser?.id, reset]);

  const onSubmit = async (data: FormData) => {
    if (!currentUser?.id) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const { data: updated } = await api.patch<UserProfile>(
        `/users/${currentUser.id}`,
        data,
      );
      setProfile(updated);
      setSuccess("Perfil atualizado com sucesso!");
    } catch {
      setError("Erro ao atualizar perfil.");
    } finally {
      setLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    if (!currentUser?.id) return;
    setPasswordLoading(true);
    setPasswordError("");
    setPasswordSuccess("");
    try {
      await api.patch(`/users/${currentUser.id}`, { password: data.password });
      setPasswordSuccess("Senha alterada com sucesso!");
      resetPassword();
    } catch {
      setPasswordError("Erro ao alterar senha.");
    } finally {
      setPasswordLoading(false);
    }
  };

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data: updated } = await api.post<UserProfile>(
        "/upload/user/avatar",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      setProfile(updated);
      setSuccess("Foto atualizada com sucesso!");
    } catch {
      setError("Erro ao fazer upload da foto.");
    } finally {
      setUploadLoading(false);
    }
  }

  return (
    <>
      <section className="mb-6">
        <Typography variant="h1" className="mb-2 dashboard-title">
          Meu Perfil
        </Typography>
        <Typography variant="p" className="dashboard-subtitle">
          Gerencie suas informações pessoais
        </Typography>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card de avatar */}
        <Card elevation="low">
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="relative">
              {profile?.avatar ? (
                <img
                  src={resolveApiAssetUrl(profile.avatar)}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center border-4 border-blue-200">
                  <span className="text-blue-600 font-bold text-3xl">
                    {profile?.name?.charAt(0).toUpperCase() ?? "?"}
                  </span>
                </div>
              )}
            </div>

            <div className="text-center">
              <p className="font-semibold dashboard-text-primary text-lg">
                {profile?.name}
              </p>
              <p className="text-sm dashboard-text-muted">{profile?.email}</p>
              <span
                className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  profile?.role === "ADMIN"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {profile?.role === "ADMIN" ? "Administrador" : "Usuário"}
              </span>
            </div>

            <div className="text-xs dashboard-text-muted text-center">
              <p>Membro desde</p>
              <p className="font-medium">
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString("pt-BR")
                  : "—"}
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />

            <Button
              label={uploadLoading ? "Enviando..." : "Alterar foto"}
              loading={uploadLoading}
              onClick={() => fileInputRef.current?.click()}
            />
          </div>
        </Card>

        {/* Card de dados + senha */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <Card elevation="low">
            <Typography variant="h2" className="mb-6 dashboard-title">
              Informações Pessoais
            </Typography>

            <form>
              <FlexContainer direction="col" gap="4" align="start">
                {success && (
                  <div className="w-full bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
                    {success}
                  </div>
                )}
                {error && (
                  <div className="w-full bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                    {error}
                  </div>
                )}

                <div className="w-full">
                  <Controller
                    name="name"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <InputText
                        {...field}
                        label="Nome"
                        placeholder="Seu nome completo"
                        invalid={!!errors.name}
                        supportText={errors.name?.message}
                      />
                    )}
                  />
                </div>

                <div className="w-full">
                  <Controller
                    name="email"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <InputText
                        {...field}
                        label="E-mail"
                        placeholder="seu@email.com"
                        invalid={!!errors.email}
                        supportText={errors.email?.message}
                      />
                    )}
                  />
                </div>

                <div className="w-full pt-2">
                  <Button
                    label={loading ? "Salvando..." : "Salvar alterações"}
                    loading={loading}
                    onClick={(e) => {
                      e.preventDefault();
                      void handleSubmit(onSubmit)();
                    }}
                  />
                </div>
              </FlexContainer>
            </form>
          </Card>

          <Card elevation="low">
            <Typography variant="h2" className="mb-6 dashboard-title">
              Alterar Senha
            </Typography>

            <form>
              <FlexContainer direction="col" gap="4" align="start">
                {passwordSuccess && (
                  <div className="w-full bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
                    {passwordSuccess}
                  </div>
                )}
                {passwordError && (
                  <div className="w-full bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                    {passwordError}
                  </div>
                )}

                <div className="w-full">
                  <Controller
                    name="password"
                    control={passwordControl}
                    defaultValue=""
                    render={({ field }) => (
                      <InputPassword
                        {...field}
                        label="Nova senha"
                        placeholder="Mínimo 6 caracteres"
                        invalid={!!passwordErrors.password}
                        supportText={passwordErrors.password?.message}
                      />
                    )}
                  />
                </div>

                <div className="w-full">
                  <Controller
                    name="confirmPassword"
                    control={passwordControl}
                    defaultValue=""
                    render={({ field }) => (
                      <InputPassword
                        {...field}
                        label="Confirmar nova senha"
                        placeholder="Repita a senha"
                        invalid={!!passwordErrors.confirmPassword}
                        supportText={passwordErrors.confirmPassword?.message}
                      />
                    )}
                  />
                </div>

                <div className="w-full pt-2">
                  <Button
                    label={passwordLoading ? "Salvando..." : "Alterar senha"}
                    loading={passwordLoading}
                    onClick={(e) => {
                      e.preventDefault();
                      void handlePasswordSubmit(onPasswordSubmit)();
                    }}
                  />
                </div>
              </FlexContainer>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}
