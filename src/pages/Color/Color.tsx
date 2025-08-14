import axios from 'axios';
import { useEffect, useState } from 'react';
import styles from './Color.module.css';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import { useNavigate } from 'react-router';
import { IoIosColorPalette } from "react-icons/io";
import { API_ENDPOINTS } from "../../config/api";

type Color = {
    _id?: string;
    name: string;
    isActive?: boolean;
}

const validationsSchema = Joi.object<Color>({
    name: Joi.string().min(2).max(100).required().messages({
        "string.empty": "Name is required",
        "string.min": "Name must be at least 2 characters long",
        "string.max": "Name must be at most 100 characters long",
        "any.required": "Name is required",
    })
})

const Color = () => {
    const navigate = useNavigate();
    const [colors, setColors] = useState<Color[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [colorToDelete, setColorToDelete] = useState<string | null>(null);

        const {
            register,
            handleSubmit,
            reset,
            formState: { errors },
        } = useForm<Color>({
            resolver: joiResolver(validationsSchema)
        })

          const fetchColors = async () => {
        try {
            const response = await axios.get(API_ENDPOINTS.COLORS);
            setColors(response.data.data);
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
        fetchColors();
    }, []);

    const onSubmit = async (data: Color) => {
            const sendData = {
                name: data.name
            }
            try {
                const alreadyExists = colors.some(color => color.name.toLowerCase() === data.name.toLowerCase());
                if (alreadyExists) {
                    setErrorMessage("Color already exists! Please choose a different name.");
                    setTimeout(() => setErrorMessage(""), 2000);
                    return;
                }
                const response = await axios.post(API_ENDPOINTS.COLORS, sendData);
                setSuccessMessage("Color created successfully!");
                setTimeout(() => {
                    setSuccessMessage("");
                    fetchColors();
                }, 2000);
                reset();
                setColors(prev => [...prev, response.data.data]);
            } catch (error) {
                console.error("Error creating color:", error);
            }
        }


    const handleDeactivateColor = async (id: string) => {
        try {
            await axios.patch(API_ENDPOINTS.color(id) + '/deactivate');
            const res = await axios.get(API_ENDPOINTS.COLORS);
            setColors(res.data.data);
            setSuccessMessage("Color deactivated successfully!");
            setTimeout(() => setSuccessMessage(""), 2000);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 400) {
                setErrorMessage("Cannot deactivate color with active products!");
            } else {
                setErrorMessage("An unexpected error occurred");
            }
            setTimeout(() => setErrorMessage(""), 2000);
        }
    }

       const handleActivateColor = async (id: string) => {
        try {
            await axios.patch(API_ENDPOINTS.color(id) + '/activate');
            const res = await axios.get(API_ENDPOINTS.COLORS);
            setColors(res.data.data);
        } catch (error) {
            console.error(error);
        }
    }

        const confirmDeleteColor = (id: string) => {
      setColorToDelete(id);
      setShowDeletePopup(true);
    }

      const handleDeleteColor = async (id: string) => {
        try {
            await axios.delete(API_ENDPOINTS.color(id));
            const res = await axios.get(API_ENDPOINTS.COLORS);
            setColors(res.data.data);
            setSuccessMessage("Color deleted successfully!");
            setTimeout(() => setSuccessMessage(""), 2000);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 400) {
                setErrorMessage("Cannot delete color with active products!");
            } else {
                setErrorMessage("An unexpected error occurred");
            }
           setTimeout(() => setErrorMessage(""), 2000);
        } finally {
            setShowDeletePopup(false);
            setColorToDelete(null);
            reset();
        }

    }

     const goToEditColor = (id: string) => {
        navigate(`/color-edit/${id}`)
    }

     const goBack = () => {
        navigate('/products');
    }

        return (
        <div className={styles.container}>
            <h1 className={styles.title}><IoIosColorPalette className={styles.icon} />Página de Colores</h1>
            <p className={styles.description}>Esta es la página de colores donde puedes ver todos los colores de productos.</p>
            {loading && <p>Cargando colores...</p>}
            {error && <p>{error.message}</p>}
            <div className={styles.formContainer}>
            {successMessage && <p className={styles.success}>{successMessage}</p>}
            {errorMessage && <p className={styles.error}>{errorMessage}</p>}
                <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
                    <input className={styles.input} type="text" {...register("name")} placeholder="Nombre del Color" />
                    {errors.name && <span className={styles.error}>{errors.name.message}</span>}
                    <div className={styles.buttonGroup}>
                    <button type="submit" className={styles.submitButton}>Crear Color</button>
                     <button className={styles.goBackButton} onClick={goBack}>Volver</button>
                    </div>
                </form>
            </div>
            <div className={styles.colorsContainer}>
            {colors && (
                <ul className={styles.colorsList}>
                {colors.map((item: Color) => (
                    <li key={item._id} 
                        className={`${styles.colorContainer} ${!item.isActive? styles.inactiveColor : ''}`} 
                        onClick={() => {
                            if (!item.isActive) return;
                            goToEditColor(item._id!);
                        }}
                        style={{ cursor: item.isActive ? 'pointer' : 'not-allowed' }}>
                        <h2 className={styles.colorName}>{item.name}</h2>
                        <div className={styles.buttonGroup}>
                        <button onClick={(e) => {e.stopPropagation(); if (item.isActive) {handleDeactivateColor(item._id!);} else {handleActivateColor(item._id!);}}} className={styles.actDesButton}>
                        {item.isActive ? "Desactivar" : "Activar"} </button>
                        <button onClick={(e) => {e.stopPropagation(); confirmDeleteColor(item._id!);}} className={styles.deleteButton}>
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
                  <p>¿Estás seguro de que quieres eliminar este color?</p>
                  <div className={styles.popupButtons}>
                    <button className={styles.confirmButton} onClick={() => handleDeleteColor(colorToDelete!)}>Sí</button>
                    <button className={styles.cancelButton} onClick={() => setShowDeletePopup(false)}>No</button>
                  </div>
                </div>
              </div>
            )}
        </div>
    )
}

export default Color;
