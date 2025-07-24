import axios from "axios";
import Joi from "joi"
import { joiResolver } from "@hookform/resolvers/joi";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import styles from './EditColor.module.css';
import { useEffect, useState } from "react";

type Color = {
    _id: string;
    name: string;
}

const validationsSchema = Joi.object<Color>({
    name: Joi.string().min(2).max(100).required().messages({
        "string.empty": "Name is required ⚠️",
        "string.min": "Name must be at least 2 characters long ⚠️",
        "string.max": "Name must be at most 100 characters long ⚠️",
        "any.required": "Name is required ⚠️",
    })
})

const EditColor = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [successMessage, setSuccessMessage] = useState("");

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
            await axios.patch(`http://localhost:3000/api/colors/${id}`, {
                ...data,
            });
            setSuccessMessage("Color updated successfully!");
            setTimeout(() => { navigate('/colors'); }, 1000);
        } catch (error) {
            console.error("Error updating color:", error);
        }
    }

     return (
        <div className={styles.container}>
            {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
            <form onSubmit={handleSubmit(handleUpdate)} className={styles.form}>
              <h1>Edit Color</h1>
              <p>Please write your changes below:</p>
              <label>Name:</label>
              <input className={styles.input} {...register("name")} />
              {errors.name && <p className={styles.error}>{errors.name.message}</p>}
              <button type="submit" className={styles.saveButton}>Update Color</button>
            </form>
        </div>
    )
}

export default EditColor;