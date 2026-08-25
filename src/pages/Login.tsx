import type React from "react";
import { LoginForm } from "../components/login-form";
import { loginUser } from "../lib/utils";

const Login = () => {
  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  const response = await loginUser(username, password);
  localStorage.setItem("token", response.access_token);
};

  return (
    <div className="flex min-h-screen flex-col w-full items-center justify-center bg-background">
      <LoginForm
        onSubmit={handleLogin}
        className="w-full max-w-3xl rounded-lg border"
      />
    </div>
  );
};

export default Login;