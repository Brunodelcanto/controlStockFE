import axios from 'axios';
import { useEffect, useState } from 'react';
import styles from './Category.module.css';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import { useNavigate } from 'react-router';
import { HiClipboard } from "react-icons/hi";
import { API_ENDPOINTS } from "../../config/api";

type Categories = {
    _id?: string;
    name: string;
    isActive?: boolean;
}

const validationsSchema = Joi.object<Categories>({
    name: Joi.string().min(2).max(100).required().messages({
        "string.empty": "Name is required",
        "string.min": "Name must be at least 2 characters long",
        "string.max": "Name must be at most 100 characters long",
        "any.required": "Name is required",
    })
})

const Category = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<Categories[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

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
            const response = await axios.get(API_ENDPOINTS.CATEGORIES);
            setCategories(response.data.data);
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
            const alreadyExists = categories.some(category => category.name.toLowerCase() === data.name.toLowerCase());
            if (alreadyExists) {
                setErrorMessage("Category already exists! Please choose a different name.");
                setTimeout(() => setErrorMessage(""), 2000);
                return;
            }
            const response = await axios.post(API_ENDPOINTS.CATEGORIES, sendData);
            setSuccessMessage("Category created successfully!");
            setTimeout(() => setSuccessMessage(""), 2000);
            reset();
            setCategories(prev => [...prev, response.data.data]);
        } catch (error) {
            console.error("Error creating category:", error);
        }
    }

    const handleDeactivateCategory = async (id: string) => {
        try {
            await axios.patch(API_ENDPOINTS.category(id) + '/deactivate');
            const res = await axios.get(API_ENDPOINTS.CATEGORIES);
            setCategories(res.data.data);
            setSuccessMessage("Category deactivated successfully!");
            setTimeout(() => setSuccessMessage(""), 2000);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 400) {
                setErrorMessage("Cannot deactivate category with active products!");
            } else {
                setErrorMessage("An unexpected error occurred");
            }
            setTimeout(() => setErrorMessage(""), 2000);
        }
    }

    const handleActivateCategory = async (id: string) => {
        try {
            await axios.patch(API_ENDPOINTS.category(id) + '/activate');
            const res = await axios.get(API_ENDPOINTS.CATEGORIES);
            setCategories(res.data.data);
        } catch (error) {
            console.error(error);
        }
    }

       const confirmDeleteCategory = (id: string) => {
      setCategoryToDelete(id);
      setShowDeletePopup(true);
    }

    const handleDeleteCategory = async (id: string) => {
        try {
            await axios.delete(API_ENDPOINTS.category(id));
            const res = await axios.get(API_ENDPOINTS.CATEGORIES);
            setCategories(res.data.data);
            setSuccessMessage("Category deleted successfully!");
            setTimeout(() => setSuccessMessage(""), 2000);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 400) {
                setErrorMessage("Cannot delete category with active products!");
            } else {
                setErrorMessage("An unexpected error occurred");
            }
           setTimeout(() => setErrorMessage(""), 2000);
        } finally {
            setShowDeletePopup(false);
            setCategoryToDelete(null);
            reset();
        }

    }

    const goToEditCategory = (id: string) => {
        navigate(`/category-edit/${id}`)
    }

     const goBack = () => {
        navigate('/products');
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}><HiClipboard className={styles.icon} />Página de Categorías</h1>
            <p className={styles.description}>Esta es la página de categorías donde puedes ver todas las categorías de productos.</p>
            {loading && <p>Cargando categorías...</p>}
            {error && <p>{error.message}</p>}
            <div className={styles.formContainer}>
            {successMessage && <p className={styles.success}>{successMessage}</p>}
            {errorMessage && <p className={styles.error}>{errorMessage}</p>}
                <form  className={styles.form} onSubmit={handleSubmit(onSubmit)}>
                    <input className={styles.input} type="text" {...register("name")} placeholder="Nombre de Categoría" />
                    {errors.name && <span className={styles.error}>{errors.name.message}</span>}
                    <div className={styles.buttonGroup}>
                    <button type="submit" className={styles.submitButton}>Crear Categoría</button>
                    <button className={styles.goBackButton} onClick={goBack}>Volver</button>
                    </div>
                </form>
            </div>
            <div className={styles.categoriesContainer}>
            {categories && (
                <ul className={styles.categoriesList}>
                {categories.map((item: Categories) => (
                    <li key={item._id} 
                        className={`${styles.categoryContainer} ${!item.isActive? styles.inactiveCategory : ''}`} 
                        onClick={() => {
                            if (!item.isActive) return;
                            goToEditCategory(item._id!);
                        }}
                        style={{ cursor: item.isActive ? 'pointer' : 'not-allowed' }}>
                        <h2 className={styles.categoryName}>{item.name}</h2>
                        <div className={styles.buttonGroup}>
                        <button onClick={(e) => {e.stopPropagation(); if (item.isActive) {handleDeactivateCategory(item._id!);} else {handleActivateCategory(item._id!);}}} className={styles.actDesButton}>
                        {item.isActive ? "Desactivar" : "Activar"} </button>
                        <button onClick={(e) => {e.stopPropagation(); confirmDeleteCategory(item._id!);}} className={styles.deleteButton}>
                            Eliminar
                        </button>
                        </div>
                    </li>
                ))}
                </ul>
            )}
            </div>
            {showDeletePopup && (
              <div className={styles.deletePopup}>
                <div className={styles.popup}>
                  <p>¿Estás seguro de que quieres eliminar esta categoría?</p>
                  <div className={styles.popupButtons}>
                    <button className={styles.confirmButton} onClick={() => handleDeleteCategory(categoryToDelete!)}>Sí</button>
                    <button className={styles.cancelButton} onClick={() => setShowDeletePopup(false)}>No</button>
                  </div>
                </div>
              </div>
            )}
        </div>
    )
}

export default Category;