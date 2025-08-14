import axios from "axios";
import Joi from "joi"
import { joiResolver } from "@hookform/resolvers/joi";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import styles from './EditCategory.module.css';
import { useEffect, useState } from "react";
import { MdEdit } from "react-icons/md";
import { API_ENDPOINTS } from "../../../config/api";

type Category = {
    _id: string;
    name: string;
}

const validationsSchema = Joi.object<Category>({
    name: Joi.string().min(2).max(100).required().messages({
        "string.empty": "Name is required",
        "string.max": "Name must be at most 100 characters long",
        "any.required": "Name is required",
    })
})

const EditCategory = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<Category>({
        resolver: joiResolver(validationsSchema),
    });

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const response = await axios.get(API_ENDPOINTS.category(id!));
                const category = response.data.data;
                setValue("name", category.name);
            } catch (error) {
                console.error("Error fetching category:", error);
            }
        };
        fetchCategory();
    },
);

    const handleUpdate = async (data: Category) => {
        try {
            const processedData = {
                name: data.name
            }
            await axios.patch(API_ENDPOINTS.category(id!), {
                ...processedData,
            });
            setSuccessMessage("Category updated successfully!");
            setTimeout(() => { navigate('/categories'); }, 1000);
        } catch (error) {
            console.error("Error updating category:", error);
            if (axios.isAxiosError(error)) {
                console.error("Response data:", error.response?.data);
                console.error("Response status:", error.response?.status);
                setErrorMessage(error.response?.data?.message || "Category already exists! Please choose a different name.");
            } else {
                setErrorMessage("Unexpected error occurred");
            }
            setTimeout(() => setErrorMessage(""), 2000);
        }
    }

    const goBack = () => {
        navigate('/categories');
    }

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit(handleUpdate)} className={styles.form}>
                <h1 className={styles.title}><MdEdit className={styles.icon} />Editar Categoría</h1>
              <p className={styles.description}>Por favor escribe tus cambios a continuación:</p>
              <label className={styles.label}>Nombre:</label>
              <input className={styles.input} {...register("name")} />
              {errors.name && <p className={styles.error}>{errors.name.message}</p>}
            {successMessage && <p className={styles.success}>{successMessage}</p>}
            {errorMessage && <p className={styles.error}>{errorMessage}</p>}
            <div className={styles.buttonGroup}>
              <button type="submit" className={styles.button}>Actualizar Categoría</button>
              <button type="button" className={styles.button} onClick={goBack}>Volver</button>
            </div>
            </form>
        </div>
    )
}

export default EditCategory;