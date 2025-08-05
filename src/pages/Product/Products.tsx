import axios from "axios";
import { useEffect, useState } from "react";
import styles from "./Products.module.css";
import { HomeButton } from "../../components/homeButton/HomeButton";
import { useForm, useFieldArray } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";
import { useNavigate } from "react-router";
import { Card } from "../HomePage/components/Card";
import { HiArchive } from "react-icons/hi";
import { FaSearch } from "react-icons/fa";

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
    const [errorMessage, setErrorMessage] = useState("");
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [productToDelete, setProductToDelete] = useState<string | null>(null);

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
      const colorIds = data.variants.map((v) => v.color);
      const duplicateColors = new Set(colorIds).size !== colorIds.length;

      if (duplicateColors) {
        setErrorMessage("Color variant must be unique! Please choose different colors.");
        setTimeout(() => setErrorMessage(""), 2000);
        return;
      }

    try {
      const alreadyExists = products.some(
        (product) => product.name.toLowerCase() === data.name.toLowerCase()
      );
      if (alreadyExists) {
        setErrorMessage("Product already exists! Please choose a different name.");
        setTimeout(() => setErrorMessage(""), 2000);
        return;
      }
        await axios.post("http://localhost:3000/api/products", data);
      setSuccessMessage("Product created successfully!");
      setTimeout(() => setSuccessMessage(""), 2000);
      reset({ name: "", price: 0, category: "", variants: [{ color: "", amount: 0 }] });
      fetchProducts();
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

    const confirmDeleteProduct = (id: string) => {
      setProductToDelete(id);
      setShowDeletePopup(true);
    }

    const handleDeleteProduct = async (id: string) => {
        try {
            await axios.delete(`http://localhost:3000/api/products/${id}`);
            const res = await axios.get("http://localhost:3000/api/products");
            setProducts(res.data.data);
        } catch (error) {
            console.error(error);
        } finally {
          setShowDeletePopup(false);
          setProductToDelete(null);
          setSuccessMessage("Product deleted successfully!");
            setTimeout(() => {
                setSuccessMessage("");
                fetchProducts();
            }, 2000);
            reset();
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
      <header className={styles.header}>
  <div className={styles.headerTop}>
    <h1 className={styles.title}>
      <HiArchive className={styles.icon} />
      Products
    </h1>
    <HomeButton />
  </div>

  <div className={styles.sections}>
    {Sections.map((section) => (
      <Card key={section.link} title={section.title} link={section.link} />
    ))}
  </div>
</header>

            
      <main className={styles.main}>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <input className={styles.input} type="text" placeholder="Name" {...register("name")} />
        {errors.name && <span className={styles.error}>{errors.name.message}</span>}

        <select className={styles.select} {...register("category")}>
          <option className={styles.option} value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.category && <span className={styles.error}>{errors.category.message}</span>}

        <input className={styles.input} type="number" placeholder="Price" {...register("price")} />
        {errors.price && <span className={styles.error}>{errors.price.message}</span>}

        {fields.map((field, index) => (
          <div key={field.id} className={styles.variantRow}>
            <select className={styles.select} {...register(`variants.${index}.color` as const)}>
              <option className={styles.option} value="">Select Color</option>
              {colors.map((color) => (
                <option className={styles.option} key={color._id} value={color._id}>
                  {color.name}
                </option>
              ))}
            </select>
            {errors.variants?.[index]?.color && (
              <span className={styles.error}>{errors.variants[index].color.message}</span>
            )}
            <input className={styles.input}
              type="number"
              placeholder="Amount"
              {...register(`variants.${index}.amount` as const)}
            />
            {errors.variants?.[index]?.amount && (<span className={styles.error}>{errors.variants[index].amount.message}</span>)}
            <button className={styles.removeButton} type="button" onClick={() => remove(index)}>
              Remove
            </button>
          </div>
        ))}
        <div className={styles.buttonGroup}>
        <button className={styles.addButton} type="button" onClick={() => append({ color: "", amount: 0 })}>
          Add Variant
        </button>

        <button className={styles.submitButton} type="submit">Create Product</button>
        </div>
      </form>
      <div className={styles.searchContainer}>
        <FaSearch className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search product"
          onChange={(e) => searchProductByName(e.target.value)}
          className={styles.searchInput}
        />
      </div>
      {successMessage && <p className={styles.success}>{successMessage}</p>}
      {errorMessage && <p className={styles.error}>{errorMessage}</p>}
{loading ? (
  <p>Loading...</p>
) : error ? (
  <p>Error: {error.message}</p>
) : (
  <ul className={styles.productList}>
    {Object.keys(groupedProducts).map((categoryName) => (
      <div className={styles.categoryItem} key={categoryName}>
        <h2 className={styles.categoryTitle}>{categoryName}</h2>
        <ul className={styles.categoryProducts}>
          {groupedProducts[categoryName].map((product) => (
            <li key={product._id} 
            onClick={(e) => { e.stopPropagation(); goToEditProduct(product._id!); }}
            className={`${styles.productCard} ${!product.isActive ? styles.inactive : ""}`}>
              <h3 className={styles.productTitle}>{product.name}</h3>
              <p className={styles.productPrice}>Price: ${product.price}</p>
              <ul className={styles.variantsList}>
                {product.variants.map((v, idx) => {
                  const colorName = colors.find((c) => c._id === v.color)?.name || v.color;
                  return (
                    <li key={idx} className={styles.variantItem}>
                      {colorName} - {v.amount} units
                      <div className={styles.buttons}>
                        <button className={styles.increaseButton} onClick={(e) => { e.stopPropagation(); handleIncreaseStock(product._id!, v.color); }}>+</button>
                        <button className={styles.reduceButton} onClick={(e) => { e.stopPropagation(); handleReduceStock(product._id!, v.color); }}>-</button>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <p className={styles.productTotal}>Total units: {product.variants.reduce((sum, v) => sum + v.amount, 0)}</p>
              <div className={styles.actionGroup}>
              <button onClick={(e) => {e.stopPropagation(); if (product.isActive) {handleDeactivateProduct(product._id!);} else {handleActivateProduct(product._id!);}}} className={styles.actDesButton}>
                {product.isActive ? "Deactivate" : "Activate"}
              </button>
                  <button className={styles.deleteButton} onClick={(e) => { e.stopPropagation(); confirmDeleteProduct(product._id!); }}>
                Delete
              </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    ))}
  </ul>
)}
      </main>
{showDeletePopup && (
  <div className={styles.deletePopup}>
    <div className={styles.popup}>
      <p>Are you sure you want to delete this product?</p>
      <div className={styles.popupButtons}>
        <button className={styles.confirmButton} onClick={() => handleDeleteProduct(productToDelete!)}>Yes</button>
        <button className={styles.cancelButton} onClick={() => setShowDeletePopup(false)}>No</button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default Products;
