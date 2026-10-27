"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogoMark } from "@/app/_components/logo-mark";
import { login, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <div className="flex items-center justify-center gap-2.5">
            <LogoMark className="size-8 text-primary" />
            <h1 className="font-medium text-3xl tracking-tight">GrantDesk</h1>
          </div>
          <p className="text-muted-foreground text-sm">Eastbrook University · Office of Research</p>
        </div>
        <form action={formAction} className="space-y-3">
          <Input autoComplete="username" name="email" placeholder="you@eastbrook.edu" required type="email" />
          <Input autoComplete="current-password" name="password" placeholder="Password" required type="password" />
          {state.error ? (
            <p className="text-destructive text-sm" role="alert">
              {state.error}
            </p>
          ) : null}
          <Button className="w-full" disabled={pending} type="submit">
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <p className="text-center text-muted-foreground text-xs">
          Demo accounts: pi.protein@eastbrook.edu and pi.neuro@eastbrook.edu
        </p>
      </div>
    </main>
  );
}
