import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  ClipboardList, 
  MapPin, 
  Package, 
  UserCheck, 
  CheckCircle2,
  AlertCircle,
  Scan
} from "lucide-react";
import { useOrders } from "@/contexts/OrderContext";
import { useInventory } from "@/contexts/InventoryContext";
import { toast } from "sonner";

export const Picking = () => {
  const { orders, updateOrderStatus, addAuditLog } = useOrders();
  const { products, updateProduct, addMovimiento } = useInventory();
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [operario, setOperario] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [pickingList, setPickingList] = useState<any[]>([]);
  const [isPickingDialogOpen, setIsPickingDialogOpen] = useState(false);
  const [scanCode, setScanCode] = useState("");

  // Pedidos disponibles para picking
  const availableOrders = orders.filter(o => o.estado === 'pendiente');
  
  // Pedidos en proceso de picking
  const pickingOrders = orders.filter(o => o.estado === 'en_picking');

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const generatePickingOrder = () => {
    if (selectedOrders.length === 0) {
      toast.error("Selecciona al menos un pedido");
      return;
    }

    if (!operario.trim()) {
      toast.error("Asigna un operario");
      return;
    }

    setIsGenerating(true);

    // Agrupar productos por ubicación
    const itemsMap = new Map<string, any>();

    selectedOrders.forEach(orderId => {
      const order = orders.find(o => o.id === orderId);
      if (!order || !order.sku) return;

      const product = products.find(p => p.codigo === order.sku);
      if (!product) return;

      const key = `${order.sku}-${product.ubicacion?.pasillo || 'Sin'}-${product.ubicacion?.estanteria || 'asignar'}`;
      
      if (itemsMap.has(key)) {
        const existing = itemsMap.get(key);
        existing.cantidad += order.cantidad;
        existing.pedidos.push(order.numeroOrden);
      } else {
        itemsMap.set(key, {
          sku: order.sku,
          nombre: product.nombre,
          cantidad: order.cantidad,
          ubicacion: product.ubicacion || { 
            pasillo: 'Sin asignar', 
            estanteria: '-', 
            nivel: '-', 
            posicion: '-' 
          },
          stockDisponible: product.stock,
          pedidos: [order.numeroOrden],
          productId: product.id,
        });
      }
    });

    // Ordenar por ubicación
    const sortedItems = Array.from(itemsMap.values()).sort((a, b) => {
      if (a.ubicacion.pasillo !== b.ubicacion.pasillo) {
        return a.ubicacion.pasillo.localeCompare(b.ubicacion.pasillo);
      }
      if (a.ubicacion.estanteria !== b.ubicacion.estanteria) {
        return a.ubicacion.estanteria.localeCompare(b.ubicacion.estanteria);
      }
      return a.ubicacion.nivel.localeCompare(b.ubicacion.nivel);
    });

    setPickingList(sortedItems);

    // Actualizar estado de pedidos
    selectedOrders.forEach(orderId => {
      updateOrderStatus(orderId, 'en_picking');
      addAuditLog({
        orderId,
        action: 'Picking iniciado',
        user: operario,
        duration: '0s',
        status: 'success',
        details: `Orden de picking generada y asignada a ${operario}`,
      });
    });

    setIsGenerating(false);
    setIsPickingDialogOpen(true);
    toast.success(`Orden de picking generada para ${operario}`);
  };

  const handleScanProduct = (itemIndex: number) => {
    if (!scanCode.trim()) {
      toast.error("Escanea o ingresa un código");
      return;
    }

    const item = pickingList[itemIndex];
    if (scanCode.toUpperCase() !== item.sku.toUpperCase()) {
      toast.error("Código incorrecto", {
        description: `Esperado: ${item.sku}, Escaneado: ${scanCode}`
      });
      return;
    }

    // Verificar stock
    if (item.stockDisponible < item.cantidad) {
      toast.warning("Stock insuficiente", {
        description: `Disponible: ${item.stockDisponible}, Necesario: ${item.cantidad}`
      });
      
      const newList = [...pickingList];
      newList[itemIndex] = { ...item, faltante: item.cantidad - item.stockDisponible };
      setPickingList(newList);
    } else {
      // Descontar del inventario
      updateProduct(item.productId, {
        stock: item.stockDisponible - item.cantidad
      });

      // Registrar movimiento
      addMovimiento({
        tipo: 'salida',
        productoId: item.productId,
        productoCodigo: item.sku,
        productoNombre: item.nombre,
        cantidad: item.cantidad,
        motivo: 'Picking de pedidos',
        usuario: operario,
        referencia: item.pedidos.join(', ')
      });

      const newList = [...pickingList];
      newList[itemIndex] = { ...item, recogido: true };
      setPickingList(newList);

      toast.success("Producto confirmado", {
        description: `${item.cantidad} unidades de ${item.nombre}`
      });
    }

    setScanCode("");
  };

  const completePickingOrder = () => {
    const allRecogido = pickingList.every(item => item.recogido || item.faltante);
    
    if (!allRecogido) {
      toast.error("Debes completar todos los items");
      return;
    }

    // Actualizar pedidos a empacado
    selectedOrders.forEach(orderId => {
      const hasFaltantes = pickingList.some(item => 
        item.faltante && item.pedidos.includes(orders.find(o => o.id === orderId)?.numeroOrden)
      );

      if (hasFaltantes) {
        addAuditLog({
          orderId,
          action: 'Picking completado con faltantes',
          user: operario,
          duration: '0s',
          status: 'warning',
          details: 'Pedido completado pero tiene productos faltantes',
        });
      } else {
        updateOrderStatus(orderId, 'empacado');
        addAuditLog({
          orderId,
          action: 'Picking completado',
          user: operario,
          duration: '0s',
          status: 'success',
          details: 'Pedido listo para empacar',
        });
      }
    });

    setIsPickingDialogOpen(false);
    setSelectedOrders([]);
    setPickingList([]);
    setOperario("");
    
    toast.success("Orden de picking completada");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Gestión de Picking</h1>
        <p className="text-muted-foreground">
          Genera órdenes de picking optimizadas para preparar pedidos
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <ClipboardList className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">{availableOrders.length}</h3>
              <p className="text-sm text-muted-foreground">Pedidos Pendientes</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
              <Package className="h-6 w-6 text-warning" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">{pickingOrders.length}</h3>
              <p className="text-sm text-muted-foreground">En Proceso</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">{selectedOrders.length}</h3>
              <p className="text-sm text-muted-foreground">Seleccionados</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Generador de orden */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Nueva Orden de Picking</h3>
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <Label>Asignar a operario</Label>
            <Input
              value={operario}
              onChange={(e) => setOperario(e.target.value)}
              placeholder="Nombre del operario"
            />
          </div>
          <div className="flex items-end">
            <Button 
              onClick={generatePickingOrder}
              disabled={selectedOrders.length === 0 || !operario.trim() || isGenerating}
            >
              <UserCheck className="mr-2 h-4 w-4" />
              Generar Orden ({selectedOrders.length})
            </Button>
          </div>
        </div>

        {/* Tabla de pedidos */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>N° Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {availableOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No hay pedidos pendientes de picking
                </TableCell>
              </TableRow>
            ) : (
              availableOrders.map((order) => {
                const product = products.find(p => p.codigo === order.sku);
                const isSelected = selectedOrders.includes(order.id);
                
                return (
                  <TableRow 
                    key={order.id}
                    className={isSelected ? "bg-primary/5" : ""}
                  >
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectOrder(order.id)}
                        className="w-4 h-4"
                      />
                    </TableCell>
                    <TableCell className="font-mono">{order.numeroOrden}</TableCell>
                    <TableCell>{order.cliente}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.producto}</p>
                        <p className="text-xs text-muted-foreground">{order.sku}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">{order.cantidad}</TableCell>
                    <TableCell>
                      {product?.ubicacion ? (
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3" />
                          {`${product.ubicacion.pasillo}-${product.ubicacion.estanteria}-${product.ubicacion.nivel}`}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Sin ubicación</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{order.estado}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Dialog de orden de picking */}
      <Dialog open={isPickingDialogOpen} onOpenChange={setIsPickingDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Orden de Picking - {operario}</DialogTitle>
            <DialogDescription>
              Escanea cada producto para confirmar y descontar del inventario
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {pickingList.map((item, index) => (
              <Card key={index} className={`p-4 ${item.recogido ? 'bg-success/5 border-success' : item.faltante ? 'bg-warning/5 border-warning' : ''}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-semibold text-foreground">
                          {item.ubicacion.pasillo} - {item.ubicacion.estanteria} - {item.ubicacion.nivel} - {item.ubicacion.posicion}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Pedidos: {item.pedidos.join(', ')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{item.nombre}</p>
                        <p className="text-xs text-muted-foreground font-mono">{item.sku}</p>
                      </div>
                      <Badge variant="secondary">Cantidad: {item.cantidad}</Badge>
                      {item.stockDisponible < item.cantidad && (
                        <Badge variant="destructive">
                          <AlertCircle className="mr-1 h-3 w-3" />
                          Stock insuficiente
                        </Badge>
                      )}
                    </div>
                  </div>
                  {item.recogido ? (
                    <CheckCircle2 className="h-8 w-8 text-success" />
                  ) : item.faltante ? (
                    <AlertCircle className="h-8 w-8 text-warning" />
                  ) : null}
                </div>

                {!item.recogido && !item.faltante && (
                  <div className="flex gap-2">
                    <Input
                      value={scanCode}
                      onChange={(e) => setScanCode(e.target.value)}
                      placeholder="Escanea o ingresa código SKU"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleScanProduct(index);
                        }
                      }}
                    />
                    <Button onClick={() => handleScanProduct(index)}>
                      <Scan className="mr-2 h-4 w-4" />
                      Confirmar
                    </Button>
                  </div>
                )}

                {item.faltante && (
                  <div className="mt-2 p-3 rounded bg-warning/10 border border-warning/30">
                    <p className="text-sm font-medium text-warning">
                      ⚠️ Faltante: {item.faltante} unidades
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Se notificará al área correspondiente
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPickingDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={completePickingOrder}>
              Completar Picking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
