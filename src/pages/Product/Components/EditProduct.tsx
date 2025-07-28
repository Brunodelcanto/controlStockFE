import axios from "axios";
import Joi from "joi"
import { joiResolver } from "@hookform/resolvers/joi";
import { useForm } from "react-hook-form";
import styles from './EditProduct.module.css';
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useFieldArray } from "react-hook-form";

type Category = {
    _id?: string;
    name: string;
}

 type Color = {
   _id: string;
  name: string;
 };

type Products = {
   _id?: string;
   category: string | Category;
   name: string;
   price: number;
   variants: {
       _id?: string; // Permitir _id opcional en variants
       color: string;
       amount: number;
   }[];
    isActive?: boolean;
};

const validationsSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Name is required ⚠️",
    "string.min": "Name must be at least 2 characters long ⚠️",
    "string.max": "Name must be at most 100 characters long ⚠️",
    "any.required": "Name is required ⚠️",
  }),
  price: Joi.number().min(0).required().messages({
    "number.base": "Price must be a number ⚠️",
    "number.min": "Price must be at least 0 ⚠️",
    "any.required": "Price is required ⚠️",
  }),
  category: Joi.string().required().messages({
    "string.empty": "Category is required ⚠️",
    "any.required": "Category is required ⚠️",
  }),
  variants: Joi.array().items(
    Joi.object({
      _id: Joi.string().optional(), // Permitir _id opcional
      color: Joi.string().required().messages({
        "string.empty": "Color is required ⚠️",
        "any.required": "Color is required ⚠️",
      }),
      amount: Joi.number().min(0).required().messages({
        "number.base": "Amount must be a number ⚠️",
        "number.min": "Amount must be at least 0 ⚠️",
        "any.required": "Amount is required ⚠️",
      }),
    })
  ).min(1).required().messages({
    "array.min": "At least one variant is required ⚠️",
    "any.required": "Variants are required ⚠️",
  })
})

const EditProduct = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [categories, setCategories] = useState<Category[]>([]);
    const [colors, setColors] = useState<Color[]>([]);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        setValue,
    } = useForm<Products>({
        resolver: joiResolver(validationsSchema),
    });

        const { fields, append, remove } = useFieldArray({
        control,
        name: "variants",
      });
      
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/products/${id}`);
                const product = response.data.data;
                setValue("name", product.name);
                setValue("price", product.price);
                setValue("category", product.category._id);
                setValue("variants", product.variants);
            } catch (error) {
                console.error("Error fetching product:", error);
            }
        };
        if (id) {
            fetchProduct();
        }
    }, [id, setValue]);

    const handleUpdate = async (data: Products) => {
        try {
            // Limpiar mensajes previos
            setSuccessMessage("");
            setErrorMessage("");
            
            // Convertir price a número y amounts de variants a números
            const processedData = {
                ...data,
                price: Number(data.price),
                variants: data.variants.map(variant => ({
                    ...variant,
                    amount: Number(variant.amount)
                }))
            };
            
            await axios.patch(`http://localhost:3000/api/products/${id}`, processedData);
            
            setSuccessMessage("Product updated successfully!");
            setTimeout(() => { navigate('/products'); }, 1000);
        } catch (error) {
            console.error("Error updating product:", error);
            if (axios.isAxiosError(error)) {
                console.error("Response data:", error.response?.data);
                console.error("Response status:", error.response?.status);
                setErrorMessage(error.response?.data?.message || "Error updating product");
            } else {
                setErrorMessage("Unexpected error occurred");
            }
            // Limpiar mensaje de error después de 5 segundos
            setTimeout(() => setErrorMessage(""), 5000);
        }
    }

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get("http://localhost:3000/api/categories");
                setCategories(response.data.data);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchColors = async () => {
            try {
                const response = await axios.get("http://localhost:3000/api/colors");
                setColors(response.data.data);
            } catch (error) {
                console.error("Error fetching colors:", error);
            }
        };
        fetchColors();
    }, []);

    const goBack = () => {
        navigate('/products');
    }

    return (
    <div className={styles.container}>
        <h1>Edit Product</h1>
        {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
        <form onSubmit={handleSubmit(handleUpdate)} className={styles.form}>
            <div className={styles.formGroup}>
                <label htmlFor="name">Name</label>
                <input
                    type="text"
                    id="name"
                    {...register("name")}
                />
                {errors.name && <p className={styles.error}>{errors.name.message}</p>}
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="price">Price</label>
                <input
                    type="number"
                    id="price"
                    {...register("price")}
                />
                {errors.price && <p className={styles.error}>{errors.price.message}</p>}
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="category">Category</label>
                  <select {...register("category")}>
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
                {errors.category && <p className={styles.error}>{errors.category.message}</p>}
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="variants">Variants</label>
                 {fields.map((field, index) => (
          <div key={field.id} className={styles.variantRow}>
            <select {...register(`variants.${index}.color` as const)}>
              <option value="">Select Color</option>
              {colors.map((color) => (
                <option key={color._id} value={color._id}>
                  {color.name}
                </option>
              ))}
            </select>
            {errors.variants?.[index]?.color && (
              <span className={styles.error}>{errors.variants[index].color.message}</span>
            )}
            <input
              type="number"
              placeholder="Amount"
              {...register(`variants.${index}.amount` as const)}
            />
            {errors.variants?.[index]?.amount && (<span className={styles.error}>{errors.variants[index].amount.message}</span>)}
            <button type="button" onClick={() => remove(index)}>
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={() => append({ color: "", amount: 0 })}>
          Add Variant
        </button>
      </div>
      <button type="submit" className={styles.submitButton}>
        Update Product
      </button>
    </form>
    <button onClick={goBack}>Go Back</button>
  </div>
)
}

export default EditProduct;