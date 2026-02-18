import { useContextoOrcamento } from "@/contextos/ContextoOrcamento";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2, Plus, Lock, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function BudgetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { budgets, measurements, deleteBudget, finalizeBudget, addItem, updateItem, deleteItem } = useContextoOrcamento();

  const budget = budgets.find(b => b.id === id);
  const budgetMeasurements = measurements.filter(m => m.budgetId === id);

  const [itemDialog, setItemDialog] = useState(false);
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [itemDesc, setItemDesc] = useState("");
  const [itemQty, setItemQty] = useState("");
  const [itemPrice, setItemPrice] = useState("");

  if (!budget) return (
    <div className="text-center py-16">
      <p className="text-muted-foreground">Orçamento não encontrado.</p>
      <Link to="/orcamentos" className="text-accent hover:underline text-sm mt-2 inline-block">Voltar à lista</Link>
    </div>
  );

  const isFinalized = budget.status === "Finalizado";
  const itemsTotal = budget.items.reduce((s, i) => s + i.totalValue, 0);

  const openItemDialog = (itemId?: string) => {
    if (itemId) {
      const item = budget.items.find(i => i.id === itemId);
      if (item) { setItemDesc(item.description); setItemQty(item.quantity.toString()); setItemPrice(item.unitPrice.toString()); setEditItemId(itemId); }
    } else {
      setItemDesc(""); setItemQty(""); setItemPrice(""); setEditItemId(null);
    }
    setItemDialog(true);
  };

  const handleSaveItem = () => {
    const qty = parseFloat(itemQty);
    const price = parseFloat(itemPrice);
    if (!itemDesc.trim()) { toast.error("Informe a descrição."); return; }
    if (isNaN(qty) || qty <= 0) { toast.error("Quantidade inválida."); return; }
    if (isNaN(price) || price <= 0) { toast.error("Valor unitário inválido."); return; }

    if (editItemId) {
      const result = updateItem(budget.id, editItemId, { description: itemDesc.trim(), quantity: qty, unitPrice: price });
      if (typeof result === "object" && "error" in result) { toast.error(result.error); return; }
      toast.success("Item atualizado!");
    } else {
      const result = addItem(budget.id, { description: itemDesc.trim(), quantity: qty, unitPrice: price });
      if (typeof result === "object" && "error" in result) { toast.error(result.error); return; }
      toast.success("Item adicionado!");
    }
    setItemDialog(false);
  };

  const handleDeleteItem = (itemId: string) => {
    const result = deleteItem(budget.id, itemId);
    if (typeof result === "object" && "error" in result) { toast.error(result.error); return; }
    toast.success("Item removido.");
  };

  const handleFinalize = () => {
    const result = finalizeBudget(budget.id);
    if (typeof result === "object" && "error" in result) { toast.error(result.error); return; }
    toast.success("Orçamento finalizado!");
  };

  const handleDelete = () => {
    deleteBudget(budget.id);
    toast.success("Orçamento excluído.");
    navigate("/orcamentos");
  };

  return (
    <div className="space-y-6">
      <button onClick={() => navigate("/orcamentos")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold mono">{budget.protocolNumber}</h1>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${budget.status === "Aberto" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
              {budget.status}
            </span>
          </div>
          <p className="text-muted-foreground text-sm mt-1">{budget.type} · Criado em {new Date(budget.createdAt).toLocaleDateString("pt-BR")}</p>
        </div>
        {!isFinalized && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/orcamentos/${budget.id}/editar`)} className="gap-1.5">
              <Edit className="w-3.5 h-3.5" /> Editar
            </Button>
            <Button variant="outline" size="sm" onClick={handleFinalize} className="gap-1.5">
              <Lock className="w-3.5 h-3.5" /> Finalizar
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete} className="gap-1.5">
              <Trash2 className="w-3.5 h-3.5" /> Excluir
            </Button>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Valor Total</p>
          <p className="text-xl font-bold">R$ {budget.totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Soma dos Itens</p>
          <p className="text-xl font-bold">R$ {itemsTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          <p className="text-xs text-muted-foreground mt-1">Restante: R$ {(budget.totalValue - itemsTotal).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Medições</p>
          <p className="text-xl font-bold">{budgetMeasurements.length}</p>
          <p className="text-xs text-muted-foreground mt-1">{budgetMeasurements.filter(m => m.status === "Validada").length} validada(s)</p>
        </div>
      </div>

      {/* Items */}
      <div className="bg-card border border-border rounded-lg">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold">Itens do Orçamento ({budget.items.length})</h2>
          {!isFinalized && (
            <Button size="sm" onClick={() => openItemDialog()} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Adicionar
            </Button>
          )}
        </div>
        {budget.items.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">Nenhum item cadastrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Descrição</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Qtd</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Vlr Unit</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Vlr Total</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Acumulado</th>
                  {!isFinalized && <th className="px-4 py-2.5 w-20"></th>}
                </tr>
              </thead>
              <tbody>
                {budget.items.map(item => (
                  <tr key={item.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">{item.description}</td>
                    <td className="px-4 py-3 text-right mono">{item.quantity}</td>
                    <td className="px-4 py-3 text-right mono">R$ {item.unitPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-right mono font-medium">R$ {item.totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="mono">{item.accumulatedQuantity}</span>
                      <span className="text-muted-foreground text-xs ml-1">/ {item.quantity}</span>
                    </td>
                    {!isFinalized && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => openItemDialog(item.id)} className="p-1 rounded hover:bg-secondary"><Edit className="w-3.5 h-3.5 text-muted-foreground" /></button>
                          <button onClick={() => handleDeleteItem(item.id)} className="p-1 rounded hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Measurements */}
      {budgetMeasurements.length > 0 && (
        <div className="bg-card border border-border rounded-lg">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-semibold">Medições Vinculadas</h2>
          </div>
          <div className="divide-y divide-border">
            {budgetMeasurements.map(m => (
              <Link key={m.id} to={`/medicoes/${m.id}`} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                <div>
                  <p className="text-sm font-medium mono">{m.measurementNumber}</p>
                  <p className="text-xs text-muted-foreground">{new Date(m.date).toLocaleDateString("pt-BR")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-medium">R$ {m.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${m.status === "Aberta" ? "bg-accent/10 text-accent" : "bg-success/10 text-success"}`}>
                    {m.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Item Dialog */}
      <Dialog open={itemDialog} onOpenChange={setItemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editItemId ? "Editar Item" : "Novo Item"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input placeholder="Material de construção" value={itemDesc} onChange={e => setItemDesc(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantidade</Label>
                <Input type="number" step="0.01" min="0.01" value={itemQty} onChange={e => setItemQty(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Valor Unitário (R$)</Label>
                <Input type="number" step="0.01" min="0.01" value={itemPrice} onChange={e => setItemPrice(e.target.value)} />
              </div>
            </div>
            {itemQty && itemPrice && !isNaN(parseFloat(itemQty) * parseFloat(itemPrice)) && (
              <p className="text-sm text-muted-foreground">
                Valor total: <span className="font-medium text-foreground">R$ {(parseFloat(itemQty) * parseFloat(itemPrice)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemDialog(false)}>Cancelar</Button>
            <Button onClick={handleSaveItem}>{editItemId ? "Salvar" : "Adicionar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
