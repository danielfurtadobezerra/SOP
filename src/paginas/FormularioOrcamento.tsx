import { useContextoOrcamento } from "@/contextos/ContextoOrcamento";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { TipoOrcamento } from "@/tipos/orcamento";
import { toast } from "sonner";

const budgetTypes: TipoOrcamento[] = ["Obra de Edificação", "Obra de Rodovias", "Outros"];

export default function BudgetForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { budgets, addBudget, updateBudget } = useContextoOrcamento();

  const [protocolNumber, setProtocolNumber] = useState("");
  const [type, setType] = useState<TipoOrcamento>("Obra de Edificação");
  const [totalValue, setTotalValue] = useState("");

  useEffect(() => {
    if (isEdit) {
      const b = budgets.find(b => b.id === id);
      if (b) {
        setProtocolNumber(b.protocolNumber);
        setType(b.type);
        setTotalValue(b.totalValue.toString());
      }
    }
  }, [id, isEdit, budgets]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(totalValue);
    if (!protocolNumber.trim()) { toast.error("Informe o número do protocolo."); return; }
    if (isNaN(val) || val <= 0) { toast.error("Informe um valor total válido."); return; }

    if (isEdit) {
      const result = updateBudget(id!, { protocolNumber: protocolNumber.trim(), type, totalValue: val });
      if (typeof result === "object" && "error" in result) { toast.error(result.error); return; }
      toast.success("Orçamento atualizado com sucesso!");
      navigate(`/orcamentos/${id}`);
    } else {
      const result = addBudget({ protocolNumber: protocolNumber.trim(), type, totalValue: val });
      if (typeof result === "object" && "error" in result) { toast.error(result.error); return; }
      toast.success("Orçamento criado com sucesso!");
      navigate(`/orcamentos/${result}`);
    }
  };

  return (
    <div className="max-w-lg space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>
      <h1 className="text-2xl font-bold">{isEdit ? "Editar Orçamento" : "Novo Orçamento"}</h1>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="protocol">Número do Protocolo</Label>
          <Input id="protocol" placeholder="43022.123456/2026-01" value={protocolNumber} onChange={e => setProtocolNumber(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Tipo de Orçamento</Label>
          <Select value={type} onValueChange={v => setType(v as TipoOrcamento)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {budgetTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="total">Valor Total (R$)</Label>
          <Input id="total" type="number" step="0.01" min="0.01" placeholder="0,00" value={totalValue} onChange={e => setTotalValue(e.target.value)} />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" className="flex-1">{isEdit ? "Salvar Alterações" : "Criar Orçamento"}</Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}
