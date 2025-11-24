import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Ubicacion {
  pasillo: string;
  estanteria: string;
  nivel: string;
  posicion: string;
}

export interface Product {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio: number;
  stock: number;
  stockMinimo: number;
  proveedor: string;
  ultimaActualizacion: string;
  ubicacion?: Ubicacion;
  lote?: string;
  fechaVencimiento?: string;
}

export interface MovimientoInventario {
  id: string;
  tipo: 'entrada' | 'salida' | 'ajuste';
  productoId: string;
  productoCodigo: string;
  productoNombre: string;
  cantidad: number;
  motivo: string;
  usuario: string;
  fecha: string;
  referencia?: string;
}

interface InventoryContextType {
  products: Product[];
  movimientos: MovimientoInventario[];
  addProduct: (product: Omit<Product, 'id' | 'ultimaActualizacion'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProduct: (id: string) => Product | undefined;
  getLowStockProducts: () => Product[];
  addMovimiento: (movimiento: Omit<MovimientoInventario, 'id' | 'fecha'>) => void;
  getMovimientosByProduct: (productoId: string) => MovimientoInventario[];
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('inventory');
    return saved ? JSON.parse(saved) : [];
  });

  const [movimientos, setMovimientos] = useState<MovimientoInventario[]>(() => {
    const saved = localStorage.getItem('movimientos_inventario');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('inventory', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('movimientos_inventario', JSON.stringify(movimientos));
  }, [movimientos]);

  const addProduct = (product: Omit<Product, 'id' | 'ultimaActualizacion'>) => {
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}-${Math.random()}`,
      ultimaActualizacion: new Date().toISOString(),
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(product =>
      product.id === id
        ? { ...product, ...updates, ultimaActualizacion: new Date().toISOString() }
        : product
    ));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  const getProduct = (id: string) => {
    return products.find(product => product.id === id);
  };

  const getLowStockProducts = () => {
    return products.filter(product => product.stock <= product.stockMinimo);
  };

  const addMovimiento = (movimiento: Omit<MovimientoInventario, 'id' | 'fecha'>) => {
    const newMovimiento: MovimientoInventario = {
      ...movimiento,
      id: `mov-${Date.now()}-${Math.random()}`,
      fecha: new Date().toISOString(),
    };
    setMovimientos(prev => [newMovimiento, ...prev]);
  };

  const getMovimientosByProduct = (productoId: string) => {
    return movimientos.filter(mov => mov.productoId === productoId);
  };

  return (
    <InventoryContext.Provider value={{
      products,
      movimientos,
      addProduct,
      updateProduct,
      deleteProduct,
      getProduct,
      getLowStockProducts,
      addMovimiento,
      getMovimientosByProduct,
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within InventoryProvider');
  }
  return context;
};
