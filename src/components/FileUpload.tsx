import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { Order, useOrders } from "@/contexts/OrderContext";
import { useInventory, Product } from "@/contexts/InventoryContext";

export const FileUpload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addOrders } = useOrders();
  const { products, updateProduct, addProduct } = useInventory();

  const processExcelFile = async (file: File) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        toast.error('El archivo Excel está vacío');
        return 0;
      }

      const orders: Order[] = [];
      const inventoryWarnings: string[] = [];
      const productsToCreate: Array<{sku: string, nombre: string}> = [];

      for (let index = 0; index < jsonData.length; index++) {
        const row: any = jsonData[index];
        
        // Leer las columnas específicas del Excel
        const idPedido = row['ID_Pedido'] || row['id_pedido'] || `ORD-${Date.now()}-${index}`;
        const fechaPedido = row['Fecha_Pedido'] || row['fecha_pedido'] || new Date().toISOString().split('T')[0];
        const nombreCliente = row['Nombre_Cliente'] || row['nombre_cliente'] || 'Cliente Desconocido';
        const correoCliente = row['Correo_Cliente'] || row['correo_cliente'] || '';
        const direccionEnvio = row['Direccion_Envio'] || row['direccion_envio'] || '';
        const sku = row['SKU'] || row['sku'] || '';
        const nombreProducto = row['Nombre_Producto'] || row['nombre_producto'] || 'Producto sin nombre';
        const cantidad = parseInt(row['Cantidad'] || row['cantidad'] || '1');
        const precioUnitario = parseFloat(row['Precio_Unitario'] || row['precio_unitario'] || '0');
        const valorTotal = parseFloat(row['Valor_Total'] || row['valor_total'] || '0');

        // Buscar el producto en el inventario por SKU
        const productInInventory = products.find(p => p.codigo.toLowerCase() === sku.toLowerCase());
        
        if (productInInventory) {
          if (productInInventory.stock >= cantidad) {
            // Restar del inventario
            updateProduct(productInInventory.id, {
              stock: productInInventory.stock - cantidad
            });
          } else {
            // Marcar stock insuficiente pero restar lo que hay
            inventoryWarnings.push(
              `${nombreProducto} (${sku}): Stock insuficiente (Disponible: ${productInInventory.stock}, Pedido: ${cantidad})`
            );
            updateProduct(productInInventory.id, {
              stock: Math.max(0, productInInventory.stock - cantidad)
            });
          }
        } else if (sku) {
          // Producto no existe - agregarlo a la lista para crear
          inventoryWarnings.push(`${nombreProducto} (${sku}): Producto no encontrado - se creará en inventario con stock faltante`);
          productsToCreate.push({sku, nombre: nombreProducto});
        }

        orders.push({
          id: `order-${Date.now()}-${index}`,
          numeroOrden: String(idPedido),
          fecha: String(fechaPedido),
          cliente: String(nombreCliente),
          producto: `${nombreProducto}`,
          cantidad: isNaN(cantidad) ? 1 : cantidad,
          precio: isNaN(precioUnitario) ? 0 : precioUnitario,
          total: isNaN(valorTotal) ? 0 : valorTotal,
          estado: 'pendiente' as const,
          email: String(correoCliente),
          direccion: String(direccionEnvio),
          telefono: '',
          notas: `SKU: ${sku}`,
          sku: sku,
        });
      }

      addOrders(orders);
      
      // Crear productos faltantes en el inventario
      for (const productToCreate of productsToCreate) {
        addProduct({
          codigo: productToCreate.sku,
          nombre: productToCreate.nombre,
          descripcion: 'Producto importado desde Excel - Stock faltante',
          categoria: 'Importados',
          precio: 0,
          stock: 0,
          stockMinimo: 10,
          proveedor: 'Por definir',
        });
      }
      
      if (inventoryWarnings.length > 0) {
        toast.warning(`${orders.length} pedidos cargados. ${inventoryWarnings.length} advertencias de inventario`, {
          description: inventoryWarnings.slice(0, 3).join('\n') + (inventoryWarnings.length > 3 ? '\n...' : ''),
          duration: 6000,
        });
      } else {
        toast.success(`${orders.length} pedidos cargados e inventario actualizado exitosamente`);
      }
      
      console.log('Pedidos procesados:', orders);
      console.log('Advertencias de inventario:', inventoryWarnings);
      console.log('Productos creados:', productsToCreate);
      return orders.length;
    } catch (error) {
      console.error('Error procesando archivo:', error);
      toast.error('Error al procesar el archivo Excel. Verifica el formato.');
      return 0;
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv'))) {
      setUploadedFile(file);
      await processExcelFile(file);
    } else {
      toast.error('Por favor sube un archivo Excel (.xlsx, .xls) o CSV');
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      await processExcelFile(file);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Cargar Archivo de Pedidos</h3>
      
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging 
            ? 'border-primary bg-primary/5' 
            : 'border-border bg-muted/20'
        }`}
      >
        {!uploadedFile ? (
          <>
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-2">
              Arrastra y suelta tu archivo aquí, o
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
            >
              Seleccionar archivo
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              Formatos soportados: .xlsx, .xls, .csv
            </p>
          </>
        ) : (
          <div className="flex items-center justify-between bg-background p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-8 w-8 text-primary" />
              <div className="text-left">
                <p className="font-medium text-foreground">{uploadedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(uploadedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={removeFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
