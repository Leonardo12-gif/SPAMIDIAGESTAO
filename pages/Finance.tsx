import React, { useState, useEffect } from 'react';
import { useStore } from '../services/store';
import { Budget, BudgetStatus } from '../types';
import { Check, X, Printer, Calendar, Search } from 'lucide-react';
import { getSmartAlerts } from '../services/geminiService';

const Finance: React.FC = () => {
  const { budgets, updateBudgetStatus, updateBudgetPayment, markBoletoPaid, settings } = useStore();
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'BOLETOS'>('PENDING');
  const [aiAlerts, setAiAlerts] = useState<string[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    if (settings.apiKey) {
      setLoadingAi(true);
      getSmartAlerts(settings.apiKey, budgets).then(alerts => {
        setAiAlerts(alerts);
        setLoadingAi(false);
      });
    }
  }, [budgets, settings.apiKey]);

  const filteredBudgets = budgets.filter(b => {
    if (filter === 'PENDING') return b.status === BudgetStatus.PENDING_APPROVAL;
    if (filter === 'BOLETOS') return b.boletoIssued && !b.boletoPaid;
    return true;
  });

  const handlePrint = (budget: Budget) => {
    // Basic browser print trigger, real app would use a print-specific component or PDF lib
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Orçamento #${budget.id.slice(0, 8)}</title>
            <style>
              body { font-family: sans-serif; padding: 40px; }
              .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px; }
              .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
              .total { font-size: 20px; font-weight: bold; margin-top: 20px; border-top: 1px solid #ccc; padding-top: 10px; }
              .footer { margin-top: 50px; text-align: center; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>SPAMÍDIA COMUNICAÇÃO VISUAL</h1>
              <p>Orçamento Aprovado</p>
            </div>
            <div class="row"><strong>Cliente:</strong> <span>${budget.clientName}</span></div>
            <div class="row"><strong>Serviço:</strong> <span>${budget.serviceType}</span></div>
            <div class="row"><strong>Material:</strong> <span>${budget.material}</span></div>
            <div class="row"><strong>Medidas:</strong> <span>${budget.dimensions.width}m x ${budget.dimensions.height}m</span></div>
            <div class="row"><strong>Pagamento:</strong> <span>${budget.paymentMethod}</span></div>
            
            <div class="total">
              Valor Total: R$ ${budget.finalPrice.toFixed(2)}
            </div>

             <div class="footer">
              <p>Assinatura do Responsável _______________________________</p>
              <p>Sistema Frezza Gestão</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* AI Alerts Header */}
      {settings.apiKey && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <h3 className="font-bold flex items-center gap-2 mb-2">
            <span className="bg-white/20 p-1 rounded text-xs">AI</span> 
            Assistente Financeiro
          </h3>
          {loadingAi ? (
            <p className="text-sm opacity-70 animate-pulse">Analisando fluxo de caixa...</p>
          ) : (
            <ul className="list-disc list-inside text-sm space-y-1 opacity-90">
              {aiAlerts.length > 0 ? aiAlerts.map((alert, i) => <li key={i}>{alert}</li>) : <li>Tudo parece estar em ordem.</li>}
            </ul>
          )}
        </div>
      )}

      <div className="flex gap-4 border-b border-gray-200 pb-1">
        <button onClick={() => setFilter('PENDING')} 
          className={`pb-3 px-2 text-sm font-medium transition-colors ${filter === 'PENDING' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}>
          Aprovações Pendentes
        </button>
        <button onClick={() => setFilter('BOLETOS')} 
          className={`pb-3 px-2 text-sm font-medium transition-colors ${filter === 'BOLETOS' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}>
          Controle de Boletos
        </button>
        <button onClick={() => setFilter('ALL')} 
          className={`pb-3 px-2 text-sm font-medium transition-colors ${filter === 'ALL' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}>
          Todos os Registros
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredBudgets.length === 0 && (
          <div className="p-12 text-center text-gray-400 bg-white rounded-2xl border border-gray-100">
            Nenhum item encontrado neste filtro.
          </div>
        )}
        {filteredBudgets.map(budget => (
          <div key={budget.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:shadow-md">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-bold text-gray-800 text-lg">{budget.clientName}</h3>
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md uppercase font-bold">{budget.serviceType}</span>
              </div>
              <p className="text-sm text-gray-500">
                Criado em {new Date(budget.createdAt).toLocaleDateString()} • {budget.paymentMethod}
              </p>
              <p className="text-xl font-bold text-blue-600 mt-2">R$ {budget.finalPrice.toFixed(2)}</p>
            </div>

            <div className="flex flex-wrap gap-2 justify-end w-full md:w-auto">
              
              {/* Actions for PENDING */}
              {budget.status === BudgetStatus.PENDING_APPROVAL && (
                <>
                  <button onClick={() => updateBudgetStatus(budget.id, BudgetStatus.REJECTED)} 
                    className="px-4 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 font-medium flex items-center gap-2">
                    <X size={18} /> Reprovar
                  </button>
                  <button onClick={() => updateBudgetStatus(budget.id, BudgetStatus.APPROVED)} 
                    className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-500/20 flex items-center gap-2">
                    <Check size={18} /> Aprovar Produção
                  </button>
                </>
              )}

              {/* Actions for APPROVED (Print PDF) */}
              {budget.status === BudgetStatus.APPROVED && (
                <button onClick={() => handlePrint(budget)} 
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium flex items-center gap-2">
                    <Printer size={18} /> Gerar PDF
                </button>
              )}

              {/* Actions for Boletos */}
              {budget.status !== BudgetStatus.REJECTED && budget.status !== BudgetStatus.PENDING_APPROVAL && (budget.paymentMethod.includes('Boleto') || budget.paymentMethod.includes('Parcelado')) && !budget.boletoPaid && (
                  !budget.boletoIssued ? (
                    <div className="flex items-center gap-2">
                        <input type="date" id={`date-${budget.id}`} className="border p-2 rounded-lg text-sm" />
                        <button onClick={() => {
                            const dateEl = document.getElementById(`date-${budget.id}`) as HTMLInputElement;
                            if(dateEl.value) updateBudgetPayment(budget.id, dateEl.value);
                        }} className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-xl font-medium text-sm">
                            Registrar Boleto
                        </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-xs text-gray-500">Vencimento</p>
                            <p className={`font-bold text-sm ${new Date(budget.boletoDueDate!) < new Date() ? 'text-red-500' : 'text-gray-800'}`}>
                                {new Date(budget.boletoDueDate!).toLocaleDateString()}
                            </p>
                        </div>
                        <button onClick={() => markBoletoPaid(budget.id)} className="px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-xl font-medium text-sm">
                            Confirmar Pagamento
                        </button>
                    </div>
                  )
              )}
               
               {budget.boletoPaid && (
                   <span className="px-4 py-2 bg-green-50 text-green-600 rounded-xl font-bold border border-green-100">
                       Pago
                   </span>
               )}

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Finance;