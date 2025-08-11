import { useCallback, useState } from "react";
import styles from "./Register.module.css";
import { createUser } from "../../../firebase/auth";
import { Link, Navigate } from "react-router";
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

export const Register = () => {
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const auth = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<{ email: string; password: string }>({
    resolver: joiResolver(validationsSchema),
    mode: "onBlur"
  });


  const handleRegister = useCallback(async (data: { email: string; password: string }) => {
    if (!isRegistering) {
      setIsRegistering(true);
      try {
        await createUser(data.email, data.password);
      } catch (error: any) {
        if (error.code === "auth/email-already-in-use") {
          setErrorMessage("Email is already in use");
          setTimeout(() => setErrorMessage(""), 2000);
        } else {
          setErrorMessage("Error creating user");
        }
        setTimeout(() => setErrorMessage(""), 2000);
        setIsRegistering(false);
      }
    }
  }, [isRegistering]);

  if (auth?.userLoggedIn) return <Navigate to="/" />;

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit(handleRegister)} className={styles.form}>
        <h1 className={styles.title}>Registrarse</h1>

        <input
          className={styles.textInput}
          {...register("email")}
          placeholder="Correo electrónico"
        />
        {errors.email && <span className={styles.error}>{errors.email.message}</span>}

        <input
          className={styles.textInput}
          type="password"
          {...register("password")}
          placeholder="Contraseña"
        />
        {errors.password && <span className={styles.error}>{errors.password.message}</span>}

        <button type="submit" className={styles.button}>
          {isRegistering ? "Registrando..." : "Registrarse"}
        </button>
        {errorMessage && <span className={styles.error}>{errorMessage}</span>}

        <div className={styles.register}>
          ¿Ya tienes una cuenta? <Link className={styles.link} to="/login">Iniciar Sesión</Link>
        </div>
      </form>
    </div>
  );
};