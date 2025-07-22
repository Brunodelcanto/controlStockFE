import { useCallback, useState } from "react";
import styles from "./Login.module.css";
import { signIn } from "../../../firebase/auth";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../../contexts/authContext";

export const Login = () => {
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
    const auth = useAuth();

    const handleLogin = useCallback(async () => {
        if (!isLoggingIn) {
            setIsLoggingIn(true);
            await signIn(email, password)
        }
    }, [password, email, isLoggingIn]);

    if (auth?.userLoggedIn) return <Navigate to="/" />;

 return (
    <div className={styles.container}>
      <h1>Login</h1>
      <input
        className={styles.textInput}
        onBlur={(e) => setEmail(e.target.value)}
        placeholder="email"
      />
      <input
        className={styles.textInput}
        onBlur={(e) => setPassword(e.target.value)}
        placeholder="password"
      />
      <button onClick={handleLogin}>Login</button>
      <div>
        Don't have a user? <Link to="/register">Register</Link>
      </div>
    </div>
  );
};