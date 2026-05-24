'use client'
import axios from 'axios'
import React, { createContext, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import siteConfig from '@/lib/siteConfig'

export const Context = createContext()

const ContextProvider = ({ children, initialSiteData }) => {
  // siteData is the manual store config — edit src/lib/siteConfig.js to change values
  const [siteData, setSiteData] = useState(initialSiteData ?? siteConfig)

  const [isCategoryBox, setIsCategoryBox] = useState(false)
  const [editCategory, setEditCategory] = useState(null)
  const [isBrandBox, setIsBrandBox] = useState(false)
  const [editBrand, setEditBrand] = useState(null)
  const [isSupplierBox, setIsSupplierBox] = useState(false)
  const [isCustomerBox, setIsCustomerBox] = useState(false)
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [hydrated, setHydrated] = useState(false)
  const [cart, setCart] = useState({ items: [] })
  const [userData, setUserData] = useState([])
  const [isDashboardSidebar, setIsDashboardSidebar]=useState(false)

  const fetchCart = () => {
    if (typeof window === 'undefined') return
    const storedCart = localStorage.getItem('nvs')

    if (!storedCart || storedCart === 'undefined') {
      setCart({ items: [] })
      setHydrated(true)
      return
    }

    try {
      const parsed = JSON.parse(storedCart)
      if (parsed && Array.isArray(parsed.items)) {
        setCart(parsed)
      } else {
        setCart({ items: [] })
      }
    } catch (err) {
      localStorage.removeItem('nvs')
      setCart({ items: [] })
    }
    setHydrated(true)
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && hydrated) {
      localStorage.setItem('nvs', JSON.stringify(cart))
    }
  }, [cart, hydrated])

  const addToCart = (product, variant = null) => {
    if (!product?.product_id) return;

    // Block if product has variants but none selected
    const productHasVariants = product?.variants && product.variants.length > 0;
    if (productHasVariants && !variant) {
      toast.error("Please select a variant first!");
      return;
    }

    const stock = variant ? Number(variant.stock) : Number(product.stock);
    // variant.price is a ±delta from product.sale_price
    const basePrice = parseFloat(product.sale_price) || 0;
    const salePrice = variant
      ? basePrice + (parseFloat(variant.price) || 0)
      : basePrice;
    // Unique cart key: product alone, or product+variant combo
    const cartItemId = variant
      ? `${product.product_id}-v${variant.variant_id}`
      : String(product.product_id);

    if (stock <= 0) {
      toast.error("Item is out of stock!");
      return;
    }

    const existingInCart = cart.items.find(item => String(item.cartItemId) === cartItemId);

    if (existingInCart) {
      if (existingInCart.quantity >= stock) {
        toast.error(`Only ${stock} items available in stock`);
        return;
      }

      setCart((prev) => ({
        ...prev,
        items: prev.items.map(item =>
          String(item.cartItemId) === cartItemId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }));
      toast("Quantity increased", { icon: '➕' });
    } else {
      const wholeSalePrice = parseFloat(product?.wholesale_price) || 0;
      const discountAmount = parseFloat(product?.discount_price) || 0;

      const safeQty = 1;
      setCart((prev) => ({
        ...prev,
        items: [
          ...prev.items,
          {
            cartItemId,
            product_id: product.product_id,
            variant_id: variant?.variant_id || null,
            variant_name: variant?.variant_name || null,
            name: product.name,
            image: product.image,
            quantity: safeQty,
            stock: stock,
            sale_price: salePrice,
            wholesale_price: wholeSalePrice,
            discount_price: discountAmount,  // apply discount for both variant and non-variant items
            price: salePrice - discountAmount
          }
        ]
      }));
      toast.success("Added to cart");
    }
  };

  const increaseQuantity = (cartItemId) => {
    const id = String(cartItemId);
    setCart((prev) => {
      const item = prev.items.find(i => String(i.cartItemId) === id);
      if (!item) return prev;

      if (item.quantity >= item.stock) {
        toast.error(`Only ${item.stock} items available in stock`);
        return prev;
      }

      return {
        ...prev,
        items: prev.items.map(i =>
          String(i.cartItemId) === id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      };
    });
  };

  const removeFromCart = (cartItemId) => {
    const id = String(cartItemId);
    setCart(prev => ({ ...prev, items: prev.items.filter(item => String(item.cartItemId) !== id) }))
  }

  const decreaseQuantity = (cartItemId) => {
    const id = String(cartItemId);
    setCart((prev) => {
      const existing = prev.items.find(item => String(item.cartItemId) === id)
      if (!existing) return prev
      if (existing.quantity > 1) {
        return {
          ...prev,
          items: prev.items.map(item =>
            String(item.cartItemId) === id ? { ...item, quantity: item.quantity - 1 } : item
          )
        }
      }
      return { ...prev, items: prev.items.filter(item => String(item.cartItemId) !== id) }
    })
  }

  const clearCart = () => {
    setCart({ items: [] });
    if (typeof window !== 'undefined') localStorage.removeItem('cart');
    toast.success("Cart cleared"); // Keep this outside of any logic blocks
  };

  const fetchCategory = async () => {
    try {
      const response = await axios.get('/api/category', { withCredentials: true })
      setCategories(response.data.payload || [])
    } catch (error) { setCategories([]) }
  }

  const fetchBrand = async () => {
    try {
      const response = await axios.get('/api/brand', { withCredentials: true })
      setBrands(response.data.payload || [])
    } catch (error) { setBrands([]) }
  }


  const fetchSupplier = async () => {
    try {
      const response = await axios.get('/api/supplier', { withCredentials: true })
      setSuppliers(response.data.payload || [])
    } catch (error) { setSuppliers([]) }
  }
  const [customers, setCustomers] = useState([])
  const fetchCustomer = async () => {
    try {
      const response = await axios.get('/api/customer', { withCredentials: true })
      setCustomers(response.data.payload || [])
    } catch (error) { setCustomers([]) }
  }

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('/api/user/islogin', { withCredentials: true })
        setUserData(res.data.payload)
      } catch (error) {
        console.log(error)
        setUserData([])

      }
    }
    fetchUser()
  }, [])



  useEffect(() => {
    fetchCategory()
    fetchCart()
    fetchBrand()
    fetchSupplier()
    fetchCustomer()
  }, [])

  const [purchaseItems, setPurchaseItems] = useState([]);

  const addToPurchase = (product, variant = null) => {
    setPurchaseItems((prev) => {
      // Unique key: product alone, or product+variant combo
      const key = variant
        ? `${product.product_id}-v${variant.variant_id}`
        : String(product.product_id);

      const existingItem = prev.find(item => item._key === key);

      if (existingItem) {
        return prev.map(item =>
          item._key === key
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, {
        _key: key,
        product_id: product.product_id,
        variant_id: variant?.variant_id || null,
        variant_name: variant?.variant_name || null,
        name: product.name + (variant ? ` (${variant.variant_name})` : ''),
        purchase_price: parseFloat(product.purchase_price) || 0,
        sale_price: parseFloat(product.sale_price) || 0,
        quantity: 1
      }];
    });
  };

  const removeFromPurchase = (key) => {
    setPurchaseItems((prev) => prev.filter(item => item._key !== key && item.product_id !== key));
  };

  const clearPurchase = () => {
    setPurchaseItems([]);
  };

  return (
    <Context.Provider value={{
      isBrandBox, setIsBrandBox, editBrand, setEditBrand, isCategoryBox, setIsCategoryBox, editCategory, setEditCategory, 
      brands, setBrands, purchaseItems, addToPurchase, removeFromPurchase,
      isSupplierBox, setIsSupplierBox, fetchSupplier, suppliers, setSuppliers, setPurchaseItems,
      isCustomerBox, setIsCustomerBox, customers, setCustomers,userData, setUserData,fetchBrand, fetchCustomer, fetchSupplier,isDashboardSidebar, setIsDashboardSidebar,
      categories, fetchCategory, cart, setCart, fetchCart, addToCart, increaseQuantity, clearCart, removeFromCart, decreaseQuantity, clearPurchase,
      siteData, setSiteData
    }}>
      {children}
    </Context.Provider>
  )
}

export default ContextProvider
