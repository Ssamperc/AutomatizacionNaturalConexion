import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Order, useOrders } from "@/contexts/OrderContext";
import { Package, User, MapPin, Mail, Phone, FileText, CheckCircle2, Loader2, Truck, XCircle, Calendar, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface OrderDetailProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const OrderDetail = ({ order, open, onOpenChange }: OrderDetailProps) => {
  const { updateOrderStatus, addAuditLog } = useOrders();

  if (!order) return null;

  const handleStatusChange = (newStatus: Order['estado']) => {
    updateOrderStatus(order.id, newStatus);
    addAuditLog({
      orderId: order.numeroOrden,
      action: `Estado cambiado a: ${getStatusLabel(newStatus)}`,
      user: 'Usuario',
      duration: '0s',
      status: 'success',
      details: `Pedido ${order.numeroOrden} actualizado manualmente`,
    });
    toast.success(`Estado actualizado a: ${getStatusLabel(newStatus)}`);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pendiente': return 'Pendiente';
      case 'en_curso': return 'En Curso';
      case 'preparado': return 'Preparado';
      case 'enviado': return 'Enviado';
      case 'completado': return 'Completado';
      case 'cancelado': return 'Cancelado';
      case 'error': return 'Error';
      default: return 'Desconocido';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completado':
        return <Badge className="bg-success text-white">Completado</Badge>;
      case 'pendiente':
        return <Badge className="bg-warning text-white">Pendiente</Badge>;
      case 'en_curso':
        return <Badge className="bg-primary text-white">En Curso</Badge>;
      case 'preparado':
        return <Badge className="bg-accent text-white">Preparado</Badge>;
      case 'enviado':
        return <Badge className="bg-secondary text-white">Enviado</Badge>;
      case 'cancelado':
        return <Badge variant="outline">Cancelado</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Desconocido</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">Pedido {order.numeroOrden}</DialogTitle>
            {getStatusBadge(order.estado)}
          </div>
          <DialogDescription>
            Información completa del pedido
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Información del Producto */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Package className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Producto</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nombre</p>
                <p className="font-medium">{order.producto}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cantidad</p>
                <p className="font-medium">{order.cantidad} unidades</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Precio Unitario</p>
                <p className="font-medium">${order.precio.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="font-bold text-primary text-lg">${order.total.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Información del Cliente */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Cliente</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Nombre</p>
                <p className="font-medium">{order.cliente}</p>
              </div>
              {order.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{order.email}</p>
                  </div>
                </div>
              )}
              {order.telefono && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Teléfono</p>
                    <p className="font-medium">{order.telefono}</p>
                  </div>
                </div>
              )}
              {order.direccion && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Dirección de Envío</p>
                    <p className="font-medium">{order.direccion}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Información Adicional */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Detalles Adicionales</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Fecha del Pedido</p>
                  <p className="font-medium">{order.fecha}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">ID de Orden</p>
                  <p className="font-medium font-mono text-sm">{order.id}</p>
                </div>
              </div>
              {order.notas && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Notas del Pedido</p>
                  <p className="font-medium bg-muted p-3 rounded-md">{order.notas}</p>
                </div>
              )}
            </div>
          </div>

          {/* Estado del Procesamiento */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3">Estado del Procesamiento</h3>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Estado actual:</span>
              {getStatusBadge(order.estado)}
            </div>
            {order.estado === 'error' && (
              <p className="text-sm text-destructive mt-2">
                Este pedido presentó errores durante el procesamiento. Revise los logs de auditoría para más detalles.
              </p>
            )}
            {order.estado === 'pendiente' && (
              <p className="text-sm text-warning mt-2">
                Este pedido está esperando ser procesado por el sistema SAG.
              </p>
            )}
            {order.estado === 'entregado' && (
              <p className="text-sm text-success mt-2">
                Pedido procesado exitosamente y sincronizado con SAG.
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
          <div className="flex flex-col gap-2 w-full">
            <p className="text-sm text-muted-foreground mb-2">Actualizar estado del pedido:</p>
            <div className="flex flex-wrap gap-2">
              {order.estado !== 'en_picking' && (
                <Button 
                  onClick={() => handleStatusChange('en_picking')}
                  size="sm"
                  variant={order.estado === 'pendiente' ? 'default' : 'outline'}
                  className="flex-1 min-w-[120px]"
                >
                  <Loader2 className="mr-2 h-4 w-4" />
                  En Picking
                </Button>
              )}
              {(order.estado === 'en_picking' || order.estado === 'empacado') && (
                <Button 
                  onClick={() => handleStatusChange('empacado')}
                  size="sm"
                  variant={order.estado === 'en_picking' ? 'default' : 'outline'}
                  className="flex-1 min-w-[120px]"
                >
                  <Package className="mr-2 h-4 w-4" />
                  Empacado
                </Button>
              )}
              {(order.estado === 'empacado' || order.estado === 'despachado') && (
                <Button 
                  onClick={() => handleStatusChange('despachado')}
                  size="sm"
                  variant={order.estado === 'empacado' ? 'default' : 'outline'}
                  className="flex-1 min-w-[120px]"
                >
                  <Truck className="mr-2 h-4 w-4" />
                  Despachado
                </Button>
              )}
              {order.estado === 'despachado' && (
                <Button 
                  onClick={() => handleStatusChange('entregado')}
                  size="sm"
                  className="flex-1 min-w-[120px] bg-success hover:bg-success/90 text-white"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Entregado
                </Button>
              )}
            </div>
            {order.estado !== 'cancelado' && order.estado !== 'entregado' && (
              <Button 
                onClick={() => handleStatusChange('cancelado')}
                size="sm"
                variant="destructive"
                className="w-full"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancelar Pedido
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
