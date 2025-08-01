import axios from 'axios';
import { useEffect, useState } from 'react';
import styles from './Color.module.css';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import { useNavigate } from 'react-router';
import { IoIosColorPalette } from "react-icons/io";

type Color = {
    _id?: string;
    name: string;
    isActive?: boolean;
}

const validationsSchema = Joi.object<Color>({
    name: Joi.string().min(2).max(100).required().messages({
        "string.empty": "Name is required ⚠️",
        "string.min": "Name must be at least 2 characters long ⚠️",
        "string.max": "Name must be at most 100 characters long ⚠️",
        "any.required": "Name is required ⚠️",
    })
})

const Color = () => {
    const navigate = useNavigate();
    const [colors, setColors] = useState<Color[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

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
            const response = await axios.get ("http://localhost:3000/api/colors");
            setColors(response.data.data);
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
                const response = await axios.post("http://localhost:3000/api/colors", sendData);
                setSuccessMessage("Color created successfully!");
                setTimeout(() => {
                    setSuccessMessage("");
                    fetchColors();
                }, 2000);
                reset();
                setColors(prev => [...prev, response.data.data]);
                console.log(response.data);
            } catch (error) {
                console.error("Error creating color:", error);
            }
        }


    const handleDeactivateColor = async (id: string) => {
        try {
            await axios.patch(`http://localhost:3000/api/colors/${id}/deactivate`);
            const res = await axios.get("http://localhost:3000/api/colors");
            setColors(res.data.data);
        } catch (error) {
            console.error(error);
        }
    }

       const handleActivateColor = async (id: string) => {
        try {
            await axios.patch(`http://localhost:3000/api/colors/${id}/activate`);
            const res = await axios.get("http://localhost:3000/api/colors");
            setColors(res.data.data);
        } catch (error) {
            console.error(error);
        }
    }

      const handleDeleteColor = async (id: string) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this color?");
        if (!confirmDelete) return;
        try {
            await axios.delete(`http://localhost:3000/api/colors/${id}`);
            const res = await axios.get("http://localhost:3000/api/colors");
            setColors(res.data.data);
        } catch (error) {
            console.error(error);
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
            <h1 className={styles.title}><IoIosColorPalette className={styles.icon} />Colors Page</h1>
            <p className={styles.description}>This is the colors page where you can view all product colors.</p>
            {loading && <p>Loading colors...</p>}
            {error && <p>{error.message}</p>}
            <div className={styles.formContainer}>
            {successMessage && <p className={styles.success}>{successMessage}</p>}
            {errorMessage && <p className={styles.error}>{errorMessage}</p>}
                <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
                    <input className={styles.input} type="text" {...register("name")} placeholder="Color Name" />
                    {errors.name && <span className={styles.error}>{errors.name.message}</span>}
                    <div className={styles.buttonGroup}>
                    <button type="submit" className={styles.submitButton}>Create Color</button>
                     <button onClick={goBack}>Go Back</button>
                    </div>
                </form>
            </div>
            <div className={styles.colorsContainer}>
            {colors && (
                <ul className={styles.colorsList}>
                {colors.map((item: Color) => (
                    <li key={item._id} className={`${styles.colorContainer} ${!item.isActive? styles.inactiveColor : ''}`} onClick={() => goToEditColor(item._id!)}>
                        <h2>{item.name}</h2>
                        <button onClick={(e) => {e.stopPropagation(); if (item.isActive) {handleDeactivateColor(item._id!);} else {handleActivateColor(item._id!);}}} className={styles.actDesButton}>
                        {item.isActive ? "Deactivate" : "Activate"} </button>
                        <button onClick={(e) => {e.stopPropagation(); handleDeleteColor(item._id!);}} className={styles.deleteButton}>
                            Delete
                        </button>
                    </li>
                ))}
                </ul>
            )}
            </div>
        </div>
    )
}

export default Color;
