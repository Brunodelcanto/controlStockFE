import styles from './FallBack.module.css'

export const FallBack = () => {
    return (
        <div className={styles.fallbackContainer}>
            <p>Something went wrong (404)</p>
        </div>
    )
}