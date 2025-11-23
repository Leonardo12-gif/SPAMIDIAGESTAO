import React from 'react';
import { useStore } from '../services/store';
import { BudgetStatus } from '../types';
import { Play, CheckCircle, Upload, AlertCircle } from 'lucide-react';

const Production: React.FC = () => {
  const { budgets, updateBudgetStatus } = useStore();

  const productionItems = budgets.filter(b => 
    b.status === BudgetStatus.APPROVED || b.status === BudgetStatus.IN_PRODUCTION
  );

  return (
    <div className="space-y-6">
      <div>
         <h2 className="text-2xl font-bold text-gray-800">Fila de Produção</h2>
         <p className="text-gray-500">Acompanhe os serviços aprovados e atualize o status.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {productionItems.length === 0 && (
             <div className="p-16 text-center text-gray-400 bg-white rounded-2xl border border-gray-100 flex flex-col items-center">
                <CheckCircle size={48} className="text-gray-200 mb-4" />
                <p>A fila de produção está vazia.</p>
                <p className="text-sm">Aguarde aprovações do financeiro.</p>
             </div>
        )}

        {productionItems.map(item => (
          <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
             {/* Header */}
             <div className={`p-4 border-b border-gray-100 flex justify-between items-center ${item.status === BudgetStatus.IN_PRODUCTION ? 'bg-blue-50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${item.status === BudgetStatus.IN_PRODUCTION ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'}`}></span>
                    <span className="font-bold text-gray-700 uppercase text-sm tracking-wide">{item.status}</span>
                </div>
                <div className="text-sm text-gray-500">
                    Entrega: <span className="font-medium text-gray-800">{new Date(item.productionDate).toLocaleDateString()}</span>
                </div>
             </div>

             {/* Content */}
             <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-2 space-y-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">{item.clientName}</h3>
                        <p className="text-gray-500">{item.serviceType} - {item.material}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                        <p className="text-sm"><span className="font-bold text-gray-600">Dimensões:</span> {item.dimensions.width}m x {item.dimensions.height}m</p>
                        <p className="text-sm"><span className="font-bold text-gray-600">Técnica:</span> {item.technique}</p>
                        <p className="text-sm"><span className="font-bold text-gray-600">Observações:</span> {item.observations || "Nenhuma"}</p>
                    </div>

                    {/* Fake File Upload */}
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-500 transition-all cursor-pointer">
                        <Upload size={24} className="mb-2" />
                        <span className="text-sm font-medium">Anexar Arte Final (Simulação)</span>
                    </div>
                </div>

                <div className="border-l border-gray-100 pl-6 flex flex-col justify-between">
                     <div>
                        <p className="text-xs text-gray-400 uppercase font-bold mb-2">Dados Técnicos</p>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">Ink</div>
                            <div>
                                <p className="text-xs text-gray-500">Consumo Estimado</p>
                                <p className="font-bold text-gray-800">{item.inkConsumptionMl.toFixed(1)} ml</p>
                            </div>
                        </div>
                     </div>

                     <div className="mt-8 space-y-3">
                        {item.status === BudgetStatus.APPROVED && (
                            <button onClick={() => updateBudgetStatus(item.id, BudgetStatus.IN_PRODUCTION)} 
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all">
                                <Play size={18} /> Iniciar Produção
                            </button>
                        )}
                        
                        {item.status === BudgetStatus.IN_PRODUCTION && (
                            <button onClick={() => updateBudgetStatus(item.id, BudgetStatus.COMPLETED)} 
                                className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 transition-all">
                                <CheckCircle size={18} /> Finalizar Serviço
                            </button>
                        )}

                        <button className="w-full py-3 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl font-medium flex items-center justify-center gap-2 transition-all">
                             <AlertCircle size={18} /> Ocorrência
                        </button>
                     </div>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Production;