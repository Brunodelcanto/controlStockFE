import axios from "axios";
import { useEffect, useState } from "react";
import styles from "./Products.module.css";
import { HomeButton } from "../../components/HomeButton";
import { useForm, useFieldArray } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";
import { useNavigate } from "react-router";
import { Card } from "../HomePage/components/Card";

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

const Sections = [
      {
        title: 'Colors',
        link: "/colors"
    },
    {
        title: 'Categories',
        link: "/categories"
    },
]

const Products = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Products[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [colors, setColors] = useState<Color[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [successMessage, setSuccessMessage] = useState("");

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<Products>({
        defaultValues: {
      variants: [{ color: "", amount: 0 }],
    },
        resolver: joiResolver(validationsSchema)
    })

     const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  const groupedProducts = products.reduce((acc, product) => {
  const categoryName =
    typeof product.category === "string"
      ? categories.find(cat => cat._id === product.category)?.name || "Sin categoría"
      : (product.category as Category)?.name || "Sin categoría";

  if (!acc[categoryName]) {
    acc[categoryName] = [];
  }
  acc[categoryName].push(product);
  return acc;
}, {} as Record<string, Products[]>);

    const fetchProducts = async () => {
    try {
        const response = await axios.get("http://localhost:3000/api/products");
        setProducts(response.data.data);
        console.log(response.data);
    } catch (err) {
        if (err instanceof Error) {
            setError(err);
        } else {
            setError(new Error("An unexpected error occurred"));
        }
    } finally {
        setLoading(false);
    }
}

 const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/categories");
      setCategories(response.data.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

   const fetchColors = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/colors");
      setColors(response.data.data);
    } catch (err) {
      console.error("Error fetching colors:", err);
    }
  };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchColors();
    }, []);

     const onSubmit = async (data: Products) => {
    try {
      const alreadyExists = products.some(
        (product) => product.name.toLowerCase() === data.name.toLowerCase()
      );
      if (alreadyExists) {
        setSuccessMessage("Product already exists! Please choose a different name.");
        return;
      }
        await axios.post("http://localhost:3000/api/products", data);
      setSuccessMessage("Product created successfully!");
      reset({ name: "", price: 0, category: "", variants: [{ color: "", amount: 0 }] });
      await fetchProducts();
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

        const handleDeactivateProduct = async (id: string) => {
        try {
            await axios.patch(`http://localhost:3000/api/products/${id}/deactivate`);
            const res = await axios.get("http://localhost:3000/api/products");
            setProducts(res.data.data);
        } catch (error) {
            console.error(error);
        }
    }

    const handleActivateProduct = async (id: string) => {
        try {
            await axios.patch(`http://localhost:3000/api/products/${id}/activate`);
            const res = await axios.get("http://localhost:3000/api/products");
            setProducts(res.data.data);
        } catch (error) {
            console.error(error);
        }
    }

    const handleDeleteProduct = async (id: string) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this product?");
        if (!confirmDelete) return;
        try {
            await axios.delete(`http://localhost:3000/api/products/${id}`);
            const res = await axios.get("http://localhost:3000/api/products");
            setProducts(res.data.data);
        } catch (error) {
            console.error(error);
        }
    }

    const handleReduceStock= async (id: string, colorId: string, amount: number = 1) => {
        try {
            await axios.patch(`http://localhost:3000/api/products/${id}/adjust-stock`, { 
              colorId,
              amount,
              action: "decrease" 
            });
            const res = await axios.get("http://localhost:3000/api/products");
            setProducts(res.data.data);
        } catch (error) {
            console.error(error);
        }
    }

     const handleIncreaseStock= async (id: string, colorId: string, amount: number = 1) => {
        try {
            await axios.patch(`http://localhost:3000/api/products/${id}/adjust-stock`, { 
              colorId,
              amount,
              action: "increase" 
            });
            const res = await axios.get("http://localhost:3000/api/products");
            setProducts(res.data.data);
        } catch (error) {
            console.error(error);
        }
    }

    const goToEditProduct = (id: string) => {
      navigate(`/product-edit/${id}`);
    }

       const searchProductByName = async (name: string) => {
          try {
              const response = await axios.get(`http://localhost:3000/api/products/search?name=${name}`);
              setProducts(response.data.data);
          } catch (error) {
              console.error("Error searching product:", error);
          }
        }

    return (
    <div className={styles.container}>
      <h1>Products</h1>
         <div className={styles.container}>
                {Sections.map((section) => (
                    <Card title={section.title} link={section.link}/>
                ))}
            </div>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <input type="text" placeholder="Name" {...register("name")} />
        {errors.name && <span className={styles.error}>{errors.name.message}</span>}

        <select {...register("category")}>
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.category && <span className={styles.error}>{errors.category.message}</span>}

        <input type="number" placeholder="Price" {...register("price")} />
        {errors.price && <span className={styles.error}>{errors.price.message}</span>}

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

        <button type="submit">Create Product</button>
      </form>

      {successMessage && <p className={styles.success}>{successMessage}</p>}
{loading ? (
  <p>Loading...</p>
) : error ? (
  <p>Error: {error.message}</p>
) : (
  <ul className={styles.productList}>
       <input
        type="text"
        placeholder="Search by product name"
        onChange={(e) => searchProductByName(e.target.value)}
        className={styles.searchInput}
      />
    {Object.keys(groupedProducts).map((categoryName) => (
      <li key={categoryName}>
        <h2>{categoryName}</h2>
        <ul>
          {groupedProducts[categoryName].map((product) => (
            <li key={product._id} onClick={(e) => { e.stopPropagation(); goToEditProduct(product._id!); }}>
              <h3>{product.name}</h3>
              <p>Price: ${product.price}</p>
              <ul>
                <span>Colors:</span>
                {product.variants.map((v, idx) => {
                  const colorName = colors.find((c) => c._id === v.color)?.name || v.color;
                  return (
                    <li key={idx}>
                      {colorName} - {v.amount} units
                      <button onClick={(e) => { e.stopPropagation(); handleIncreaseStock(product._id!, v.color); }}>+</button>
                      <button onClick={(e) => { e.stopPropagation(); handleReduceStock(product._id!, v.color); }}>-</button>
                    </li>
                  );
                })}
              </ul>
              <button onClick={(e) => {e.stopPropagation(); if (product.isActive) {handleDeactivateProduct(product._id!);} else {handleActivateProduct(product._id!);}}} className={styles.actDesButton}>
                {product.isActive ? "Deactivate" : "Activate"}
              </button>
              <button onClick={(e) => { e.stopPropagation(); handleDeleteProduct(product._id!); }}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      </li>
    ))}
  </ul>
)}
<HomeButton />
    </div>
  );
};

export default Products;
