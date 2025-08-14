
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  CLOUDINARY: {
    CLOUD_NAME: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dnvzut7gm'
  }
};

export const API_ENDPOINTS = {
  PRODUCTS: `${API_CONFIG.BASE_URL}/api/products`,
  CATEGORIES: `${API_CONFIG.BASE_URL}/api/categories`, 
  COLORS: `${API_CONFIG.BASE_URL}/api/colors`,
  UPLOAD: `${API_CONFIG.BASE_URL}/api/upload`,
  
  product: (id: string) => `${API_CONFIG.BASE_URL}/api/products/${id}`,
  productDeactivate: (id: string) => `${API_CONFIG.BASE_URL}/api/products/${id}/deactivate`,
  productActivate: (id: string) => `${API_CONFIG.BASE_URL}/api/products/${id}/activate`,
  productAdjustStock: (id: string) => `${API_CONFIG.BASE_URL}/api/products/${id}/adjust-stock`,
  productSearch: (name: string) => `${API_CONFIG.BASE_URL}/api/products/search?name=${name}`,
  
  color: (id: string) => `${API_CONFIG.BASE_URL}/api/colors/${id}`,
  category: (id: string) => `${API_CONFIG.BASE_URL}/api/categories/${id}`,
};

export default API_CONFIG;
