import styles from './HomePage.module.css';
import { Card } from './components/Card';
import { AuthProvider } from '../../contexts/authContext';
import { auth } from '../../firebase/firebase';
import { FaHome } from "react-icons/fa";

const Sections = [

    {
        title: 'Products',
        link: "/products"
    },

];

export const HomePage = () => {
    return (
        <AuthProvider>  
            <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.logoContainer}>
                <img src="/src/pages/HomePage/public/logo.png" alt="Logo" className={styles.logo} />
                </div>
                <button className={styles.logoutButton} onClick={() => auth?.signOut()}>Logout</button>
            </header>
            <main className={styles.main}>
            <FaHome className={styles.homeIcon} />
            <p className={styles.welcomeMessage}>Welcome to the home page!</p>
            <p className={styles.description}>From here you can navigate to different sections of the app.</p>
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