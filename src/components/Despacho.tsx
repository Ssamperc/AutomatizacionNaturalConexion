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
  Truck, 
  Package, 
  FileText, 
  Printer,
  CheckCircle2,
  Calendar
} from "lucide-react";
import { useOrders } from "@/contexts/OrderContext";
import { toast } from "sonner";

export const Despacho = () => {
  const { orders, updateOrderStatus, addAuditLog } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDespachoOpen, setIsDespachoOpen] = useState(false);
  const [transportadora, setTransportadora] = useState("");
  const [numeroGuia, setNumeroGuia] = useState("");

  // Pedidos listos para despacho
  const readyOrders = orders.filter(o => o.estado === 'empacado');
  
  // Pedidos despachados
  const dispatchedOrders = orders.filter(o => o.estado === 'despachado');

  const openDespachoDialog = (order: any) => {
    setSelectedOrder(order);
    setTransportadora(order.transportadora || "");
    setNumeroGuia(order.numeroGuia || "");
    setIsDespachoOpen(true);
  };

  const handleDespacho = () => {
    if (!transportadora.trim()) {
      toast.error("Ingresa la transportadora");
      return;
    }

    if (!numeroGuia.trim()) {
      toast.error("Ingresa el número de guía");
      return;
    }

    // Actualizar pedido
    updateOrderStatus(selectedOrder.id, 'despachado');
    
    addAuditLog({
      orderId: selectedOrder.id,
      action: 'Pedido despachado',
      user: 'Sistema',
      duration: '0s',
      status: 'success',
      details: `Transportadora: ${transportadora}, Guía: ${numeroGuia}`,
    });

    toast.success("Pedido despachado exitosamente", {
      description: `Guía ${numeroGuia} - ${transportadora}`
    });

    setIsDespachoOpen(false);
    setSelectedOrder(null);
    setTransportadora("");
    setNumeroGuia("");
  };

  const printGuia = (order: any) => {
    // Simular impresión de guía
    const printContent = `
      ===================================
      GUÍA DE DESPACHO
      ===================================
      
      N° Pedido: ${order.numeroOrden}
      Fecha: ${new Date(order.fecha).toLocaleDateString('es-ES')}
      
      CLIENTE:
      ${order.cliente}
      ${order.email || ''}
      ${order.telefono || ''}
      
      DIRECCIÓN DE ENTREGA:
      ${order.direccion}
      
      PRODUCTOS:
      - ${order.producto} x ${order.cantidad}
      
      TRANSPORTADORA: ${order.transportadora || 'Por asignar'}
      N° GUÍA: ${order.numeroGuia || 'Por asignar'}
      
      Total: $${order.total.toLocaleString()}
      
      ===================================
    `;

    console.log(printContent);
    toast.success("Guía enviada a impresora");
  };

  const printSticker = (order: any) => {
    // Simular impresión de sticker
    const stickerContent = `
      ╔═══════════════════════════════════╗
      ║       STICKER DE ENVÍO           ║
      ╠═══════════════════════════════════╣
      ║                                   ║
      ║  PARA:                           ║
      ║  ${order.cliente}                ║
      ║                                   ║
      ║  ${order.direccion}              ║
      ║                                   ║
      ║  Tel: ${order.telefono || 'N/A'} ║
      ║                                   ║
      ║  Pedido: ${order.numeroOrden}    ║
      ║  Guía: ${order.numeroGuia || 'N/A'} ║
      ║                                   ║
      ╚═══════════════════════════════════╝
    `;

    console.log(stickerContent);
    toast.success("Sticker enviado a impresora");
  };

  const exportToSAG = () => {
    // Simular exportación a SAG
    const sagData = readyOrders.map(order => ({
      numeroOrden: order.numeroOrden,
      fecha: order.fecha,
      cliente: order.cliente,
      total: order.total,
      estado: order.estado,
      transportadora: order.transportadora || '',
      numeroGuia: order.numeroGuia || '',
    }));

    console.log('Exportando a SAG:', sagData);
    
    // Crear y descargar archivo
    const dataStr = JSON.stringify(sagData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sag-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    toast.success("Archivo exportado para SAG");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Gestión de Despacho</h1>
        <p className="text-muted-foreground">
          Prepara y despacha pedidos empacados
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">{readyOrders.length}</h3>
              <p className="text-sm text-muted-foreground">Listos para Despacho</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
              <Truck className="h-6 w-6 text-success" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">{dispatchedOrders.length}</h3>
              <p className="text-sm text-muted-foreground">Despachados</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-accent" />
            </div>
            <div>
              <Button onClick={exportToSAG} size="sm" variant="outline" className="w-full">
                Exportar a SAG
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Pedidos listos para despacho */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Pedidos Empacados - Listos para Despacho</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Pedido</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead>Productos</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {readyOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No hay pedidos listos para despacho
                </TableCell>
              </TableRow>
            ) : (
              readyOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono font-medium">{order.numeroOrden}</TableCell>
                  <TableCell>{new Date(order.fecha).toLocaleDateString('es-ES')}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.cliente}</p>
                      <p className="text-xs text-muted-foreground">{order.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{order.direccion}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{order.producto}</p>
                      <p className="text-xs text-muted-foreground">Cant: {order.cantidad}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">${order.total.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => printGuia(order)}
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => openDespachoDialog(order)}
                      >
                        <Truck className="mr-2 h-4 w-4" />
                        Despachar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pedidos despachados */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Pedidos Despachados Recientemente</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Transportadora</TableHead>
              <TableHead>N° Guía</TableHead>
              <TableHead>Fecha Despacho</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dispatchedOrders.slice(0, 10).map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono">{order.numeroOrden}</TableCell>
                <TableCell>{order.cliente}</TableCell>
                <TableCell>{order.transportadora || '-'}</TableCell>
                <TableCell className="font-mono">{order.numeroGuia || '-'}</TableCell>
                <TableCell>
                  {order.fechaDespacho 
                    ? new Date(order.fechaDespacho).toLocaleDateString('es-ES')
                    : '-'}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-success/10">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Despachado
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Dialog de despacho */}
      <Dialog open={isDespachoOpen} onOpenChange={setIsDespachoOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Despachar Pedido {selectedOrder?.numeroOrden}</DialogTitle>
            <DialogDescription>
              Registra la información de transportadora y guía para despachar el pedido
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <Card className="p-4 bg-muted/50">
                <h4 className="font-semibold mb-2">Información del Pedido</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Cliente:</p>
                    <p className="font-medium">{selectedOrder.cliente}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Teléfono:</p>
                    <p className="font-medium">{selectedOrder.telefono || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Dirección:</p>
                    <p className="font-medium">{selectedOrder.direccion}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Producto:</p>
                    <p className="font-medium">{selectedOrder.producto} x {selectedOrder.cantidad}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total:</p>
                    <p className="font-medium">${selectedOrder.total.toLocaleString()}</p>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Transportadora *</Label>
                  <Input
                    value={transportadora}
                    onChange={(e) => setTransportadora(e.target.value)}
                    placeholder="Ej: Chilexpress, Starken"
                  />
                </div>
                <div>
                  <Label>Número de Guía *</Label>
                  <Input
                    value={numeroGuia}
                    onChange={(e) => setNumeroGuia(e.target.value)}
                    placeholder="Ej: 123456789"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => printGuia(selectedOrder)} className="flex-1">
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimir Guía
                </Button>
                <Button variant="outline" onClick={() => printSticker(selectedOrder)} className="flex-1">
                  <FileText className="mr-2 h-4 w-4" />
                  Imprimir Sticker
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDespachoOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleDespacho}>
              <Truck className="mr-2 h-4 w-4" />
              Confirmar Despacho
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
