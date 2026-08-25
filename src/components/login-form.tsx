import type React from "react";
import { cn } from "src/lib/utils";
import { Button } from "src/components/ui/button";
import { Card, CardContent } from "src/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "src/components/ui/field";
import { Input } from "src/components/ui/input";

type LoginFormProps = {
  className?: string;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
};

export function LoginForm({
  className,
  onSubmit,
  ...props
}: LoginFormProps) {
  return (
    <div className={cn("flex flex-col gap-6 w-full", className)} {...props}>
      <Card className="overflow-hidden flex justify-center shadow-xl h-full p-0 min-h-[30rem]">
        <CardContent className="flex-1 grid h-full p-0 md:grid-cols-2">
          <form
            onSubmit={onSubmit}
            className="p-6 h-full md:p-8 md:py-0 py-12 flex items-center justify-center"
          >
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-balance text-muted-foreground">
                  Hi, there! Balázs login to your Life Stack OS.
                </p>
              </div>

              <Field>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="username"
                  required
                />
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                />
              </Field>

              <Field>
                <Button type="submit">Login</Button>
              </Field>
            </FieldGroup>
          </form>

          <div className="relative hidden bg-muted md:block h-full">
            <img
              src="/images/life-stack-os-login.jpg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover object-top dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}