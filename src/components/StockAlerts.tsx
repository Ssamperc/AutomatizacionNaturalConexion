import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ShoppingCart, TrendingDown, Package } from "lucide-react";
import { useInventory } from "@/contexts/InventoryContext";
import { useOrders } from "@/contexts/OrderContext";
import { toast } from "sonner";

interface StockRequirement {
  sku: string;
  nombre: string;
  stockActual: number;
  necesario: number;
  faltante: number;
}

export const StockAlerts = () => {
  const { products, updateProduct } = useInventory();
  const { orders } = useOrders();

  // Calcular stock necesario para pedidos pendientes y en curso
  const calculateStockRequirements = (): StockRequirement[] => {
    const requirements = new Map<string, StockRequirement>();

    // Filtrar solo pedidos que necesitan inventario
    const activeOrders = orders.filter(
      order => ['pendiente', 'en_curso', 'preparado'].includes(order.estado)
    );

    activeOrders.forEach(order => {
      if (!order.sku) return;

      const product = products.find(p => p.codigo === order.sku);
      if (!product) return;

      if (requirements.has(order.sku)) {
        const current = requirements.get(order.sku)!;
        current.necesario += order.cantidad;
      } else {
        requirements.set(order.sku, {
          sku: order.sku,
          nombre: product.nombre,
          stockActual: product.stock,
          necesario: order.cantidad,
          faltante: 0,
        });
      }
    });

    // Calcular faltantes
    const result: StockRequirement[] = [];
    requirements.forEach(req => {
      req.faltante = Math.max(0, req.necesario - req.stockActual);
      if (req.faltante > 0 || req.stockActual <= 0) {
        result.push(req);
      }
    });

    return result.sort((a, b) => b.faltante - a.faltante);
  };

  const stockRequirements = calculateStockRequirements();
  const criticalProducts = products.filter(p => p.stock === 0);
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= p.stockMinimo);

  const handleGeneratePurchaseOrder = () => {
    if (stockRequirements.length === 0) {
      toast.info("No hay productos faltantes en este momento");
      return;
    }

    // Generar reporte de compra
    const report = stockRequirements.map(req => 
      `${req.nombre} (${req.sku}): ${req.faltante} unidades`
    ).join('\n');

    // Copiar al portapapeles
    navigator.clipboard.writeText(report).then(() => {
      toast.success("Orden de compra copiada al portapapeles", {
        description: "Puedes enviarla a tus proveedores"
      });
    });
  };

  const handleQuickRestock = (sku: string, quantity: number) => {
    const product = products.find(p => p.codigo === sku);
    if (!product) return;

    updateProduct(product.id, {
      stock: product.stock + quantity
    });

    toast.success(`Stock actualizado: +${quantity} unidades de ${product.nombre}`);
  };

  return (
    <div className="space-y-6">
      {/* Resumen de Alertas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-destructive/50 bg-destructive/5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">{criticalProducts.length}</h3>
              <p className="text-sm text-muted-foreground">Sin Stock</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-warning/50 bg-warning/5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-warning" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">{lowStockProducts.length}</h3>
              <p className="text-sm text-muted-foreground">Stock Bajo</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-primary/50 bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">{stockRequirements.length}</h3>
              <p className="text-sm text-muted-foreground">Requieren Reposición</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Stock Necesario para Pedidos */}
      {stockRequirements.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Stock Necesario para Pedidos Activos
              </h3>
              <p className="text-sm text-muted-foreground">
                Productos que necesitan reposición urgente para completar pedidos
              </p>
            </div>
            <Button onClick={handleGeneratePurchaseOrder} size="sm">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Generar Orden de Compra
            </Button>
          </div>

          <div className="space-y-3">
            {stockRequirements.map((req) => (
              <div
                key={req.sku}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-foreground">{req.nombre}</h4>
                    <Badge variant="outline" className="font-mono text-xs">
                      {req.sku}
                    </Badge>
                    {req.faltante > 0 && (
                      <Badge variant="destructive">
                        Faltan {req.faltante} unidades
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <span className="text-muted-foreground">Stock actual: </span>
                      <span className={req.stockActual === 0 ? "text-destructive font-semibold" : "font-medium"}>
                        {req.stockActual}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Necesario: </span>
                      <span className="font-medium text-primary">{req.necesario}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Faltante: </span>
                      <span className="font-semibold text-destructive">{req.faltante}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleQuickRestock(req.sku, Math.ceil(req.faltante * 1.2))}
                  >
                    Reabastecer +{Math.ceil(req.faltante * 1.2)}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Productos Críticos (Sin Stock) */}
      {criticalProducts.length > 0 && (
        <Card className="p-6 border-destructive/50">
          <h3 className="text-lg font-semibold text-destructive mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Productos Sin Stock - Acción Requerida
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {criticalProducts.map((product) => (
              <div
                key={product.id}
                className="p-4 rounded-lg border border-destructive/30 bg-destructive/5"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-foreground">{product.nombre}</h4>
                    <p className="text-xs text-muted-foreground font-mono">{product.codigo}</p>
                  </div>
                  <Badge variant="destructive">0 Stock</Badge>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => handleQuickRestock(product.codigo, product.stockMinimo * 2)}
                >
                  Reabastecer {product.stockMinimo * 2}
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Stock Bajo */}
      {lowStockProducts.length > 0 && (
        <Card className="p-6 border-warning/50">
          <h3 className="text-lg font-semibold text-warning mb-4 flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Productos con Stock Bajo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {lowStockProducts.map((product) => (
              <div
                key={product.id}
                className="p-3 rounded-lg border border-warning/30 bg-warning/5"
              >
                <h4 className="font-medium text-foreground text-sm mb-1">{product.nombre}</h4>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Stock:</span>
                  <span className="font-semibold text-warning">
                    {product.stock} / {product.stockMinimo}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Estado OK */}
      {stockRequirements.length === 0 && criticalProducts.length === 0 && lowStockProducts.length === 0 && (
        <Card className="p-8 text-center border-success/50 bg-success/5">
          <div className="flex flex-col items-center gap-3">
            <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
              <Package className="h-8 w-8 text-success" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                ¡Todo en Orden!
              </h3>
              <p className="text-muted-foreground">
                No hay alertas de stock en este momento. Todos los productos tienen stock suficiente.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
