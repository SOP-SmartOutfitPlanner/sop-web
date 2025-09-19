"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { EmailField, PasswordField, NameField } from "./form-fields";
import { SubmitButton } from "./submit-button";
import { loginSchema, registerSchema } from "@/lib/validations/auth";
import type {
  AuthFormType,
  LoginFormValues,
  RegisterFormValues,
} from "@/lib/types/auth";

interface AuthFormProps {
  type: AuthFormType;
}

export function AuthForm({ type }: AuthFormProps) {
  const { isLoading, handleLogin, handleRegister } = useAuth();

  const form = useForm<LoginFormValues | RegisterFormValues>({
    resolver: zodResolver(type === "login" ? loginSchema : registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormValues | RegisterFormValues) => {
    if (type === "login") {
      handleLogin(data as LoginFormValues);
    } else {
      handleRegister(data as RegisterFormValues);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">
          {type === "login" ? "Đăng nhập" : "Đăng ký"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {type === "register" && <NameField control={form.control} />}
            <EmailField control={form.control} />
            <PasswordField control={form.control} />
            <SubmitButton isLoading={isLoading} type={type} />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
