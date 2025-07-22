import { useCallback, useState } from "react";
import styles from "./Register.module.css";
import { createUser } from "../../../firebase/auth";
import { Link, Navigate } from "react-router";
import { useAuth } from "../../../contexts/authContext";

export const Register = () => {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const auth = useAuth();

  console.log(auth);

  const handleRegister = useCallback(async () => {
    if (!isRegistering) {
      setIsRegistering(true);
      await createUser(email, password);
    }
  }, [isRegistering, email, password]);

  if (auth?.userLoggedIn) return <Navigate to="/" />;

  return (
    <div className={styles.container}>
      <h1>Register</h1>
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
      <button onClick={handleRegister}>Register</button>
      <div>
        Already have a user? <Link to="/login">Login</Link>
      </div>
    </div>
  );
};