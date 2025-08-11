import axios from "axios";
import Joi from "joi"
import { joiResolver } from "@hookform/resolvers/joi";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import styles from './EditColor.module.css';
import { useEffect, useState } from "react";
import { MdEdit } from "react-icons/md";

type Color = {
    _id: string;
    name: string;
}

const validationsSchema = Joi.object<Color>({
    name: Joi.string().min(2).max(100).required().messages({
        "string.empty": "Name is required",
        "string.min": "Name must be at least 2 characters long",
        "string.max": "Name must be at most 100 characters long",
        "any.required": "Name is required",
    })
})

const EditColor = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

      const {
            register,
            handleSubmit,
            formState: { errors },
            setValue,
        } = useForm<Color>({
            resolver: joiResolver(validationsSchema),
        });

          useEffect(() => {
        const fetchColor = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/colors/${id}`);
                const color = response.data.data;
                setValue("name", color.name);
            } catch (error) {
                console.error("Error fetching color:", error);
            }
        };
        fetchColor();
    },
);

        const handleUpdate = async (data: Color) => {
        try {
            const processedData = {
            
                name: data.name,
            }

            await axios.patch(`http://localhost:3000/api/colors/${id}`, {
                ...processedData,
            });
            setSuccessMessage("Color updated successfully!");
            setTimeout(() => { navigate('/colors'); }, 1000);
        } catch (error) {
            console.error("Error updating color:", error);
            if (axios.isAxiosError(error)) {
                console.error("Response data:", error.response?.data);
                console.error("Response status:", error.response?.status);
                setErrorMessage(error.response?.data?.message || "Color already exists! Please choose a different name.");
            } else {
                setErrorMessage("Unexpected error occurred");
            }
            setTimeout(() => setErrorMessage(""), 2000);
        }
    }

     const goBack = () => {
        navigate('/colors');
    }

     return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit(handleUpdate)} className={styles.form}>
              <h1 className={styles.title}><MdEdit className={styles.icon} />Editar Color</h1>
              <p className={styles.description}>Por favor escribe tus cambios a continuación:</p>
              <label className={styles.label}>Nombre:</label>
              <input className={styles.input} {...register("name")} />
              {errors.name && <p className={styles.error}>{errors.name.message}</p>}
            {successMessage && <p className={styles.success}>{successMessage}</p>}
            {errorMessage && <p className={styles.error}>{errorMessage}</p>}
            <div className={styles.buttonGroup}>
                <button type="submit" className={styles.button}>Actualizar Color</button>
                <button type="button" className={styles.button} onClick={goBack}>Volver</button>
            </div>
             
            </form>
        </div>
    )
}

export default EditColor;