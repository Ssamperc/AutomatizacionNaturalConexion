import { useState } from "react";
import { Dashboard } from "@/components/Dashboard";
import { WorkflowExecution } from "@/components/WorkflowExecution";
import { ValidationScreen } from "@/components/ValidationScreen";
import { AuditHistory } from "@/components/AuditHistory";
import { Documentation } from "@/components/Documentation";
import { Inventory } from "@/components/Inventory";
import { Picking } from "@/components/Picking";
import { Despacho } from "@/components/Despacho";
import { Reportes } from "@/components/Reportes";
import { Navigation } from "@/components/Navigation";
import { Header } from "@/components/Header";

type ViewType = "dashboard" | "workflow" | "validation" | "audit" | "inventory" | "picking" | "despacho" | "reportes" | "documentation";

const Index = () => {
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard />;
      case "workflow":
        return <WorkflowExecution />;
      case "validation":
        return <ValidationScreen />;
      case "audit":
        return <AuditHistory />;
      case "inventory":
        return <Inventory />;
      case "picking":
        return <Picking />;
      case "despacho":
        return <Despacho />;
      case "reportes":
        return <Reportes />;
      case "documentation":
        return <Documentation />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Navigation currentView={currentView} onViewChange={setCurrentView} />
        <main className="flex-1 ml-64 min-w-0">
          <div className="p-8 max-w-[calc(100vw-16rem)]">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
