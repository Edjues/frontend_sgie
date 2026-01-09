import { authClient } from "@/lib/auth-client";

export default function Login() {

    return <div>
        <button onClick={() => authClient.signIn.social({ provider: "github" })}>
        Probar Login
        </button>
        </div>;
}