import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Orcamento, ItemOrcamento, Medicao, ItemMedicao, StatusOrcamento, StatusMedicao, TipoOrcamento } from "@/tipos/orcamento";

function generateId() {
  return crypto.randomUUID();
}

interface ContextoOrcamentoType {
  budgets: Orcamento[];
  measurements: Medicao[];
  addBudget: (data: { protocolNumber: string; type: TipoOrcamento; totalValue: number }) => string | { error: string };
  updateBudget: (id: string, data: { protocolNumber: string; type: TipoOrcamento; totalValue: number }) => true | { error: string };
  finalizeBudget: (id: string) => true | { error: string };
  deleteBudget: (id: string) => true | { error: string };
  addItem: (budgetId: string, data: { description: string; quantity: number; unitPrice: number }) => string | { error: string };
  updateItem: (budgetId: string, itemId: string, data: { description: string; quantity: number; unitPrice: number }) => true | { error: string };
  deleteItem: (budgetId: string, itemId: string) => true | { error: string };
  addMeasurement: (budgetId: string, data: { measurementNumber: string; date: string; observation: string }) => string | { error: string };
  validateMeasurement: (measurementId: string) => true | { error: string };
  deleteMeasurement: (measurementId: string) => true | { error: string };
  addMeasurementItem: (measurementId: string, data: { budgetItemId: string; measuredQuantity: number }) => string | { error: string };
  updateMeasurementItem: (measurementId: string, itemId: string, data: { measuredQuantity: number }) => true | { error: string };
  deleteMeasurementItem: (measurementId: string, itemId: string) => true | { error: string };
}

const ContextoOrcamento = createContext<ContextoOrcamentoType | null>(null);

