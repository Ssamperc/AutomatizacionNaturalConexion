import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Play, Pause, RotateCcw, CheckCircle2, Clock, Eye } from "lucide-react";
import { toast } from "sonner";
import { useOrders, Order } from "@/contexts/OrderContext";
import { FileUpload } from "@/components/FileUpload";
import { OrderDetail } from "./OrderDetail";

type ExecutionStatus = "idle" | "running" | "paused" | "completed";

export const WorkflowExecution = () => {
  const [status, setStatus] = useState<ExecutionStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const { orders, updateOrderStatus, addAuditLog, getOrderStats } = useOrders();
  const stats = getOrderStats();

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setDetailOpen(true);
  };

  const getStatusBadgeOrder = (status: string) => {
    switch (status) {
      case 'completado':
        return <Badge className="bg-success text-white">Completado</Badge>;
      case 'enviado':
        return <Badge className="bg-secondary text-white">Enviado</Badge>;
      case 'preparado':
        return <Badge className="bg-accent text-white">Preparado</Badge>;
      case 'en_curso':
        return <Badge className="bg-primary text-white">En Curso</Badge>;
      case 'pendiente':
        return <Badge className="bg-warning text-white">Pendiente</Badge>;
      case 'cancelado':
        return <Badge variant="outline">Cancelado</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Desconocido</Badge>;
    }
  };

  const handleStart = async () => {
    if (orders.length === 0) {
      toast.error("No hay pedidos para procesar. Por favor carga un archivo Excel primero.");
      return;
    }

    const pendingOrders = orders.filter(o => o.estado === 'pendiente');
    if (pendingOrders.length === 0) {
      toast.info("No hay pedidos pendientes para procesar.");
      return;
    }

    setStatus("running");
    setProgress(0);
    toast.info(`Iniciando procesamiento de ${pendingOrders.length} pedidos...`);

    const totalOrders = pendingOrders.length;
    let processed = 0;

    for (const order of pendingOrders) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const success = Math.random() > 0.1;
      const newStatus = success ? 'entregado' : 'error';
      
      updateOrderStatus(order.id, newStatus);
      
      addAuditLog({
        orderId: order.numeroOrden,
        action: success ? 'Procesado en SAG' : 'Error al procesar',
        user: 'RPA Bot',
        duration: `${(Math.random() * 2 + 1).toFixed(1)}s`,
        status: success ? 'success' : 'error',
        details: success 
          ? `Pedido ${order.numeroOrden} registrado exitosamente en SAG` 
          : `Error al procesar pedido ${order.numeroOrden}`,
      });

      processed++;
      setProgress((processed / totalOrders) * 100);
    }

    setStatus("completed");
    const finalStats = getOrderStats();
    const completados = orders.filter(o => o.estado === 'entregado' || o.estado === 'despachado').length;
    toast.success(`¡Flujo completado! ${completados} pedidos procesados exitosamente.`);
  };

  const handlePause = () => {
    setStatus("paused");
    toast.info("Flujo pausado");
  };

  const handleReset = () => {
    setStatus("idle");
    setProgress(0);
    toast.info("Flujo reiniciado");
  };

  const getStatusBadge = (status: ExecutionStatus) => {
    switch (status) {
      case "idle":
        return <Badge variant="secondary">Inactivo</Badge>;
      case "running":
        return <Badge variant="default" className="bg-primary">En Ejecución</Badge>;
      case "paused":
        return <Badge variant="outline">Pausado</Badge>;
      case "completed":
        return <Badge variant="default" className="bg-success">Completado</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Ejecutar Flujo RPA</h1>
        <p className="text-muted-foreground">
          Control de ejecución del robot de automatización Power Automate Desktop
        </p>
      </div>

      {/* Panel de Control */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Panel de Control</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Flujo de automatización WordPress → SAG
            </p>
          </div>
          {getStatusBadge(status)}
        </div>

        <div className="space-y-6">
          {/* Botones de Control */}
          <div className="flex gap-3">
            <Button
              onClick={handleStart}
              disabled={status === "running"}
              size="lg"
              className="flex-1"
            >
              <Play className="mr-2 h-4 w-4" />
              Ejecutar Flujo
            </Button>

            <Button
              onClick={handlePause}
              disabled={status !== "running"}
              variant="secondary"
              size="lg"
            >
              <Pause className="mr-2 h-4 w-4" />
              Pausar
            </Button>

            <Button
              onClick={handleReset}
              disabled={status === "idle"}
              variant="outline"
              size="lg"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reiniciar
            </Button>
          </div>

          {/* Barra de Progreso */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">Progreso de Ejecución</span>
              <span className="text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* Métricas en Tiempo Real */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Pedidos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-success">
                {orders.filter(o => o.estado === 'entregado' || o.estado === 'despachado').length}
              </p>
              <p className="text-sm text-muted-foreground">Exitosos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-destructive">{stats.errores}</p>
              <p className="text-sm text-muted-foreground">Errores</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Pasos del Flujo */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Pasos del Flujo de Automatización</h3>
        <div className="space-y-3">
          {[
            { step: 1, name: "Lectura de Pedidos", desc: "WordPress/WooCommerce → Excel" },
            { step: 2, name: "Validación de Datos", desc: "Verificación de campos requeridos" },
            { step: 3, name: "Ingreso a SAG", desc: "Automatización RPA en sistema comercial" },
            { step: 4, name: "Actualización Estado", desc: "Registro en base de datos" },
            { step: 5, name: "Notificación Cliente", desc: "Envío automático vía Outlook" },
            { step: 6, name: "Generación Log", desc: "Auditoría y trazabilidad" },
          ].map((item) => (
            <div
              key={item.step}
              className={`flex items-center gap-3 p-4 rounded-lg border ${
                progress >= (item.step / 6) * 100
                  ? 'bg-primary/5 border-primary'
                  : 'bg-card border-border'
              }`}
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                progress >= (item.step / 6) * 100
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {item.step}
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{item.name}</p>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
              {progress >= (item.step / 6) * 100 && (
                <CheckCircle2 className="h-5 w-5 text-primary" />
              )}
              {status === "running" && progress < (item.step / 6) * 100 && progress >= ((item.step - 1) / 6) * 100 && (
                <Clock className="h-5 w-5 text-muted-foreground animate-pulse" />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Carga de Archivos */}
      <FileUpload />

      {/* Lista de Pedidos */}
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">Pedidos en Cola</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Lista de pedidos pendientes de procesamiento
          </p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Orden</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No hay pedidos cargados. Carga un archivo Excel para comenzar.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.numeroOrden}</TableCell>
                  <TableCell>{order.cliente}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{order.producto}</TableCell>
                  <TableCell>{order.cantidad}</TableCell>
                  <TableCell>${order.total.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadgeOrder(order.estado)}</TableCell>
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

      <OrderDetail 
        order={selectedOrder} 
        open={detailOpen} 
        onOpenChange={setDetailOpen} 
      />
    </div>
  );
};
