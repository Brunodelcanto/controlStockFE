import axios from 'axios';
import { useEffect, useState } from 'react';
import styles from './Category.module.css';
import { HomeButton } from '../../components/HomeButton';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import { useNavigate } from 'react-router';

type Categories = {
    _id?: string;
    name: string;
    isActive?: boolean;
}

const validationsSchema = Joi.object<Categories>({
    name: Joi.string().min(2).max(100).required().messages({
        "string.empty": "Name is required ⚠️",
        "string.min": "Name must be at least 2 characters long ⚠️",
        "string.max": "Name must be at most 100 characters long ⚠️",
        "any.required": "Name is required ⚠️",
    })
})

const Category = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<Categories[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [successMessage, setSuccessMessage] = useState("");

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<Categories>({
        resolver: joiResolver(validationsSchema)
    })

    const fetchCategories = async () => {
        try {
            const response = await axios.get ("http://localhost:3000/api/categories");
            setCategories(response.data.data);
            console.log(response.data);
        } catch (err) {
            if (err instanceof Error) {
                setError(err);   
            } else {
                setError(new Error('An unexpected error occurred'));
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchCategories();
    }, []);

    const onSubmit = async (data: Categories) => {
        const sendData = {
            name: data.name
        }
        try {
            const response = await axios.post("http://localhost:3000/api/categories", sendData);
            setSuccessMessage("Category created successfully!");
            reset();
            setCategories(prev => [...prev, response.data.data]);
            console.log(response.data);
        } catch (error) {
            console.error("Error creating category:", error);
        }
    }

    const handleDeactivateCategory = async (id: string) => {
        try {
            await axios.patch(`http://localhost:3000/api/categories/${id}/deactivate`);
            const res = await axios.get("http://localhost:3000/api/categories");
            setCategories(res.data.data);
        } catch (error) {
            console.error(error);
        }
    }

    const handleActivateCategory = async (id: string) => {
        try {
            await axios.patch(`http://localhost:3000/api/categories/${id}/activate`);
            const res = await axios.get("http://localhost:3000/api/categories");
            setCategories(res.data.data);
        } catch (error) {
            console.error(error);
        }
    }

    const handleDeleteCategory = async (id: string) => {
        try {
            await axios.delete(`http://localhost:3000/api/categories/${id}`);
            const res = await axios.get("http://localhost:3000/api/categories");
            setCategories(res.data.data);
        } catch (error) {
            console.error(error);
        }
    }

    const goToEditCategory = (id: string) => {
        navigate(`/category-edit/${id}`)
    }

    return (
        <div>
            <h1>Categories Page</h1>
            <p>This is the categories page where you can view all product categories.</p>
            {loading && <p>Loading categories...</p>}
            {error && <p>{error.message}</p>}
            <div className={styles.formContainer}>
            {successMessage && <p className={styles.success}>{successMessage}</p>}
                <form onSubmit={handleSubmit(onSubmit)}>
                    <input type="text" {...register("name")} placeholder="Category Name" />
                    {errors.name && <span className={styles.error}>{errors.name.message}</span>}
                    <button type="submit">Create Category</button>
                </form>
            </div>
            <div className={styles.categoriesContainer}>
            {categories && (
                <ul className={styles.categoriesList}>
                {categories.map((item: Categories) => (
                    <li key={item._id} className={`${styles.categoryContainer} ${!item.isActive? styles.inactiveCategory : ''}`} onClick={() => goToEditCategory(item._id!)}>
                        <h2>{item.name}</h2>
                        <button onClick={(e) => {e.stopPropagation(); if (item.isActive) {handleDeactivateCategory(item._id!);} else {handleActivateCategory(item._id!);}}} className={styles.actDesButton}>
                        {item.isActive ? "Deactivate" : "Activate"} </button>
                        <button onClick={(e) => {e.stopPropagation(); handleDeleteCategory(item._id!);}} className={styles.deleteButton}>
                            Delete
                        </button>
                    </li>
                ))}
                </ul>
            )}
            </div>
            <HomeButton />
        </div>
    )
}

export default Category;