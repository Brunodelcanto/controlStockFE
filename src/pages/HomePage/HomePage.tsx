import styles from './HomePage.module.css';
import { Card } from './components/Card';
import { AuthProvider } from '../../contexts/authContext';
import { auth } from '../../firebase/firebase';
import { FaHome } from "react-icons/fa";

const Sections = [

    {
        title: 'Productos',
        link: "/products"
    },

];

export const HomePage = () => {
    return (
        <AuthProvider>  
            <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.logoContainer}>
                <img src="/src/public/logoChé.png" alt="Logo" className={styles.logo} />
                </div>
                <button className={styles.logoutButton} onClick={() => auth?.signOut()}>Cerrar Sesión</button>
            </header>
            <main className={styles.main}>
            <FaHome className={styles.homeIcon} />
            <p className={styles.welcomeMessage}>¡Bienvenido a la página de inicio!</p>
            <p className={styles.description}>Desde aquí puedes navegar a diferentes secciones de la aplicación.</p>
            <div className={styles.Sections}>
                {Sections.map((section) => (
                    <Card title={section.title} link={section.link}/>
                ))}
            </div>
            </main>
        </div>
        </AuthProvider>
    );
};