export function useContextoOrcamento() {
  const ctx = useContext(ContextoOrcamento);
  if (!ctx) throw new Error("useContextoOrcamento must be used within ProvedorOrcamento");
  return ctx;
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

export function ProvedorOrcamento({ children }: { children: React.ReactNode }) {
  const [budgets, setBudgets] = useState<Orcamento[]>(() => loadFromStorage("budgets", []));
  const [measurements, setMeasurements] = useState<Medicao[]>(() => loadFromStorage("measurements", []));

  useEffect(() => { localStorage.setItem("budgets", JSON.stringify(budgets)); }, [budgets]);
  useEffect(() => { localStorage.setItem("measurements", JSON.stringify(measurements)); }, [measurements]);

  const addBudget = useCallback((data: { protocolNumber: string; type: TipoOrcamento; totalValue: number }) => {
    if (budgets.some(b => b.protocolNumber === data.protocolNumber)) return { error: "Número de protocolo já existe." };
    const id = generateId();
    setBudgets(prev => [...prev, { id, ...data, createdAt: new Date().toISOString().split("T")[0], status: "Aberto", items: [] }]);
    return id;
  }, [budgets]);

  const updateBudget = useCallback((id: string, data: { protocolNumber: string; type: TipoOrcamento; totalValue: number }) => {
    const budget = budgets.find(b => b.id === id);
    if (!budget) return { error: "Orçamento não encontrado." };
    if (budget.status === "Finalizado") return { error: "Não é permitido editar orçamento finalizado." };
    if (budgets.some(b => b.protocolNumber === data.protocolNumber && b.id !== id)) return { error: "Número de protocolo já existe." };
    const itemsTotal = budget.items.reduce((s, i) => s + i.totalValue, 0);
    if (data.totalValue < itemsTotal) return { error: `Valor total não pode ser menor que a soma dos itens (R$ ${itemsTotal.toFixed(2)}).` };
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, ...data } : b));
    return true;
  }, [budgets]);

  const finalizeBudget = useCallback((id: string) => {
    const budget = budgets.find(b => b.id === id);
    if (!budget) return { error: "Orçamento não encontrado." };
    if (budget.status === "Finalizado") return { error: "Orçamento já finalizado." };
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, status: "Finalizado" as StatusOrcamento } : b));
    return true;
  }, [budgets]);

  const deleteBudget = useCallback((id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
    setMeasurements(prev => prev.filter(m => m.budgetId !== id));
    return true;
  }, []);

  const addItem = useCallback((budgetId: string, data: { description: string; quantity: number; unitPrice: number }) => {
    const budget = budgets.find(b => b.id === budgetId);
    if (!budget) return { error: "Orçamento não encontrado." };
    if (budget.status === "Finalizado") return { error: "Não é permitido adicionar item em orçamento finalizado." };
    const totalValue = data.quantity * data.unitPrice;
    const currentTotal = budget.items.reduce((s, i) => s + i.totalValue, 0);
    if (currentTotal + totalValue > budget.totalValue) return { error: `Soma dos itens (R$ ${(currentTotal + totalValue).toFixed(2)}) ultrapassa o valor do orçamento (R$ ${budget.totalValue.toFixed(2)}).` };
    const id = generateId();
    setBudgets(prev => prev.map(b => b.id === budgetId ? { ...b, items: [...b.items, { id, ...data, totalValue, accumulatedQuantity: 0, budgetId }] } : b));
    return id;
  }, [budgets]);

  const updateItem = useCallback((budgetId: string, itemId: string, data: { description: string; quantity: number; unitPrice: number }) => {
    const budget = budgets.find(b => b.id === budgetId);
    if (!budget) return { error: "Orçamento não encontrado." };
    if (budget.status === "Finalizado") return { error: "Não é permitido editar item em orçamento finalizado." };
    const item = budget.items.find(i => i.id === itemId);
    if (!item) return { error: "Item não encontrado." };
    const totalValue = data.quantity * data.unitPrice;
    const othersTotal = budget.items.filter(i => i.id !== itemId).reduce((s, i) => s + i.totalValue, 0);
    if (othersTotal + totalValue > budget.totalValue) return { error: `Soma dos itens ultrapassa o valor do orçamento.` };
    if (data.quantity < item.accumulatedQuantity) return { error: `Quantidade não pode ser menor que a quantidade já acumulada (${item.accumulatedQuantity}).` };
    setBudgets(prev => prev.map(b => b.id === budgetId ? { ...b, items: b.items.map(i => i.id === itemId ? { ...i, ...data, totalValue } : i) } : b));
    return true;
  }, [budgets]);

  const deleteItem = useCallback((budgetId: string, itemId: string) => {
    const budget = budgets.find(b => b.id === budgetId);
    if (!budget) return { error: "Orçamento não encontrado." };
    if (budget.status === "Finalizado") return { error: "Não é permitido remover item de orçamento finalizado." };
    setBudgets(prev => prev.map(b => b.id === budgetId ? { ...b, items: b.items.filter(i => i.id !== itemId) } : b));
    return true;
  }, [budgets]);

  const addMeasurement = useCallback((budgetId: string, data: { measurementNumber: string; date: string; observation: string }) => {
    if (measurements.some(m => m.measurementNumber === data.measurementNumber)) return { error: "Número de medição já existe." };
    if (measurements.some(m => m.budgetId === budgetId && m.status === "Aberta")) return { error: "Já existe uma medição aberta para este orçamento." };
    const id = generateId();
    setMeasurements(prev => [...prev, { id, ...data, value: 0, status: "Aberta", budgetId, items: [] }]);
    return id;
  }, [measurements]);

  const validateMeasurement = useCallback((measurementId: string) => {
    const measurement = measurements.find(m => m.id === measurementId);
    if (!measurement) return { error: "Medição não encontrada." };
    if (measurement.status === "Validada") return { error: "Medição já validada." };
    // Update accumulated quantities
    setBudgets(prev => prev.map(b => {
      if (b.id !== measurement.budgetId) return b;
      return {
        ...b,
        items: b.items.map(item => {
          const mItem = measurement.items.find(mi => mi.budgetItemId === item.id);
          if (!mItem) return item;
          return { ...item, accumulatedQuantity: item.accumulatedQuantity + mItem.measuredQuantity };
        })
      };
    }));
    setMeasurements(prev => prev.map(m => m.id === measurementId ? { ...m, status: "Validada" as StatusMedicao } : m));
    return true;
  }, [measurements]);

  const deleteMeasurement = useCallback((measurementId: string) => {
    const measurement = measurements.find(m => m.id === measurementId);
    if (!measurement) return { error: "Medição não encontrada." };
    if (measurement.status === "Validada") return { error: "Não é permitido excluir medição validada." };
    setMeasurements(prev => prev.filter(m => m.id !== measurementId));
    return true;
  }, [measurements]);

  const addMeasurementItem = useCallback((measurementId: string, data: { budgetItemId: string; measuredQuantity: number }) => {
    const measurement = measurements.find(m => m.id === measurementId);
    if (!measurement) return { error: "Medição não encontrada." };
    if (measurement.status === "Validada") return { error: "Não é permitido editar medição validada." };
    const budget = budgets.find(b => b.id === measurement.budgetId);
    if (!budget) return { error: "Orçamento não encontrado." };
    const budgetItem = budget.items.find(i => i.id === data.budgetItemId);
    if (!budgetItem) return { error: "Item do orçamento não encontrado." };
    if (measurement.items.some(mi => mi.budgetItemId === data.budgetItemId)) return { error: "Este item já foi adicionado à medição." };
    // Check accumulated + measured doesn't exceed total
    const remaining = budgetItem.quantity - budgetItem.accumulatedQuantity;
    // Also check other open measurements for same item
    const otherOpenMeasured = measurements
      .filter(m => m.id !== measurementId && m.status === "Aberta" && m.budgetId === measurement.budgetId)
      .flatMap(m => m.items)
      .filter(mi => mi.budgetItemId === data.budgetItemId)
      .reduce((s, mi) => s + mi.measuredQuantity, 0);
    if (data.measuredQuantity > remaining - otherOpenMeasured) return { error: `Quantidade medida excede o restante do item (${(remaining - otherOpenMeasured).toFixed(2)}).` };
    const id = generateId();
    const totalMeasuredValue = data.measuredQuantity * budgetItem.unitPrice;
    const newItem: ItemMedicao = { id, ...data, totalMeasuredValue, measurementId };
    const updatedItems = [...measurement.items, newItem];
    const newValue = updatedItems.reduce((s, i) => s + i.totalMeasuredValue, 0);
    setMeasurements(prev => prev.map(m => m.id === measurementId ? { ...m, items: updatedItems, value: newValue } : m));
    return id;
  }, [measurements, budgets]);

  const updateMeasurementItem = useCallback((measurementId: string, itemId: string, data: { measuredQuantity: number }) => {
    const measurement = measurements.find(m => m.id === measurementId);
    if (!measurement) return { error: "Medição não encontrada." };
    if (measurement.status === "Validada") return { error: "Não é permitido editar medição validada." };
    const mItem = measurement.items.find(i => i.id === itemId);
    if (!mItem) return { error: "Item da medição não encontrado." };
    const budget = budgets.find(b => b.id === measurement.budgetId);
    const budgetItem = budget?.items.find(i => i.id === mItem.budgetItemId);
    if (!budgetItem) return { error: "Item do orçamento não encontrado." };
    const remaining = budgetItem.quantity - budgetItem.accumulatedQuantity;
    if (data.measuredQuantity > remaining) return { error: `Quantidade medida excede o restante (${remaining.toFixed(2)}).` };
    const totalMeasuredValue = data.measuredQuantity * budgetItem.unitPrice;
    const updatedItems = measurement.items.map(i => i.id === itemId ? { ...i, ...data, totalMeasuredValue } : i);
    const newValue = updatedItems.reduce((s, i) => s + i.totalMeasuredValue, 0);
    setMeasurements(prev => prev.map(m => m.id === measurementId ? { ...m, items: updatedItems, value: newValue } : m));
    return true;
  }, [measurements, budgets]);

  const deleteMeasurementItem = useCallback((measurementId: string, itemId: string) => {
    const measurement = measurements.find(m => m.id === measurementId);
    if (!measurement) return { error: "Medição não encontrada." };
    if (measurement.status === "Validada") return { error: "Não é permitido editar medição validada." };
    const updatedItems = measurement.items.filter(i => i.id !== itemId);
    const newValue = updatedItems.reduce((s, i) => s + i.totalMeasuredValue, 0);
    setMeasurements(prev => prev.map(m => m.id === measurementId ? { ...m, items: updatedItems, value: newValue } : m));
    return true;
  }, [measurements]);

  return (
    <ContextoOrcamento.Provider value={{
      budgets, measurements,
      addBudget, updateBudget, finalizeBudget, deleteBudget,
      addItem, updateItem, deleteItem,
      addMeasurement, validateMeasurement, deleteMeasurement,
      addMeasurementItem, updateMeasurementItem, deleteMeasurementItem,
    }}>
      {children}
    </ContextoOrcamento.Provider>
  );
}
