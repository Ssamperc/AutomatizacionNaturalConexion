import { LayoutDashboard, Play, CheckCircle, History, Package, BookOpen, ClipboardList, Truck, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

type ViewType = "dashboard" | "workflow" | "validation" | "audit" | "inventory" | "picking" | "despacho" | "reportes" | "documentation";

interface NavigationProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export const Navigation = ({ currentView, onViewChange }: NavigationProps) => {
  const navItems = [
    { id: "dashboard" as ViewType, label: "Panel Principal", icon: LayoutDashboard },
    { id: "workflow" as ViewType, label: "Ejecutar Flujo", icon: Play },
    { id: "validation" as ViewType, label: "Validación", icon: CheckCircle },
    { id: "picking" as ViewType, label: "Picking", icon: ClipboardList },
    { id: "despacho" as ViewType, label: "Despacho", icon: Truck },
    { id: "inventory" as ViewType, label: "Inventario", icon: Package },
    { id: "reportes" as ViewType, label: "Reportes", icon: BarChart3 },
    { id: "audit" as ViewType, label: "Auditoría", icon: History },
    { id: "documentation" as ViewType, label: "Documentación", icon: BookOpen },
  ];

  return (
    <nav className="fixed left-0 top-[73px] h-[calc(100vh-73px)] w-64 bg-card border-r border-border shadow-soft">
      <div className="p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                "hover:bg-accent/10 hover:shadow-soft",
                currentView === item.id
                  ? "bg-primary text-primary-foreground shadow-medium"
                  : "text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
        <div className="bg-natural-blue-gray/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-foreground">Sistema Activo</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Power Automate Desktop v2.0
          </p>
        </div>
      </div>
    </nav>
  );
};
