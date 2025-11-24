import { Card } from "@/components/ui/card";
import { 
  Package, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Activity
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { useOrders } from "@/contexts/OrderContext";

const weekData = [
  { name: "Lun", pedidos: 45, exitos: 43, errores: 2 },
  { name: "Mar", pedidos: 52, exitos: 50, errores: 2 },
  { name: "Mié", pedidos: 61, exitos: 60, errores: 1 },
  { name: "Jue", pedidos: 48, exitos: 47, errores: 1 },
  { name: "Vie", pedidos: 70, exitos: 68, errores: 2 },
  { name: "Sáb", pedidos: 38, exitos: 38, errores: 0 },
  { name: "Dom", pedidos: 25, exitos: 25, errores: 0 },
];

const timeData = [
  { hora: "08:00", tiempo: 45 },
  { hora: "10:00", tiempo: 38 },
  { hora: "12:00", tiempo: 42 },
  { hora: "14:00", tiempo: 35 },
  { hora: "16:00", tiempo: 40 },
  { hora: "18:00", tiempo: 43 },
];

export const Dashboard = () => {
  const { getOrderStats, auditLogs, orders } = useOrders();
  const stats = getOrderStats();
  const completados = orders.filter(o => o.estado === 'entregado' || o.estado === 'despachado').length;
  
  const successRate = stats.total > 0 ? ((stats.procesados / stats.total) * 100).toFixed(1) : '0';
  const avgTime = auditLogs.length > 0 
    ? (auditLogs.reduce((sum, log) => sum + parseFloat(log.duration), 0) / auditLogs.length).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Panel de Control</h1>
        <p className="text-muted-foreground">
          Monitoreo en tiempo real del sistema de automatización WordPress-SAG
        </p>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Pedidos</p>
              <p className="text-3xl font-bold text-foreground mt-2">{stats.total}</p>
              <p className="text-xs text-muted-foreground mt-1">Pedidos cargados</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Package className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Procesados</p>
              <p className="text-3xl font-bold text-foreground mt-2">{completados}</p>
              <p className="text-xs text-success mt-1">{stats.total > 0 ? ((completados / stats.total) * 100).toFixed(1) : '0'}% tasa de éxito</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
              <p className="text-3xl font-bold text-foreground mt-2">{stats.pendientes}</p>
              <p className="text-xs text-muted-foreground mt-1">En cola de procesamiento</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-warning" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Con Errores</p>
              <p className="text-3xl font-bold text-foreground mt-2">{stats.errores}</p>
              <p className="text-xs text-destructive mt-1">Requieren atención</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
          </div>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Rendimiento Semanal</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Pedidos procesados vs. errores por día
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weekData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="exitos" fill="hsl(var(--primary))" name="Exitosos" radius={[8, 8, 0, 0]} />
              <Bar dataKey="errores" fill="hsl(var(--destructive))" name="Errores" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-accent" />
            <h3 className="text-lg font-semibold text-foreground">Tiempo de Procesamiento</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Promedio en segundos por hora del día
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="hora" 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Line 
                type="monotone" 
                dataKey="tiempo" 
                stroke="hsl(var(--accent))" 
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--accent))', r: 5 }}
                name="Tiempo (seg)"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Estado del Sistema */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Estado de Conexiones del Sistema</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Integraciones activas y su estado actual
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div>
              <p className="font-medium text-foreground">WordPress / WooCommerce</p>
              <p className="text-sm text-muted-foreground">API v3.0</p>
            </div>
            <div className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium">
              Conectado
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-success/5 rounded-lg border border-success/20">
            <div>
              <p className="font-medium text-foreground">Sistema SAG</p>
              <p className="text-sm text-muted-foreground">RPA Desktop</p>
            </div>
            <div className="px-3 py-1 rounded-full bg-success text-white text-sm font-medium">
              Activo
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-accent/5 rounded-lg border border-accent/20">
            <div>
              <p className="font-medium text-foreground">Microsoft Outlook</p>
              <p className="text-sm text-muted-foreground">SMTP</p>
            </div>
            <div className="px-3 py-1 rounded-full bg-accent text-white text-sm font-medium">
              Operativo
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
