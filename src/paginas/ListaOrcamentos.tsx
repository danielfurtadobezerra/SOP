import { useContextoOrcamento } from "@/contextos/ContextoOrcamento";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, FileText } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function BudgetList() {
  const { budgets } = useContextoOrcamento();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = budgets.filter(b =>
    b.protocolNumber.toLowerCase().includes(search.toLowerCase()) ||
    b.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Orçamentos</h1>
          <p className="text-sm text-muted-foreground mt-1">{budgets.length} orçamento(s) cadastrado(s)</p>
        </div>
        <Button onClick={() => navigate("/orcamentos/novo")} className="gap-2">
          <Plus className="w-4 h-4" /> Novo Orçamento
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por protocolo ou tipo..."
          className="pl-9"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{search ? "Nenhum resultado encontrado." : "Nenhum orçamento cadastrado."}</p>
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Protocolo</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tipo</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Valor Total</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Itens</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Data</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => navigate(`/orcamentos/${b.id}`)}>
                    <td className="px-4 py-3 font-medium mono">{b.protocolNumber}</td>
                    <td className="px-4 py-3 text-muted-foreground">{b.type}</td>
                    <td className="px-4 py-3 text-right font-medium">R$ {b.totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-center">{b.items.length}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${b.status === "Aberto" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(b.createdAt).toLocaleDateString("pt-BR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
