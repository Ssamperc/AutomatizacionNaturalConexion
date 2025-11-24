import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Search, Download, Calendar, CheckCircle2, XCircle, Clock, TrendingUp } from "lucide-react";
import { useOrders } from "@/contexts/OrderContext";
import { toast } from "sonner";

export const AuditHistory = () => {
  const { auditLogs, getOrderStats } = useOrders();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const stats = getOrderStats();
  
  const successToday = auditLogs.filter(log => 
    log.status === 'success' && 
    new Date(log.timestamp).toDateString() === new Date().toDateString()
  ).length;
  
  const errorsToday = auditLogs.filter(log => 
    log.status === 'error' && 
    new Date(log.timestamp).toDateString() === new Date().toDateString()
  ).length;
  
  const avgDuration = auditLogs.length > 0
    ? (auditLogs.reduce((sum, log) => sum + parseFloat(log.duration), 0) / auditLogs.length).toFixed(1)
    : '0';

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    import('xlsx').then((XLSX) => {
      const exportData = filteredLogs.map(log => ({
        'Fecha y Hora': new Date(log.timestamp).toLocaleString('es-ES'),
        'ID Pedido': log.orderId,
        'Acción': log.action,
        'Usuario': log.user,
        'Duración': log.duration,
        'Estado': log.status,
        'Detalles': log.details
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Auditoría');
      XLSX.writeFile(wb, `auditoria-${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success("Historial exportado exitosamente");
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-success text-white">Exitoso</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'warning':
        return <Badge className="bg-warning text-white">Advertencia</Badge>;
      case 'retry':
        return <Badge variant="outline">Reintento</Badge>;
      default:
        return <Badge variant="secondary">Desconocido</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Historial de Auditoría</h1>
        <p className="text-muted-foreground">
          Registro completo de todas las operaciones del sistema RPA
        </p>
      </div>

      {/* Controles y Filtros */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por orden, acción o usuario..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <Button variant="outline">
          <Calendar className="mr-2 h-4 w-4" />
          Seleccionar fecha
        </Button>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="success">Exitosos</SelectItem>
            <SelectItem value="error">Errores</SelectItem>
            <SelectItem value="warning">Advertencias</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{auditLogs.length}</p>
              <p className="text-sm text-muted-foreground">Operaciones Totales</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{successToday}</p>
              <p className="text-sm text-muted-foreground">Exitosas Hoy</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{errorsToday}</p>
              <p className="text-sm text-muted-foreground">Errores Hoy</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{avgDuration}s</p>
              <p className="text-sm text-muted-foreground">Duración Promedio</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabla de Auditoría */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Registro de Actividades</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Trazabilidad completa de todas las operaciones ejecutadas
        </p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha y Hora</TableHead>
              <TableHead>ID Pedido</TableHead>
              <TableHead>Acción</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Duración</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Detalles</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  {auditLogs.length === 0 
                    ? "No hay registros de auditoría. Ejecuta el flujo para comenzar."
                    : "No se encontraron registros con los filtros aplicados."}
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-sm">
                    {new Date(item.timestamp).toLocaleString('es-ES')}
                  </TableCell>
                  <TableCell className="font-medium">{item.orderId}</TableCell>
                  <TableCell>{item.action}</TableCell>
                  <TableCell>{item.user}</TableCell>
                  <TableCell>{item.duration}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                    {item.details}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Información Adicional */}
      <Card className="p-6 bg-primary/5">
        <h3 className="text-lg font-semibold mb-2 text-foreground">Retención de Datos de Auditoría</h3>
        <p className="text-sm text-muted-foreground">
          Los registros de auditoría se conservan en localStorage del navegador.
          Los logs pueden exportarse en formato CSV para archivo permanente.
          Todos los datos incluyen timestamp local del navegador.
        </p>
      </Card>
    </div>
  );
};
