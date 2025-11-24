import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Package, 
  Search, 
  Download, 
  Plus, 
  Edit, 
  Trash2,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Bell
} from "lucide-react";
import { useInventory, Product } from "@/contexts/InventoryContext";
import { useOrders } from "@/contexts/OrderContext";
import { StockAlerts } from "@/components/StockAlerts";
import { toast } from "sonner";

export const Inventory = () => {
  const { products, addProduct, updateProduct, deleteProduct, getLowStockProducts } = useInventory();
  const { orders } = useOrders();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    categoria: "",
    precio: "",
    stock: "",
    stockMinimo: "",
    proveedor: "",
  });

  const lowStockProducts = getLowStockProducts();
  const totalValue = products.reduce((sum, p) => sum + (p.precio * p.stock), 0);
  
  const categories = Array.from(new Set(products.map(p => p.categoria))).filter(Boolean);

  // Calcular productos más solicitados
  const getMostRequestedProducts = () => {
    const productCounts = new Map<string, { nombre: string; cantidad: number; sku: string }>();
    
    orders.forEach(order => {
      if (order.sku) {
        const current = productCounts.get(order.sku);
        if (current) {
          current.cantidad += order.cantidad;
        } else {
          productCounts.set(order.sku, {
            sku: order.sku,
            nombre: order.producto,
            cantidad: order.cantidad
          });
        }
      }
    });

    return Array.from(productCounts.values())
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);
  };

  const mostRequestedProducts = getMostRequestedProducts();

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.categoria === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleExport = () => {
    import('xlsx').then((XLSX) => {
      const exportData = products.map(p => ({
        'Código': p.codigo,
        'Nombre': p.nombre,
        'Descripción': p.descripcion,
        'Categoría': p.categoria,
        'Precio': p.precio,
        'Stock': p.stock,
        'Stock Mínimo': p.stockMinimo,
        'Proveedor': p.proveedor,
        'Última Actualización': new Date(p.ultimaActualizacion).toLocaleString('es-ES')
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Inventario');
      XLSX.writeFile(wb, `inventario-${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success("Inventario exportado exitosamente");
    });
  };

  const resetForm = () => {
    setFormData({
      codigo: "",
      nombre: "",
      descripcion: "",
      categoria: "",
      precio: "",
      stock: "",
      stockMinimo: "",
      proveedor: "",
    });
  };

  const handleAdd = () => {
    if (!formData.codigo || !formData.nombre || !formData.precio || !formData.stock) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }

    addProduct({
      codigo: formData.codigo,
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      categoria: formData.categoria,
      precio: parseFloat(formData.precio),
      stock: parseInt(formData.stock),
      stockMinimo: parseInt(formData.stockMinimo) || 10,
      proveedor: formData.proveedor,
    });

    toast.success("Producto agregado exitosamente");
    resetForm();
    setIsAddOpen(false);
  };

  const handleEdit = () => {
    if (!selectedProduct) return;

    updateProduct(selectedProduct.id, {
      codigo: formData.codigo,
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      categoria: formData.categoria,
      precio: parseFloat(formData.precio),
      stock: parseInt(formData.stock),
      stockMinimo: parseInt(formData.stockMinimo),
      proveedor: formData.proveedor,
    });

    toast.success("Producto actualizado exitosamente");
    resetForm();
    setIsEditOpen(false);
    setSelectedProduct(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
      deleteProduct(id);
      toast.success("Producto eliminado exitosamente");
    }
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      codigo: product.codigo,
      nombre: product.nombre,
      descripcion: product.descripcion,
      categoria: product.categoria,
      precio: product.precio.toString(),
      stock: product.stock.toString(),
      stockMinimo: product.stockMinimo.toString(),
      proveedor: product.proveedor,
    });
    setIsEditOpen(true);
  };

  const getStockBadge = (product: Product) => {
    if (product.stock === 0) {
      return <Badge variant="destructive">Sin Stock</Badge>;
    } else if (product.stock <= product.stockMinimo) {
      return <Badge className="bg-warning text-white">Stock Bajo</Badge>;
    } else {
      return <Badge className="bg-success text-white">Disponible</Badge>;
    }
  };

  const pendingOrdersCount = orders.filter(o => ['pendiente', 'en_curso', 'preparado'].includes(o.estado)).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Inventario de Productos</h1>
          <p className="text-muted-foreground">
            Gestión completa del catálogo de productos
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Producto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Producto</DialogTitle>
                <DialogDescription>
                  Completa la información del producto para agregarlo al inventario
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código *</Label>
                  <Input
                    id="codigo"
                    value={formData.codigo}
                    onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                    placeholder="SKU-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    placeholder="Nombre del producto"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    placeholder="Descripción detallada"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoría</Label>
                  <Input
                    id="categoria"
                    value={formData.categoria}
                    onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                    placeholder="Electrónica, Ropa, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proveedor">Proveedor</Label>
                  <Input
                    id="proveedor"
                    value={formData.proveedor}
                    onChange={(e) => setFormData({...formData, proveedor: e.target.value})}
                    placeholder="Nombre del proveedor"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="precio">Precio *</Label>
                  <Input
                    id="precio"
                    type="number"
                    value={formData.precio}
                    onChange={(e) => setFormData({...formData, precio: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stockMinimo">Stock Mínimo</Label>
                  <Input
                    id="stockMinimo"
                    type="number"
                    value={formData.stockMinimo}
                    onChange={(e) => setFormData({...formData, stockMinimo: e.target.value})}
                    placeholder="10"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancelar</Button>
                <Button onClick={handleAdd}>Agregar Producto</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-foreground">{products.length}</h3>
              <p className="text-sm text-muted-foreground">Productos Totales</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-warning" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-foreground">{lowStockProducts.length}</h3>
              <p className="text-sm text-muted-foreground">Stock Bajo</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Bell className="h-6 w-6 text-accent" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-foreground">{pendingOrdersCount}</h3>
              <p className="text-sm text-muted-foreground">Pedidos Activos</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
              <DollarSign className="h-6 w-6 text-success" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-foreground">${totalValue.toLocaleString()}</h3>
              <p className="text-sm text-muted-foreground">Valor Total</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs principales */}
      <Tabs defaultValue="inventory" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="inventory">
            <Package className="mr-2 h-4 w-4" />
            Inventario
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Alertas de Stock
          </TabsTrigger>
          <TabsTrigger value="stats">
            <TrendingUp className="mr-2 h-4 w-4" />
            Estadísticas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por código o nombre..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tabla */}
          <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  {products.length === 0 
                    ? "No hay productos en el inventario. Agrega uno para comenzar."
                    : "No se encontraron productos con los filtros aplicados."}
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-mono font-medium">{product.codigo}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{product.nombre}</p>
                      {product.descripcion && (
                        <p className="text-sm text-muted-foreground truncate max-w-xs">
                          {product.descripcion}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{product.categoria || '-'}</TableCell>
                  <TableCell className="font-semibold">${product.precio.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={product.stock <= product.stockMinimo ? 'text-warning font-semibold' : ''}>
                      {product.stock}
                    </span>
                    <span className="text-muted-foreground text-sm"> / {product.stockMinimo}</span>
                  </TableCell>
                  <TableCell className="text-sm">{product.proveedor || '-'}</TableCell>
                  <TableCell>{getStockBadge(product)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          </Table>
        </Card>
      </TabsContent>

      <TabsContent value="alerts">
        <StockAlerts />
      </TabsContent>

      <TabsContent value="stats" className="space-y-6">
        {/* Productos Más Solicitados */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Productos Más Solicitados
          </h3>
          {mostRequestedProducts.length > 0 ? (
            <div className="space-y-3">
              {mostRequestedProducts.map((product, index) => (
                <div
                  key={product.sku}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                      <span className="font-bold text-primary">#{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{product.nombre}</h4>
                      <p className="text-sm text-muted-foreground font-mono">{product.sku}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-lg px-4 py-1">
                    {product.cantidad} pedidos
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No hay datos de pedidos disponibles
            </p>
          )}
        </Card>

        {/* Resumen por Categorías */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Valor por Categoría
          </h3>
          <div className="space-y-3">
            {categories.map(category => {
              const categoryProducts = products.filter(p => p.categoria === category);
              const categoryValue = categoryProducts.reduce((sum, p) => sum + (p.precio * p.stock), 0);
              const categoryCount = categoryProducts.length;
              
              return (
                <div
                  key={category}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div>
                    <h4 className="font-semibold text-foreground">{category}</h4>
                    <p className="text-sm text-muted-foreground">{categoryCount} productos</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-foreground">
                      ${categoryValue.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {((categoryValue / totalValue) * 100).toFixed(1)}% del total
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </TabsContent>
    </Tabs>

      {/* Dialog de Edición */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Producto</DialogTitle>
            <DialogDescription>
              Modifica la información del producto
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-codigo">Código</Label>
              <Input
                id="edit-codigo"
                value={formData.codigo}
                onChange={(e) => setFormData({...formData, codigo: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-nombre">Nombre</Label>
              <Input
                id="edit-nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-descripcion">Descripción</Label>
              <Textarea
                id="edit-descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-categoria">Categoría</Label>
              <Input
                id="edit-categoria"
                value={formData.categoria}
                onChange={(e) => setFormData({...formData, categoria: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-proveedor">Proveedor</Label>
              <Input
                id="edit-proveedor"
                value={formData.proveedor}
                onChange={(e) => setFormData({...formData, proveedor: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-precio">Precio</Label>
              <Input
                id="edit-precio"
                type="number"
                value={formData.precio}
                onChange={(e) => setFormData({...formData, precio: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-stock">Stock</Label>
              <Input
                id="edit-stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-stockMinimo">Stock Mínimo</Label>
              <Input
                id="edit-stockMinimo"
                type="number"
                value={formData.stockMinimo}
                onChange={(e) => setFormData({...formData, stockMinimo: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleEdit}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
