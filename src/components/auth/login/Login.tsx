import { useCallback, useState } from "react";
import styles from "./Login.module.css";
import { signIn } from "../../../firebase/auth";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../../contexts/authContext";
import Joi from "joi";
import { joiResolver } from "@hookform/resolvers/joi";
import { useForm } from "react-hook-form";

const validationsSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required().messages({
    "string.empty": "Email is required",
    "string.email": "Invalid email format",
    "any.required": "Email is required"
  }),
  password: Joi.string().min(6).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters long",
    "any.required": "Password is required"
  })
});

export const Login = () => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const auth = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<{ email: string; password: string }>({
    resolver: joiResolver(validationsSchema),
    mode: "onBlur"
  });

  const handleLogin = useCallback(async (data: { email: string; password: string }) => {
    if (!isLoggingIn) {
      setIsLoggingIn(true);
      try {
        await signIn(data.email, data.password);
      } catch (error: any) {
        if (error.code === "auth/wrong-password") {
          setErrorMessage("Incorrect password");
          setTimeout(() => setErrorMessage(""), 2000);
        } else {
          setErrorMessage("Error signing in");
        }
        setTimeout(() => setErrorMessage(""), 2000);
        setIsLoggingIn(false);
      }
    }
  }, [isLoggingIn]);

  if (auth?.userLoggedIn) return <Navigate to="/" />;

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit(handleLogin)} className={styles.form}>
        <h1 className={styles.title}>Login</h1>

        <input
          className={styles.textInput}
          {...register("email")}
          placeholder="Email"
        />
        {errors.email && <span className={styles.error}>{errors.email.message}</span>}

        <input
          className={styles.textInput}
          type="password"
          {...register("password")}
          placeholder="Password"
        />
        {errors.password && <span className={styles.error}>{errors.password.message}</span>}

        <button type="submit" className={styles.button}>
          {isLoggingIn ? "Ingresando..." : "Login"}
        </button>
        {errorMessage && <span className={styles.error}>{errorMessage}</span>}

        <div className={styles.register}>
          ¿Don't have an account? <Link className={styles.link} to="/register">Register</Link>
        </div>
      </form>
    </div>
  );
};
