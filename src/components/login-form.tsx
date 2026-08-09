import * as React from "react"
import { Eye, EyeOff, LoaderCircle } from "lucide-react"
import { useNavigate } from "react-router"
import { cn } from "src/lib/utils"
import { useAuth } from "src/lib/auth"
import { Button } from "src/components/ui/button"
import { Card, CardContent } from "src/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "src/components/ui/field"
import { Input } from "src/components/ui/input"

type FormErrors = {
  username?: string
  password?: string
  form?: string
}

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "/api"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate()
  const { establishSession } = useAuth()
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [errors, setErrors] = React.useState<FormErrors>({})

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const username = String(formData.get("username") ?? "").trim()
    const password = String(formData.get("password") ?? "")
    const nextErrors: FormErrors = {}

    if (!username) {
      nextErrors.username = "Enter your username."
    }

    if (!password) {
      nextErrors.password = "Enter your password."
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setErrors({})
    setIsSubmitting(true)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        credentials: "include",
        body: new URLSearchParams({ username, password }),
      })

      if (response.status === 401 || response.status === 403) {
        setErrors({ form: "The email or password you entered is incorrect." })
        return
      }

      if (!response.ok) {
        setErrors({ form: "We couldn't log you in right now. Please try again." })
        return
      }

      if (!(await establishSession())) {
        setErrors({ form: "Your session could not be started. Please try again." })
        return
      }

      navigate("/dashboard", { replace: true })
    } catch {
      setErrors({
        form: "We couldn't reach the server. Check your connection and try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6 w-full", className)} {...props}>
      <Card className="overflow-hidden flex justify-center shadow-xl h-full p-0 min-h-[30rem]">
        <CardContent className="flex-1 grid h-full p-0 md:grid-cols-2">
          <form
            className="p-6 h-full md:p-8 md:py-0 py-12 flex items-center justify-center"
            onSubmit={handleSubmit}
            noValidate
          >
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-balance text-muted-foreground">
                 Hi, there! Balázs login to your Life Stack OS.
                </p>
              </div>
              <Field data-invalid={Boolean(errors.username)}>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  autoComplete="username"
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.username)}
                  aria-describedby={errors.username ? "username-error" : undefined}
                  onChange={() => setErrors((current) => ({ ...current, username: undefined, form: undefined }))}
                  required
                />
                <FieldError id="username-error">{errors.username}</FieldError>
              </Field>
              <Field data-invalid={Boolean(errors.password)}>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={isPasswordVisible ? "text" : "password"}
                    className="pr-10"
                    autoComplete="current-password"
                    disabled={isSubmitting}
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? "password-error" : undefined}
                    onChange={() => setErrors((current) => ({ ...current, password: undefined, form: undefined }))}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setIsPasswordVisible((visible) => !visible)}
                    className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                    aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                    aria-pressed={isPasswordVisible}
                    disabled={isSubmitting}
                  >
                    {isPasswordVisible ? (
                      <EyeOff className="size-4" aria-hidden="true" />
                    ) : (
                      <Eye className="size-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
                <FieldError id="password-error">{errors.password}</FieldError>
              </Field>
              {errors.form && (
                <FieldError className="rounded-lg border border-destructive/30 bg-destructive/10 p-3">
                  {errors.form}
                </FieldError>
              )}
              <Field>
                <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
                  {isSubmitting && (
                    <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                  )}
                  {isSubmitting ? "Logging in…" : "Login"}
                </Button>
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
  )
}
