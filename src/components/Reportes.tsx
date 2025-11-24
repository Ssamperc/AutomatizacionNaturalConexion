import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  CheckCircle2,
  Download,
  Package,
  DollarSign
} from "lucide-react";
import { useOrders } from "@/contexts/OrderContext";
import { useInventory } from "@/contexts/InventoryContext";
import { toast } from "sonner";

export const Reportes = () => {
  const { orders, auditLogs } = useOrders();
  const { products, movimientos, getLowStockProducts } = useInventory();

  const lowStockProducts = getLowStockProducts();

  // Métricas de pedidos
  const today = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(o => o.fecha === today);
  const completedOrders = orders.filter(o => ['entregado', 'despachado'].includes(o.estado));
  const errorOrders = orders.filter(o => o.estado === 'devuelto' || o.estado === 'error');

  // Productos más vendidos
  const productSales = new Map<string, { nombre: string; cantidad: number; sku: string }>();
  orders.forEach(order => {
    if (order.sku) {
      const current = productSales.get(order.sku);
      if (current) {
        current.cantidad += order.cantidad;
      } else {
        productSales.set(order.sku, {
          sku: order.sku,
          nombre: order.producto,
          cantidad: order.cantidad
        });
      }
    }
  });

  const topProducts = Array.from(productSales.values())
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 10);

  // Movimientos recientes
  const recentMovimientos = movimientos.slice(0, 20);

  // Tiempos de procesamiento
  const processingTimes = auditLogs
    .filter(log => log.action.includes('completado') || log.action.includes('Picking completado'))
    .slice(0, 10);

  const exportReport = (reportType: string) => {
    let data: any[] = [];
    let filename = '';

    switch (reportType) {
      case 'pedidos':
        data = orders.map(o => ({
          'N° Pedido': o.numeroOrden,
          'Fecha': o.fecha,
          'Cliente': o.cliente,
          'Producto': o.producto,
          'Cantidad': o.cantidad,
          'Total': o.total,
          'Estado': o.estado,
        }));
        filename = 'reporte-pedidos';
        break;
      case 'inventario':
        data = products.map(p => ({
          'SKU': p.codigo,
          'Nombre': p.nombre,
          'Stock': p.stock,
          'Stock Mínimo': p.stockMinimo,
          'Precio': p.precio,
          'Valor Total': p.precio * p.stock,
        }));
        filename = 'reporte-inventario';
        break;
      case 'movimientos':
        data = movimientos.map(m => ({
          'Fecha': new Date(m.fecha).toLocaleString('es-ES'),
          'Tipo': m.tipo,
          'Producto': m.productoNombre,
          'SKU': m.productoCodigo,
          'Cantidad': m.cantidad,
          'Motivo': m.motivo,
          'Usuario': m.usuario,
        }));
        filename = 'reporte-movimientos';
        break;
    }

    // Exportar como CSV
    const headers = Object.keys(data[0] || {});
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => row[h]).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast.success("Reporte exportado exitosamente");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Reportes y Estadísticas</h1>
        <p className="text-muted-foreground">
          Análisis completo de operaciones de bodega
        </p>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">{todayOrders.length}</h3>
              <p className="text-sm text-muted-foreground">Pedidos Hoy</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">{completedOrders.length}</h3>
              <p className="text-sm text-muted-foreground">Completados</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-warning" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">{lowStockProducts.length}</h3>
              <p className="text-sm text-muted-foreground">Stock Bajo</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">{errorOrders.length}</h3>
              <p className="text-sm text-muted-foreground">Errores/Devoluciones</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs de reportes */}
      <Tabs defaultValue="pedidos" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
          <TabsTrigger value="inventario">Inventario</TabsTrigger>
          <TabsTrigger value="movimientos">Movimientos</TabsTrigger>
          <TabsTrigger value="rendimiento">Rendimiento</TabsTrigger>
        </TabsList>

        {/* Reporte de Pedidos */}
        <TabsContent value="pedidos" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Resumen de Pedidos</h3>
              <Button onClick={() => exportReport('pedidos')} size="sm" variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="p-4 bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Total Pedidos</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </Card>
              <Card className="p-4 bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Valor Total</p>
                <p className="text-2xl font-bold">
                  ${orders.reduce((sum, o) => sum + o.total, 0).toLocaleString()}
                </p>
              </Card>
              <Card className="p-4 bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Ticket Promedio</p>
                <p className="text-2xl font-bold">
                  ${orders.length > 0 ? (orders.reduce((sum, o) => sum + o.total, 0) / orders.length).toFixed(0) : 0}
                </p>
              </Card>
            </div>

            <h4 className="font-semibold mb-3">Productos Más Vendidos</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Cantidad Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.map((product, index) => (
                  <TableRow key={product.sku}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{product.nombre}</TableCell>
                    <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{product.cantidad} unidades</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Reporte de Inventario */}
        <TabsContent value="inventario" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Estado del Inventario</h3>
              <Button onClick={() => exportReport('inventario')} size="sm" variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="p-4 bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Total Productos</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </Card>
              <Card className="p-4 bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Valor Total Inventario</p>
                <p className="text-2xl font-bold">
                  ${products.reduce((sum, p) => sum + (p.precio * p.stock), 0).toLocaleString()}
                </p>
              </Card>
              <Card className="p-4 bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Productos Críticos</p>
                <p className="text-2xl font-bold text-warning">{lowStockProducts.length}</p>
              </Card>
            </div>

            <h4 className="font-semibold mb-3">Productos con Stock Bajo</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Stock Actual</TableHead>
                  <TableHead>Stock Mínimo</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockProducts.slice(0, 10).map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-mono">{product.codigo}</TableCell>
                    <TableCell className="font-medium">{product.nombre}</TableCell>
                    <TableCell>
                      <span className={product.stock === 0 ? 'text-destructive font-bold' : 'text-warning font-semibold'}>
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell>{product.stockMinimo}</TableCell>
                    <TableCell>
                      {product.stock === 0 ? (
                        <Badge variant="destructive">Sin Stock</Badge>
                      ) : (
                        <Badge className="bg-warning text-white">Stock Bajo</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Reporte de Movimientos */}
        <TabsContent value="movimientos" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Movimientos de Inventario</h3>
              <Button onClick={() => exportReport('movimientos')} size="sm" variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Usuario</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentMovimientos.map((mov) => (
                  <TableRow key={mov.id}>
                    <TableCell className="text-sm">
                      {new Date(mov.fecha).toLocaleString('es-ES')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        mov.tipo === 'entrada' ? 'default' : 
                        mov.tipo === 'salida' ? 'secondary' : 
                        'outline'
                      }>
                        {mov.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{mov.productoNombre}</p>
                        <p className="text-xs text-muted-foreground">{mov.productoCodigo}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {mov.tipo === 'entrada' ? '+' : '-'}{mov.cantidad}
                    </TableCell>
                    <TableCell className="text-sm">{mov.motivo}</TableCell>
                    <TableCell className="text-sm">{mov.usuario}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Reporte de Rendimiento */}
        <TabsContent value="rendimiento" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Rendimiento de Operaciones</h3>

            <div className="space-y-4">
              <Card className="p-4 bg-muted/50">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Tiempos de Procesamiento Recientes
                </h4>
                <div className="space-y-2">
                  {processingTimes.map((log) => (
                    <div key={log.id} className="flex justify-between items-center text-sm">
                      <div>
                        <p className="font-medium">Pedido #{log.orderId.slice(-8)}</p>
                        <p className="text-xs text-muted-foreground">{log.action}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{log.duration}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString('es-ES')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 bg-success/5 border-success/30">
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-success">
                    <CheckCircle2 className="h-5 w-5" />
                    Tasa de Éxito
                  </h4>
                  <p className="text-3xl font-bold">
                    {orders.length > 0 
                      ? ((completedOrders.length / orders.length) * 100).toFixed(1) 
                      : 0}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {completedOrders.length} de {orders.length} pedidos completados
                  </p>
                </Card>

                <Card className="p-4 bg-destructive/5 border-destructive/30">
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Tasa de Error
                  </h4>
                  <p className="text-3xl font-bold">
                    {orders.length > 0 
                      ? ((errorOrders.length / orders.length) * 100).toFixed(1) 
                      : 0}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {errorOrders.length} errores/devoluciones
                  </p>
                </Card>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
