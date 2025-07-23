import axios from "axios";
import Joi from "joi"
import { joiResolver } from "@hookform/resolvers/joi";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import styles from './EditCategory.module.css';
import { useEffect, useState } from "react";

type Category = {
    _id: string;
    name: string;
}

const validationsSchema = Joi.object<Category>({
    name: Joi.string().min(2).max(100).required().messages({
        "string.empty": "Name is required ⚠️",
        "string.min": "Name must be at least 2 characters long ⚠️",
        "string.max": "Name must be at most 100 characters long ⚠️",
        "any.required": "Name is required ⚠️",
    })
})

const EditCategory = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [successMessage, setSuccessMessage] = useState("");
    
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
                const response = await axios.get(`http://localhost:3000/api/categories/${id}`);
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
            await axios.patch(`http://localhost:3000/api/categories/${id}`, {
                ...data,
            });
            setSuccessMessage("Category updated successfully!");
            setTimeout(() => { navigate('/categories'); }, 1000);
        } catch (error) {
            console.error("Error updating category:", error);
        }
    }

    return (
        <div className={styles.container}>
            {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
            <form onSubmit={handleSubmit(handleUpdate)} className={styles.form}>
              <h1>Edit Category</h1>
              <p>Please write your changes below:</p>
              <label>Name:</label>
              <input className={styles.input} {...register("name")} />
              {errors.name && <p className={styles.error}>{errors.name.message}</p>}
              <button type="submit" className={styles.saveButton}>Update Category</button>
            </form>
        </div>
    )
}

export default EditCategory;