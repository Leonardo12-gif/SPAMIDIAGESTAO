import React, { useState } from 'react';
import { useStore } from '../services/store';
import { Save, Settings as SettingsIcon, Key } from 'lucide-react';

const Settings: React.FC = () => {
  const { settings, updateSettings } = useStore();
  
  // Local state for form handling
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    updateSettings(localSettings);
    alert("Configurações salvas com sucesso!");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Configurações do Sistema</h2>
        <p className="text-gray-500">Ajuste os parâmetros de cálculo e integrações.</p>
      </div>

      {/* Mimaki Settings */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
            <SettingsIcon className="text-blue-500" size={20} />
            Calibração Mimaki CJV
        </h3>
        
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custo da Tinta (R$ por ml)
                </label>
                <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-400">R$</span>
                    <input 
                        type="number" 
                        step="0.01" 
                        className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        value={localSettings.inkCostPerMl}
                        onChange={e => setLocalSettings({...localSettings, inkCostPerMl: Number(e.target.value)})}
                    />
                </div>
                <p className="text-xs text-gray-400 mt-2">Baseado no valor do litro (aprox R$ 650,00).</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fator de Consumo (ml por m²)
                </label>
                 <div className="relative">
                    <input 
                        type="number" 
                        step="0.5" 
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        value={localSettings.inkConsumptionFactor}
                        onChange={e => setLocalSettings({...localSettings, inkConsumptionFactor: Number(e.target.value)})}
                    />
                    <span className="absolute right-3 top-3 text-gray-400">ml/m²</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">Média padrão da Mimaki CJV150/160 é entre 8 e 12 ml.</p>
            </div>
        </div>
      </div>

      {/* AI Integration */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
         <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
            <Key className="text-purple-500" size={20} />
            Integração AI (Google Gemini)
        </h3>
        
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Chave de API (API Key)
            </label>
            <input 
                type="password" 
                placeholder="Cole sua chave aqui..." 
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-mono text-sm"
                value={localSettings.apiKey}
                onChange={e => setLocalSettings({...localSettings, apiKey: e.target.value})}
            />
            <p className="text-xs text-gray-400 mt-2">
                Usada para alertas inteligentes e análise de dados. A chave é salva apenas no seu navegador.
            </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
            onClick={handleSave}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all active:scale-95">
            <Save size={20} />
            Salvar Alterações
        </button>
      </div>
    </div>
  );
};

export default Settings;