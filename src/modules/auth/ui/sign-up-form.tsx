"use client";

import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import * as z from "zod";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { PasswordInput } from "@/components/ui/password-input";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  email: z.email("Invalid email address"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function SignUpForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      fullName: "",
      password: "",
    },
  });

  const { isSubmitting } = form.formState;
  const router = useRouter();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await authClient.signUp.email(
      {
        email: values.email,
        password: values.password,
        name: values.fullName,
      },
      {
        onError: (error) => {
          toast.error(
            error.error.message || "Something went wrong. Please try again."
          );
        },
        onSuccess: async () => {
          toast.success("Account created successfully!");

          // Fetch the current user to get their role
          const { data: session } = await authClient.getSession();

          if (session?.user) {
            const role = (session.user as any).role || "USER";

            if (role === "ADMIN") {
              router.push("/admin");
            } else {
              router.push("/");
            }
          } else {
            router.push("/");
          }
        },
      }
    );
  }

  return (
    <form className="p-6 md:p-8" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">LKC Timetable</h1>
          <p className="text-muted-foreground text-balance">
            Create an account to proceed further.
          </p>
        </div>
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                aria-invalid={fieldState.invalid}
                required
                {...field}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="fullName"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
              <Input
                id="fullName"
                type="text"
                aria-invalid={fieldState.invalid}
                required
                {...field}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <PasswordInput aria-invalid={fieldState.invalid} {...field} />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Field>
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Create Account"
            )}
          </Button>
        </Field>
        <FieldDescription className="text-center">
          Already have an account? <Link href="/sign-in">Sign In</Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}
