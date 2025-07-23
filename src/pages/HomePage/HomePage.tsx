import styles from './HomePage.module.css';
import { Card } from './components/Card';
import { AuthProvider } from '../../contexts/authContext';

const Sections = [
    {
        title: 'Categories',
        link: "/categories"
    },
];

export const HomePage = () => {
    return (
        <AuthProvider>  
            <div className={styles.container}>
            <h1>Home Page</h1>
            <p>Welcome to the home page!</p>
            <p>From here you can navigate to different sections of the app.</p>
            <div className={styles.container}>
                {Sections.map((section) => (
                    <Card title={section.title} link={section.link}/>
                ))}
            </div>
        </div>
        </AuthProvider>
    );
};