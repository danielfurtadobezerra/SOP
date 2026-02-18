import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProvedorOrcamento } from "@/contextos/ContextoOrcamento";
import { LayoutPrincipal } from "@/componentes/LayoutPrincipal";
import PainelPrincipal from "@/paginas/PainelPrincipal";
import ListaOrcamentos from "@/paginas/ListaOrcamentos";
import FormularioOrcamento from "@/paginas/FormularioOrcamento";
import DetalheOrcamento from "@/paginas/DetalheOrcamento";
import ListaMedicoes from "@/paginas/ListaMedicoes";
import FormularioMedicao from "@/paginas/FormularioMedicao";
import DetalheMedicao from "@/paginas/DetalheMedicao";
import NaoEncontrado from "@/paginas/NaoEncontrado";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ProvedorOrcamento>
        <BrowserRouter>
          <LayoutPrincipal>
            <Routes>
              <Route path="/" element={<PainelPrincipal />} />
              <Route path="/orcamentos" element={<ListaOrcamentos />} />
              <Route path="/orcamentos/novo" element={<FormularioOrcamento />} />
              <Route path="/orcamentos/:id" element={<DetalheOrcamento />} />
              <Route path="/orcamentos/:id/editar" element={<FormularioOrcamento />} />
              <Route path="/medicoes" element={<ListaMedicoes />} />
              <Route path="/medicoes/nova" element={<FormularioMedicao />} />
              <Route path="/medicoes/:id" element={<DetalheMedicao />} />
              <Route path="*" element={<NaoEncontrado />} />
            </Routes>
          </LayoutPrincipal>
        </BrowserRouter>
      </ProvedorOrcamento>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
