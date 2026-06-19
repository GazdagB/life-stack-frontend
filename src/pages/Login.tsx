import {LoginForm} from "../components/login-form"


const Login = () => {
  return (
    <div className="flex min-h-screen flex-col w-full items-center justify-center bg-background"> 
        <LoginForm className=" w-full max-w-3xl rounded-lg border" />
    </div>
  )
}

export default Login

