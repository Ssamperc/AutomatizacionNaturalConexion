import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Order {
  id: string;
  numeroOrden: string;
  fecha: string;
  cliente: string;
  producto: string;
  cantidad: number;
  precio: number;
  total: number;
  estado: 'pendiente' | 'en_picking' | 'empacado' | 'despachado' | 'entregado' | 'devuelto' | 'cancelado' | 'error';
  email?: string;
  direccion?: string;
  telefono?: string;
  notas?: string;
  sku?: string;
  transportadora?: string;
  numeroGuia?: string;
  fechaDespacho?: string;
  pickingAsignadoA?: string;
  fechaPicking?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  orderId: string;
  action: string;
  user: string;
  duration: string;
  status: 'success' | 'error' | 'warning' | 'retry';
  details: string;
}

interface OrderContextType {
  orders: Order[];
  auditLogs: AuditLog[];
  addOrders: (newOrders: Order[]) => void;
  updateOrderStatus: (orderId: string, status: Order['estado']) => void;
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  clearOrders: () => void;
  getOrderStats: () => {
    total: number;
    procesados: number;
    pendientes: number;
    errores: number;
  };
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('auditLogs');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('auditLogs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  const addOrders = (newOrders: Order[]) => {
    setOrders(prev => [...prev, ...newOrders]);
  };

  const updateOrderStatus = (orderId: string, status: Order['estado']) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, estado: status } : order
    ));
  };

  const addAuditLog = (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const newLog: AuditLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const clearOrders = () => {
    setOrders([]);
  };

  const getOrderStats = () => {
    return {
      total: orders.length,
      procesados: orders.filter(o => o.estado === 'entregado').length,
      pendientes: orders.filter(o => o.estado === 'pendiente').length,
      errores: orders.filter(o => o.estado === 'error').length,
      enPicking: orders.filter(o => o.estado === 'en_picking').length,
      empacados: orders.filter(o => o.estado === 'empacado').length,
      despachados: orders.filter(o => o.estado === 'despachado').length,
    };
  };

  return (
    <OrderContext.Provider value={{
      orders,
      auditLogs,
      addOrders,
      updateOrderStatus,
      addAuditLog,
      clearOrders,
      getOrderStats,
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within OrderProvider');
  }
  return context;
};
