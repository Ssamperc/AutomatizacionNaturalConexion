import { BookOpen, FileText, Code, Users, Target, TrendingUp, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const Documentation = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Documentación del Proyecto</h2>
        <p className="text-muted-foreground">
          Proyecto de Automatización Empresarial - Natural Conexión
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="problem">Problema</TabsTrigger>
          <TabsTrigger value="solution">Solución</TabsTrigger>
          <TabsTrigger value="technical">Técnico</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
        </TabsList>

        {/* Resumen Ejecutivo */}
        <TabsContent value="overview" className="space-y-6">
          <Card className="shadow-medium">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary rounded-lg">
                  <BookOpen className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl">Resumen Ejecutivo</CardTitle>
              </div>
              <CardDescription>
                Automatización de procesos operativos mediante RPA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Contexto del Proyecto</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Natural Conexión, empresa dedicada a la manufactura y comercialización de productos 
                  cosméticos naturales, identificó una oportunidad crítica de optimización en su área 
                  de bodega y logística. El análisis del mapa de procesos reveló ineficiencias 
                  significativas en la gestión de pedidos provenientes de su plataforma e-commerce, 
                  donde cada transacción requería digitación manual en el sistema comercial SAG.
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Objetivo General
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Implementar una solución RPA que automatice la integración entre WordPress/WooCommerce 
                    y el sistema comercial SAG, eliminando la digitación manual y reduciendo errores operativos.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-secondary" />
                    Alcance
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Robot RPA desarrollado en Power Automate Desktop que integra WordPress, archivos Excel, 
                    sistema SAG y Microsoft Outlook para la gestión automatizada de pedidos.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-secondary/10 rounded-lg">
                  <p className="text-2xl font-bold text-secondary">70%</p>
                  <p className="text-sm text-muted-foreground mt-1">Reducción en tiempo</p>
                </div>
                <div className="p-4 bg-accent/10 rounded-lg">
                  <p className="text-2xl font-bold text-accent">98.2%</p>
                  <p className="text-sm text-muted-foreground mt-1">Tasa de éxito</p>
                </div>
                <div className="p-4 bg-primary/10 rounded-lg">
                  <p className="text-2xl font-bold text-primary">24/7</p>
                  <p className="text-sm text-muted-foreground mt-1">Disponibilidad</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Análisis del Problema */}
        <TabsContent value="problem" className="space-y-6">
          <Card className="shadow-medium">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-destructive rounded-lg">
                  <AlertCircle className="h-6 w-6 text-destructive-foreground" />
                </div>
                <CardTitle className="text-2xl">Diagnóstico y Análisis del Problema</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Problema Central</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  El área de bodega de Natural Conexión enfrenta una sobrecarga operativa derivada de procesos 
                  manuales que impactan negativamente la eficiencia y calidad del servicio. Cada pedido generado 
                  en la plataforma WordPress/WooCommerce requiere que un operario transcriba manualmente toda 
                  la información al sistema comercial SAG, generando un cuello de botella crítico en la cadena 
                  de valor.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Causas Identificadas</h3>
                {[
                  {
                    title: "Ausencia de Integración Automática",
                    desc: "No existe conectividad nativa entre WordPress/WooCommerce y SAG, obligando a procesos manuales.",
                  },
                  {
                    title: "Dependencia de Registros Manuales",
                    desc: "Los datos se exportan a Excel y luego se digitan manualmente en SAG, multiplicando puntos de error.",
                  },
                  {
                    title: "Falta de Herramientas RPA",
                    desc: "Ausencia de automatización robótica para tareas repetitivas y estandarizadas.",
                  },
                  {
                    title: "Flujos No Estandarizados",
                    desc: "Variabilidad en los procedimientos según el operario, sin documentación formal.",
                  },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 bg-card border border-border rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Consecuencias</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { icon: "⏱️", label: "Retrasos Operativos", value: "5 min/pedido" },
                    { icon: "❌", label: "Errores de Digitación", value: "~15% registros" },
                    { icon: "📊", label: "Pérdida de Trazabilidad", value: "Sin auditoría" },
                    { icon: "😰", label: "Carga de Trabajo", value: "Alta presión" },
                    { icon: "📉", label: "Insatisfacción Cliente", value: "Demoras envío" },
                    { icon: "💰", label: "Costos Operativos", value: "Elevados" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-destructive/5 rounded-lg">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <p className="font-medium text-foreground text-sm">{item.label}</p>
                        <p className="text-xs text-destructive">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Solución Propuesta */}
        <TabsContent value="solution" className="space-y-6">
          <Card className="shadow-medium">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-secondary rounded-lg">
                  <Target className="h-6 w-6 text-secondary-foreground" />
                </div>
                <CardTitle className="text-2xl">Solución Implementada</CardTitle>
              </div>
              <CardDescription>
                Sistema de Automatización RPA con Power Automate Desktop
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Descripción de la Solución</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Se desarrolló un robot de automatización robótica de procesos (RPA) utilizando Microsoft 
                  Power Automate Desktop, que ejecuta de forma automática y desatendida la integración completa 
                  entre la plataforma e-commerce y el sistema comercial, incluyendo validación de datos, 
                  actualización de inventarios y notificación a clientes.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Componentes del Sistema</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      step: "1. Lectura Automática",
                      desc: "Importación de pedidos desde WordPress/WooCommerce en formato CSV o Excel",
                      tech: "Power Automate Desktop + Excel Connector",
                    },
                    {
                      step: "2. Validación de Datos",
                      desc: "Verificación automática de campos obligatorios y coherencia de información",
                      tech: "Reglas de negocio programadas",
                    },
                    {
                      step: "3. Ingreso Automático SAG",
                      desc: "Digitación robótica en el sistema comercial mediante simulación de interfaz",
                      tech: "UI Automation + Computer Vision",
                    },
                    {
                      step: "4. Actualización de Estado",
                      desc: "Registro en base de datos local para trazabilidad y auditoría",
                      tech: "SQL Database Connector",
                    },
                    {
                      step: "5. Notificación al Cliente",
                      desc: "Envío automático de correo de confirmación con detalles del pedido",
                      tech: "Outlook SMTP Integration",
                    },
                    {
                      step: "6. Generación de Logs",
                      desc: "Creación de registros de auditoría con timestamp y detalles de ejecución",
                      tech: "File System + JSON Logs",
                    },
                  ].map((item, idx) => (
                    <div key={idx} className="p-4 bg-card border-2 border-primary/20 rounded-lg">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{item.step}</h4>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{item.desc}</p>
                      <Badge variant="outline" className="text-xs">
                        {item.tech}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-secondary/10 rounded-lg border-2 border-secondary">
                <h3 className="text-lg font-semibold text-foreground mb-4">Beneficios Obtenidos</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-3xl font-bold text-secondary mb-1">70%</p>
                    <p className="text-sm text-muted-foreground">Reducción tiempo de digitación</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-secondary mb-1">85%</p>
                    <p className="text-sm text-muted-foreground">Disminución de errores</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-secondary mb-1">100%</p>
                    <p className="text-sm text-muted-foreground">Trazabilidad de operaciones</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Especificaciones Técnicas */}
        <TabsContent value="technical" className="space-y-6">
          <Card className="shadow-medium">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-accent rounded-lg">
                  <Code className="h-6 w-6 text-accent-foreground" />
                </div>
                <CardTitle className="text-2xl">Arquitectura Técnica</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Stack Tecnológico</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { tech: "Power Automate Desktop", type: "RPA Engine" },
                    { tech: "WordPress/WooCommerce", type: "E-commerce" },
                    { tech: "Microsoft Excel", type: "Data Processing" },
                    { tech: "Sistema SAG", type: "ERP Comercial" },
                    { tech: "Microsoft Outlook", type: "Email Service" },
                    { tech: "SQL Database", type: "Auditoría" },
                    { tech: "JSON", type: "Logging Format" },
                    { tech: "CSV", type: "Data Exchange" },
                  ].map((item, idx) => (
                    <div key={idx} className="p-4 bg-card border border-border rounded-lg text-center">
                      <p className="font-semibold text-foreground text-sm mb-1">{item.tech}</p>
                      <Badge variant="outline" className="text-xs">{item.type}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Matriz RACI</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 font-semibold">Actividad</th>
                        <th className="text-center p-3 font-semibold">Robot RPA</th>
                        <th className="text-center p-3 font-semibold">Operario</th>
                        <th className="text-center p-3 font-semibold">Supervisor</th>
                        <th className="text-center p-3 font-semibold">IT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { task: "Lectura de pedidos", rpa: "R", op: "I", sup: "A", it: "C" },
                        { task: "Validación de datos", rpa: "R", op: "C", sup: "A", it: "I" },
                        { task: "Ingreso a SAG", rpa: "R", op: "I", sup: "A", it: "C" },
                        { task: "Manejo de errores", rpa: "I", op: "R", sup: "A", it: "C" },
                        { task: "Envío notificaciones", rpa: "R", op: "I", sup: "A", it: "C" },
                        { task: "Auditoría y logs", rpa: "R", op: "I", sup: "A", it: "R" },
                        { task: "Mantenimiento sistema", rpa: "I", op: "I", sup: "C", it: "R" },
                      ].map((row, idx) => (
                        <tr key={idx} className="border-b border-border hover:bg-accent/5">
                          <td className="p-3 font-medium">{row.task}</td>
                          <td className="p-3 text-center">
                            <Badge variant={row.rpa === "R" ? "default" : "outline"}>{row.rpa}</Badge>
                          </td>
                          <td className="p-3 text-center">
                            <Badge variant={row.op === "R" ? "default" : "outline"}>{row.op}</Badge>
                          </td>
                          <td className="p-3 text-center">
                            <Badge variant={row.sup === "A" ? "default" : "outline"}>{row.sup}</Badge>
                          </td>
                          <td className="p-3 text-center">
                            <Badge variant={row.it === "R" ? "default" : "outline"}>{row.it}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
                  <span><strong>R:</strong> Responsable</span>
                  <span><strong>A:</strong> Aprobador</span>
                  <span><strong>C:</strong> Consultado</span>
                  <span><strong>I:</strong> Informado</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Métricas e Indicadores */}
        <TabsContent value="metrics" className="space-y-6">
          <Card className="shadow-medium">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary rounded-lg">
                  <TrendingUp className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl">Indicadores de Éxito</CardTitle>
              </div>
              <CardDescription>
                KPIs y métricas de rendimiento del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Métricas Operativas</h3>
                  {[
                    { metric: "Tiempo de procesamiento", before: "~5 min", after: "~41 seg", improvement: "86%" },
                    { metric: "Tasa de error", before: "15%", after: "1.8%", improvement: "88%" },
                    { metric: "Pedidos por hora", before: "12", after: "87", improvement: "625%" },
                    { metric: "Disponibilidad", before: "8h/día", after: "24h/día", improvement: "200%" },
                  ].map((item, idx) => (
                    <div key={idx} className="p-4 bg-card border border-border rounded-lg">
                      <h4 className="font-medium text-foreground mb-3">{item.metric}</h4>
                      <div className="grid grid-cols-3 gap-2 text-center text-sm">
                        <div>
                          <p className="text-destructive font-bold">{item.before}</p>
                          <p className="text-xs text-muted-foreground">Antes</p>
                        </div>
                        <div>
                          <p className="text-secondary font-bold">{item.after}</p>
                          <p className="text-xs text-muted-foreground">Después</p>
                        </div>
                        <div>
                          <p className="text-accent font-bold">+{item.improvement}</p>
                          <p className="text-xs text-muted-foreground">Mejora</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Impacto de Negocio</h3>
                  {[
                    { 
                      title: "ROI Estimado", 
                      value: "280%", 
                      desc: "Retorno de inversión en 12 meses",
                      color: "text-secondary"
                    },
                    { 
                      title: "Ahorro Anual", 
                      value: "$48M COP", 
                      desc: "Reducción de costos operativos",
                      color: "text-primary"
                    },
                    { 
                      title: "Satisfacción Cliente", 
                      value: "92%", 
                      desc: "Incremento en NPS score",
                      color: "text-accent"
                    },
                    { 
                      title: "Escalabilidad", 
                      value: "500%", 
                      desc: "Capacidad de crecimiento sin recursos adicionales",
                      color: "text-secondary"
                    },
                  ].map((item, idx) => (
                    <div key={idx} className="p-4 bg-gradient-subtle rounded-lg border border-border">
                      <h4 className="font-medium text-foreground mb-1">{item.title}</h4>
                      <p className={`text-3xl font-bold ${item.color} mb-2`}>{item.value}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Análisis de Riesgos Mitigados</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { 
                      risk: "Errores de digitación", 
                      mitigation: "Validación automática multi-nivel",
                      status: "Controlado"
                    },
                    { 
                      risk: "Pérdida de pedidos", 
                      mitigation: "Sistema de logs y backup automático",
                      status: "Controlado"
                    },
                    { 
                      risk: "Fallas de conectividad", 
                      mitigation: "Reintento automático y alertas",
                      status: "Monitoreado"
                    },
                    { 
                      risk: "Cambios en UI de SAG", 
                      mitigation: "Detección de cambios y notificación IT",
                      status: "Monitoreado"
                    },
                  ].map((item, idx) => (
                    <div key={idx} className="p-4 bg-card border-l-4 border-l-secondary rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-foreground">{item.risk}</h4>
                        <Badge variant="outline" className="bg-secondary/20 text-secondary">
                          {item.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.mitigation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
