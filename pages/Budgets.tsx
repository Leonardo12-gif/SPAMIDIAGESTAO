import React, { useState } from 'react';
import { useStore } from '../services/store';
import { BudgetStatus, PaymentMethod } from '../types';
import { Calculator, Plus, X } from 'lucide-react';

const Budgets: React.FC = () => {
  const { addBudget, budgets, settings } = useStore();
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    serviceType: 'Adesivo',
    width: 0,
    height: 0,
    material: '',
    technique: 'Impressão',
    complexity: 'Baixa' as 'Baixa' | 'Média' | 'Alta',
    productionDate: '',
    observations: '',
    paymentMethod: PaymentMethod.CASH,
    installments: 1,
    additionalCost: 0, // Labor, Material specific costs manually added
    finalPriceManual: 0, // Override
  });

  // Derived Calculations
  const area = formData.width * formData.height;
  const inkConsumption = area * settings.inkConsumptionFactor; // ml
  const inkCost = inkConsumption * settings.inkCostPerMl;
  
  // Simple heuristic for suggested price (just for UI guidance, not strict logic)
  const suggestedPrice = (inkCost + formData.additionalCost) * (formData.complexity === 'Alta' ? 3 : formData.complexity === 'Média' ? 2.5 : 2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addBudget({
      ...formData,
      dimensions: { width: formData.width, height: formData.height, unit: 'm' },
      inkConsumptionMl: inkConsumption,
      inkCost: inkCost,
      estimatedTotalCost: inkCost + formData.additionalCost,
      finalPrice: formData.finalPriceManual > 0 ? formData.finalPriceManual : suggestedPrice,
    });
    setShowForm(false);
    // Reset form...
    setFormData({ ...formData, clientName: '', width: 0, height: 0, finalPriceManual: 0 });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Orçamentos</h2>
           <p className="text-gray-500">Gerencie e crie novos orçamentos para aprovação.</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
        >
          <Plus size={20} />
          Novo Orçamento
        </button>
      </div>

      {/* Creation Modal/Overlay */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-800">Criar Novo Orçamento</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Client Info */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700 border-l-4 border-blue-500 pl-2">Dados do Cliente</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Nome do Cliente</label>
                  <input required type="text" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Telefone / WhatsApp</label>
                  <input required type="text" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={formData.clientPhone} onChange={e => setFormData({...formData, clientPhone: e.target.value})} />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Forma de Pagamento</label>
                  <select className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                     value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value as PaymentMethod})}>
                    {Object.values(PaymentMethod).map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                {formData.paymentMethod === PaymentMethod.INSTALLMENTS && (
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Nº Parcelas</label>
                        <input type="number" min="2" max="12" className="w-full p-3 border border-gray-200 rounded-xl"
                        value={formData.installments} onChange={e => setFormData({...formData, installments: Number(e.target.value)})} />
                    </div>
                )}
              </div>

              {/* Service Info */}
               <div className="space-y-4">
                <h4 className="font-semibold text-gray-700 border-l-4 border-green-500 pl-2">Detalhes do Serviço</h4>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Tipo</label>
                    <select className="w-full p-3 border border-gray-200 rounded-xl bg-white"
                        value={formData.serviceType} onChange={e => setFormData({...formData, serviceType: e.target.value})}>
                        <option>Adesivo</option>
                        <option>Lona</option>
                        <option>Placa PVC</option>
                        <option>Fachada</option>
                        <option>Recorte</option>
                    </select>
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Material</label>
                    <input type="text" placeholder="Ex: Vinil 3M" className="w-full p-3 border border-gray-200 rounded-xl"
                        value={formData.material} onChange={e => setFormData({...formData, material: e.target.value})} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Largura (m)</label>
                    <input type="number" step="0.01" className="w-full p-3 border border-gray-200 rounded-xl"
                       value={formData.width} onChange={e => setFormData({...formData, width: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Altura (m)</label>
                    <input type="number" step="0.01" className="w-full p-3 border border-gray-200 rounded-xl"
                       value={formData.height} onChange={e => setFormData({...formData, height: Number(e.target.value)})} />
                  </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-600 mb-1">Data Prevista Produção</label>
                   <input type="date" className="w-full p-3 border border-gray-200 rounded-xl"
                    value={formData.productionDate} onChange={e => setFormData({...formData, productionDate: e.target.value})} />
                </div>
              </div>
              
              {/* Cost Calculator */}
              <div className="md:col-span-2 bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <h4 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
                    <Calculator size={20} className="text-blue-600"/>
                    Calculadora Mimaki CJV
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                        <span className="text-xs text-gray-500 uppercase font-bold">Área Total</span>
                        <p className="text-lg font-bold text-gray-800">{area.toFixed(2)} m²</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                        <span className="text-xs text-gray-500 uppercase font-bold">Consumo Tinta</span>
                        <p className="text-lg font-bold text-blue-600">{inkConsumption.toFixed(1)} ml</p>
                    </div>
                     <div className="bg-white p-3 rounded-lg shadow-sm">
                        <span className="text-xs text-gray-500 uppercase font-bold">Custo Tinta</span>
                        <p className="text-lg font-bold text-red-600">R$ {inkCost.toFixed(2)}</p>
                    </div>
                    <div>
                         <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Preço Final (R$)</label>
                         <input type="number" step="0.01" className="w-full p-2 border-2 border-blue-100 focus:border-blue-500 rounded-lg text-lg font-bold text-gray-900"
                           value={formData.finalPriceManual || ''} 
                           placeholder={suggestedPrice.toFixed(2)}
                           onChange={e => setFormData({...formData, finalPriceManual: Number(e.target.value)})} />
                         <p className="text-xs text-gray-400 mt-1">Sugerido: R$ {suggestedPrice.toFixed(2)}</p>
                    </div>
                </div>
                
                <div className="mt-4">
                     <label className="block text-sm font-medium text-gray-600 mb-1">Observações</label>
                     <textarea className="w-full p-3 border border-gray-200 rounded-xl h-20"
                     value={formData.observations} onChange={e => setFormData({...formData, observations: e.target.value})}></textarea>
                </div>
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">Cancelar</button>
                <button type="submit" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transform active:scale-95 transition-all">
                    Enviar para Aprovação
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium text-sm">
                    <tr>
                        <th className="p-4">Cliente</th>
                        <th className="p-4">Serviço</th>
                        <th className="p-4">Medidas</th>
                        <th className="p-4">Valor</th>
                        <th className="p-4">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {budgets.length === 0 && (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-gray-400">Nenhum orçamento cadastrado.</td>
                        </tr>
                    )}
                    {budgets.map(b => (
                        <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4">
                                <p className="font-bold text-gray-800">{b.clientName}</p>
                                <p className="text-xs text-gray-500">{b.clientPhone}</p>
                            </td>
                            <td className="p-4 text-gray-600">{b.serviceType}</td>
                            <td className="p-4 text-gray-600">{b.dimensions.width}x{b.dimensions.height}m</td>
                            <td className="p-4 font-bold text-gray-800">R$ {b.finalPrice.toFixed(2)}</td>
                            <td className="p-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                                    ${b.status === BudgetStatus.PENDING_APPROVAL ? 'bg-yellow-100 text-yellow-600' : ''}
                                    ${b.status === BudgetStatus.APPROVED ? 'bg-blue-100 text-blue-600' : ''}
                                    ${b.status === BudgetStatus.REJECTED ? 'bg-red-100 text-red-600' : ''}
                                    ${b.status === BudgetStatus.IN_PRODUCTION ? 'bg-purple-100 text-purple-600' : ''}
                                    ${b.status === BudgetStatus.COMPLETED ? 'bg-green-100 text-green-600' : ''}
                                `}>
                                    {b.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Budgets;