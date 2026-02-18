import { useContextoOrcamento } from "@/contextos/ContextoOrcamento";
import { Link } from "react-router-dom";
import { FileText, Ruler, TrendingUp, AlertCircle } from "lucide-react";

export default function Dashboard() {
  const { budgets, measurements } = useContextoOrcamento();

  const totalBudgets = budgets.length;
  const openBudgets = budgets.filter(b => b.status === "Aberto").length;
  const totalValue = budgets.reduce((s, b) => s + b.totalValue, 0);
  const totalMeasured = measurements.filter(m => m.status === "Validada").reduce((s, m) => s + m.value, 0);
  const openMeasurements = measurements.filter(m => m.status === "Aberta").length;

  const stats = [
    { label: "Orçamentos", value: totalBudgets, sub: `${openBudgets} aberto(s)`, icon: FileText, color: "bg-primary/10 text-primary" },
    { label: "Valor Total", value: `R$ ${totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, sub: "em orçamentos", icon: TrendingUp, color: "bg-accent/10 text-accent" },
    { label: "Medições", value: measurements.length, sub: `${openMeasurements} aberta(s)`, icon: Ruler, color: "bg-success/10 text-success" },
    { label: "Valor Medido", value: `R$ ${totalMeasured.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, sub: "validado", icon: TrendingUp, color: "bg-primary/10 text-primary" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Visão geral dos orçamentos e medições</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-card rounded-lg border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Orçamentos Recentes</h2>
            <Link to="/orcamentos" className="text-sm text-accent hover:underline">Ver todos</Link>
          </div>
          {budgets.length === 0 ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm py-8 justify-center">
              <AlertCircle className="w-4 h-4" />
              Nenhum orçamento cadastrado
            </div>
          ) : (
            <div className="space-y-2">
              {budgets.slice(0, 5).map(b => (
                <Link key={b.id} to={`/orcamentos/${b.id}`} className="flex items-center justify-between p-3 rounded-md hover:bg-secondary transition-colors">
                  <div>
                    <p className="text-sm font-medium mono">{b.protocolNumber}</p>
                    <p className="text-xs text-muted-foreground">{b.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">R$ {b.totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${b.status === "Aberto" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                      {b.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card rounded-lg border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Medições Recentes</h2>
            <Link to="/medicoes" className="text-sm text-accent hover:underline">Ver todas</Link>
          </div>
          {measurements.length === 0 ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm py-8 justify-center">
              <AlertCircle className="w-4 h-4" />
              Nenhuma medição cadastrada
            </div>
          ) : (
            <div className="space-y-2">
              {measurements.slice(0, 5).map(m => {
                const budget = budgets.find(b => b.id === m.budgetId);
                return (
                  <Link key={m.id} to={`/medicoes/${m.id}`} className="flex items-center justify-between p-3 rounded-md hover:bg-secondary transition-colors">
                    <div>
                      <p className="text-sm font-medium mono">{m.measurementNumber}</p>
                      <p className="text-xs text-muted-foreground">{budget?.protocolNumber ?? "—"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">R$ {m.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${m.status === "Aberta" ? "bg-accent/10 text-accent" : "bg-success/10 text-success"}`}>
                        {m.status}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
