import { useContextoOrcamento } from "@/contextos/ContextoOrcamento";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Ruler } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function MeasurementList() {
  const { measurements, budgets } = useContextoOrcamento();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = measurements.filter(m =>
    m.measurementNumber.toLowerCase().includes(search.toLowerCase()) ||
    budgets.find(b => b.id === m.budgetId)?.protocolNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Medições</h1>
          <p className="text-sm text-muted-foreground mt-1">{measurements.length} medição(ões) cadastrada(s)</p>
        </div>
        <Button onClick={() => navigate("/medicoes/nova")} className="gap-2">
          <Plus className="w-4 h-4" /> Nova Medição
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar por número ou protocolo..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Ruler className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{search ? "Nenhum resultado encontrado." : "Nenhuma medição cadastrada."}</p>
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nº Medição</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Orçamento</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Valor</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Itens</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Data</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => {
                  const budget = budgets.find(b => b.id === m.budgetId);
                  return (
                    <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => navigate(`/medicoes/${m.id}`)}>
                      <td className="px-4 py-3 font-medium mono">{m.measurementNumber}</td>
                      <td className="px-4 py-3 text-muted-foreground mono">{budget?.protocolNumber ?? "—"}</td>
                      <td className="px-4 py-3 text-right font-medium">R$ {m.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-center">{m.items.length}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${m.status === "Aberta" ? "bg-accent/10 text-accent" : "bg-success/10 text-success"}`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(m.date).toLocaleDateString("pt-BR")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
