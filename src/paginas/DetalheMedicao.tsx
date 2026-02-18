import { useContextoOrcamento } from "@/contextos/ContextoOrcamento";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, Plus, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function MeasurementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { measurements, budgets, validateMeasurement, deleteMeasurement, addMeasurementItem, updateMeasurementItem, deleteMeasurementItem } = useContextoOrcamento();

  const measurement = measurements.find(m => m.id === id);
  const budget = measurement ? budgets.find(b => b.id === measurement.budgetId) : null;

  const [itemDialog, setItemDialog] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [measuredQty, setMeasuredQty] = useState("");
  const [editMItemId, setEditMItemId] = useState<string | null>(null);

  if (!measurement) return (
    <div className="text-center py-16">
      <p className="text-muted-foreground">Medição não encontrada.</p>
      <Link to="/medicoes" className="text-accent hover:underline text-sm mt-2 inline-block">Voltar à lista</Link>
    </div>
  );

  const isValidated = measurement.status === "Validada";
  const availableItems = budget?.items.filter(i => !measurement.items.some(mi => mi.budgetItemId === i.id)) ?? [];

  const openItemDialog = (mItemId?: string) => {
    if (mItemId) {
      const mi = measurement.items.find(i => i.id === mItemId);
      if (mi) { setSelectedItemId(mi.budgetItemId); setMeasuredQty(mi.measuredQuantity.toString()); setEditMItemId(mItemId); }
    } else {
      setSelectedItemId(""); setMeasuredQty(""); setEditMItemId(null);
    }
    setItemDialog(true);
  };

  const handleSaveItem = () => {
    const qty = parseFloat(measuredQty);
    if (isNaN(qty) || qty <= 0) { toast.error("Quantidade inválida."); return; }

    if (editMItemId) {
      const result = updateMeasurementItem(measurement.id, editMItemId, { measuredQuantity: qty });
      if (typeof result === "object" && "error" in result) { toast.error(result.error); return; }
      toast.success("Item atualizado!");
    } else {
      if (!selectedItemId) { toast.error("Selecione um item."); return; }
      const result = addMeasurementItem(measurement.id, { budgetItemId: selectedItemId, measuredQuantity: qty });
      if (typeof result === "object" && "error" in result) { toast.error(result.error); return; }
      toast.success("Item adicionado!");
    }
    setItemDialog(false);
  };

  const handleValidate = () => {
    if (measurement.items.length === 0) { toast.error("Adicione pelo menos um item à medição."); return; }
    const result = validateMeasurement(measurement.id);
    if (typeof result === "object" && "error" in result) { toast.error(result.error); return; }
    toast.success("Medição validada! Quantidades acumuladas atualizadas.");
  };

  const handleDelete = () => {
    const result = deleteMeasurement(measurement.id);
    if (typeof result === "object" && "error" in result) { toast.error(result.error); return; }
    toast.success("Medição excluída.");
    navigate("/medicoes");
  };

  const handleDeleteItem = (mItemId: string) => {
    const result = deleteMeasurementItem(measurement.id, mItemId);
    if (typeof result === "object" && "error" in result) { toast.error(result.error); return; }
    toast.success("Item removido.");
  };

  return (
    <div className="space-y-6">
      <button onClick={() => navigate("/medicoes")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold mono">{measurement.measurementNumber}</h1>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${measurement.status === "Aberta" ? "bg-accent/10 text-accent" : "bg-success/10 text-success"}`}>
              {measurement.status}
            </span>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Orçamento: <Link to={`/orcamentos/${budget?.id}`} className="text-accent hover:underline mono">{budget?.protocolNumber ?? "—"}</Link>
            {" · "}{new Date(measurement.date).toLocaleDateString("pt-BR")}
          </p>
        </div>
        {!isValidated && (
          <div className="flex gap-2">
            <Button size="sm" onClick={handleValidate} className="gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" /> Validar
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete} className="gap-1.5">
              <Trash2 className="w-3.5 h-3.5" /> Excluir
            </Button>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Valor da Medição</p>
          <p className="text-xl font-bold">R$ {measurement.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Observações</p>
          <p className="text-sm">{measurement.observation || "—"}</p>
        </div>
      </div>

      {/* Measurement Items */}
      <div className="bg-card border border-border rounded-lg">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold">Itens Medidos ({measurement.items.length})</h2>
          {!isValidated && availableItems.length > 0 && (
            <Button size="sm" onClick={() => openItemDialog()} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Adicionar
            </Button>
          )}
        </div>
        {measurement.items.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">Nenhum item medido.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Item</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Qtd Medida</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Vlr Unit</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Vlr Total</th>
                  {!isValidated && <th className="px-4 py-2.5 w-20"></th>}
                </tr>
              </thead>
              <tbody>
                {measurement.items.map(mi => {
                  const bItem = budget?.items.find(i => i.id === mi.budgetItemId);
                  return (
                    <tr key={mi.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">
                        <p>{bItem?.description ?? "—"}</p>
                        <p className="text-xs text-muted-foreground">Qtd orçada: {bItem?.quantity} · Acumulado: {bItem?.accumulatedQuantity}</p>
                      </td>
                      <td className="px-4 py-3 text-right mono">{mi.measuredQuantity}</td>
                      <td className="px-4 py-3 text-right mono">R$ {(bItem?.unitPrice ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-right mono font-medium">R$ {mi.totalMeasuredValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                      {!isValidated && (
                        <td className="px-4 py-3 text-right">
                          <div className="flex gap-1 justify-end">
                            <button onClick={() => openItemDialog(mi.id)} className="p-1 rounded hover:bg-secondary text-xs text-accent">Editar</button>
                            <button onClick={() => handleDeleteItem(mi.id)} className="p-1 rounded hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Item Dialog */}
      <Dialog open={itemDialog} onOpenChange={setItemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editMItemId ? "Editar Item Medido" : "Adicionar Item à Medição"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!editMItemId && (
              <div className="space-y-2">
                <Label>Item do Orçamento</Label>
                <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                  <SelectTrigger><SelectValue placeholder="Selecione um item" /></SelectTrigger>
                  <SelectContent>
                    {availableItems.map(i => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.description} (Restante: {(i.quantity - i.accumulatedQuantity).toFixed(2)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Quantidade Medida</Label>
              <Input type="number" step="0.01" min="0.01" value={measuredQty} onChange={e => setMeasuredQty(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemDialog(false)}>Cancelar</Button>
            <Button onClick={handleSaveItem}>{editMItemId ? "Salvar" : "Adicionar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
