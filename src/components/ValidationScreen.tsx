import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { CheckCircle2, AlertCircle, AlertTriangle, Download, Eye } from "lucide-react";
import { useOrders, Order } from "@/contexts/OrderContext";
import { toast } from "sonner";
import { OrderDetail } from "./OrderDetail";

export const ValidationScreen = () => {
  const { orders } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const validOrders = orders.filter(o => o.estado === 'entregado' || o.estado === 'despachado');
  const warningOrders = orders.filter(o => o.estado === 'pendiente' || o.estado === 'en_picking' || o.estado === 'empacado');
  const errorOrders = orders.filter(o => o.estado === 'error' || o.estado === 'cancelado' || o.estado === 'devuelto');

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setDetailOpen(true);
  };

  const handleExport = () => {
    import('xlsx').then((XLSX) => {
      const exportData = orders.map(order => ({
        'Número Orden': order.numeroOrden,
        'Fecha': order.fecha,
        'Cliente': order.cliente,
        'Email': order.email || '',
        'Teléfono': order.telefono || '',
        'Dirección': order.direccion || '',
        'Producto': order.producto,
        'Cantidad': order.cantidad,
        'Precio': order.precio,
        'Total': order.total,
        'Estado': order.estado,
        'Notas': order.notas || ''
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Validación');
      XLSX.writeFile(wb, `reporte-validacion-${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success("Reporte exportado exitosamente");
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'entregado':
        return <Badge className="bg-success text-white">Entregado</Badge>;
      case 'despachado':
        return <Badge className="bg-secondary text-white">Despachado</Badge>;
      case 'empacado':
        return <Badge className="bg-accent text-white">Empacado</Badge>;
      case 'en_picking':
        return <Badge className="bg-primary text-white">En Picking</Badge>;
      case 'pendiente':
        return <Badge className="bg-warning text-white">Pendiente</Badge>;
      case 'cancelado':
        return <Badge variant="outline">Cancelado</Badge>;
      case 'devuelto':
        return <Badge variant="outline">Devuelto</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Desconocido</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Validación de Pedidos</h1>
          <p className="text-muted-foreground">
            Resumen de validaciones aplicadas a los pedidos importados
          </p>
        </div>
        <Button onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Exportar Reporte
        </Button>
      </div>

      {/* Resumen de Validación */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-foreground">{validOrders.length}</h3>
              <p className="text-sm text-muted-foreground">Pedidos Válidos</p>
              <p className="text-xs text-success mt-1">Sin problemas detectados</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-warning" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-foreground">{warningOrders.length}</h3>
              <p className="text-sm text-muted-foreground">Con Advertencias</p>
              <p className="text-xs text-warning mt-1">Revisión recomendada</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-foreground">{errorOrders.length}</h3>
              <p className="text-sm text-muted-foreground">Con Errores</p>
              <p className="text-xs text-destructive mt-1">Requieren corrección</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabla de Validación */}
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">Resultados de Validación</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Detalle de cada pedido procesado por el sistema
          </p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número Orden</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Observaciones</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  No hay pedidos cargados. Carga un archivo Excel para comenzar.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.numeroOrden}</TableCell>
                  <TableCell>{order.cliente}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{order.producto}</TableCell>
                  <TableCell>${order.total.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(order.estado)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {order.estado === 'error' ? 'Error al procesar' : 
                     order.estado === 'cancelado' ? 'Pedido cancelado' :
                     order.estado === 'devuelto' ? 'Pedido devuelto' :
                     order.estado === 'pendiente' ? 'Esperando procesamiento' : 
                     order.estado === 'en_picking' ? 'En proceso de picking' :
                     order.estado === 'empacado' ? 'Listo para envío' :
                     order.estado === 'despachado' ? 'En tránsito' :
                     order.estado === 'entregado' ? 'Entregado exitosamente' :
                     'Sin problemas'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewOrder(order)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Reglas de Validación */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Reglas de Validación Aplicadas</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Criterios automáticos para verificación de datos
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { rule: "ID de pedido único y válido", type: "Obligatorio" },
            { rule: "Nombre y contacto del cliente completos", type: "Obligatorio" },
            { rule: "Producto existente en catálogo SAG", type: "Obligatorio" },
            { rule: "Cantidad mayor a cero", type: "Obligatorio" },
            { rule: "Precio coherente con catálogo", type: "Validación" },
            { rule: "Dirección de envío completa", type: "Advertencia" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-card border border-border rounded-lg"
            >
              <span className="text-sm font-medium text-foreground">{item.rule}</span>
              <Badge variant="outline">{item.type}</Badge>
            </div>
          ))}
        </div>
      </Card>

      <OrderDetail 
        order={selectedOrder} 
        open={detailOpen} 
        onOpenChange={setDetailOpen} 
      />
    </div>
  );
};
