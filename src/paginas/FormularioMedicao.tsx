import { useContextoOrcamento } from "@/contextos/ContextoOrcamento";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function MeasurementForm() {
  const navigate = useNavigate();
  const { budgets, addMeasurement } = useContextoOrcamento();

  const [budgetId, setBudgetId] = useState("");
  const [measurementNumber, setMeasurementNumber] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [observation, setObservation] = useState("");

  const openBudgets = budgets.filter(b => b.status === "Aberto");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetId) { toast.error("Selecione um orçamento."); return; }
    if (!measurementNumber.trim()) { toast.error("Informe o número da medição."); return; }
    if (!date) { toast.error("Informe a data."); return; }

    const result = addMeasurement(budgetId, { measurementNumber: measurementNumber.trim(), date, observation: observation.trim() });
    if (typeof result === "object" && "error" in result) { toast.error(result.error); return; }
    toast.success("Medição criada com sucesso!");
    navigate(`/medicoes/${result}`);
  };

  return (
    <div className="max-w-lg space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>
      <h1 className="text-2xl font-bold">Nova Medição</h1>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-5">
        <div className="space-y-2">
          <Label>Orçamento</Label>
          <Select value={budgetId} onValueChange={setBudgetId}>
            <SelectTrigger><SelectValue placeholder="Selecione um orçamento" /></SelectTrigger>
            <SelectContent>
              {openBudgets.map(b => <SelectItem key={b.id} value={b.id}>{b.protocolNumber} — {b.type}</SelectItem>)}
            </SelectContent>
          </Select>
          {openBudgets.length === 0 && <p className="text-xs text-destructive">Nenhum orçamento aberto disponível.</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="mnum">Número da Medição</Label>
          <Input id="mnum" placeholder="MED-001" value={measurementNumber} onChange={e => setMeasurementNumber(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mdate">Data da Medição</Label>
          <Input id="mdate" type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="obs">Observações</Label>
          <Textarea id="obs" placeholder="Observações adicionais..." value={observation} onChange={e => setObservation(e.target.value)} rows={3} />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" className="flex-1">Criar Medição</Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}
