import { Link } from "react-router";
import styles from "./Card.module.css";

interface CardProps {
    title: string;
    link: string;
}

export const Card = (props: CardProps) => {
    const {title, link} = props;
    return (
        <Link className={styles.container} to={link}>
            {title}
        </Link>
    )
}