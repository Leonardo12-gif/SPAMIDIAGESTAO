import React, { useMemo } from 'react';
import { useStore } from '../services/store';
import { BudgetStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertCircle, CheckCircle, Clock, DollarSign, TrendingUp } from 'lucide-react';

const StatCard: React.FC<{ 
  title: string; 
  value: string; 
  icon: React.ElementType; 
  color: string; 
  subtext?: string 
}> = ({ title, value, icon: Icon, color, subtext }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
    </div>
    {subtext && <p className="text-xs text-gray-400 mt-2">{subtext}</p>}
  </div>
);

const Dashboard: React.FC = () => {
  const { budgets } = useStore();

  const stats = useMemo(() => {
    const pending = budgets.filter(b => b.status === BudgetStatus.PENDING_APPROVAL).length;
    const approved = budgets.filter(b => b.status === BudgetStatus.APPROVED).length;
    const production = budgets.filter(b => b.status === BudgetStatus.IN_PRODUCTION).length;
    
    // Financials
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyRevenue = budgets
      .filter(b => {
        const d = new Date(b.createdAt);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear && b.status !== BudgetStatus.REJECTED;
      })
      .reduce((acc, curr) => acc + curr.finalPrice, 0);

    const totalReceivable = budgets
      .filter(b => b.status !== BudgetStatus.REJECTED && !b.boletoPaid)
      .reduce((acc, curr) => acc + curr.finalPrice, 0);

    const nextBoletos = budgets
      .filter(b => b.boletoIssued && !b.boletoPaid && b.boletoDueDate)
      .sort((a, b) => new Date(a.boletoDueDate!).getTime() - new Date(b.boletoDueDate!).getTime())
      .slice(0, 5);

    return { pending, approved, production, monthlyRevenue, totalReceivable, nextBoletos };
  }, [budgets]);

  // Data for Charts
  const serviceTypeData = useMemo(() => {
    const counts: {[key: string]: number} = {};
    budgets.forEach(b => {
      counts[b.serviceType] = (counts[b.serviceType] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [budgets]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Visão Geral</h2>
          <p className="text-gray-500">Acompanhe o desempenho da Spamídia em tempo real.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-full shadow-sm text-sm font-medium text-gray-600 border border-gray-100">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Faturamento (Mês)" 
          value={`R$ ${stats.monthlyRevenue.toFixed(2)}`} 
          icon={TrendingUp} 
          color="bg-green-500 text-green-500" 
        />
        <StatCard 
          title="A Receber" 
          value={`R$ ${stats.totalReceivable.toFixed(2)}`} 
          icon={DollarSign} 
          color="bg-blue-500 text-blue-500" 
          subtext="Total em aberto"
        />
        <StatCard 
          title="Pendentes Aprovação" 
          value={stats.pending.toString()} 
          icon={Clock} 
          color="bg-yellow-500 text-yellow-500" 
        />
        <StatCard 
          title="Em Produção" 
          value={stats.production.toString()} 
          icon={AlertCircle} 
          color="bg-purple-500 text-purple-500" 
        />
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Charts */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Serviços Mais Vendidos</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                  <Pie
                    data={serviceTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {serviceTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-4 justify-center mt-4">
              {serviceTypeData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  {entry.name} ({entry.value})
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Alerts & Lists */}
        <div className="space-y-8">
          
          {/* Boletos Vencendo */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <AlertCircle size={20} className="text-red-500" />
              Próximos Vencimentos
            </h3>
            <div className="space-y-4">
              {stats.nextBoletos.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">Nenhum boleto próximo do vencimento.</p>
              ) : (
                stats.nextBoletos.map(b => (
                  <div key={b.id} className="flex justify-between items-center p-3 bg-red-50 rounded-xl border border-red-100">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{b.clientName}</p>
                      <p className="text-xs text-red-500 font-medium">
                        Vence: {new Date(b.boletoDueDate!).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="font-bold text-gray-700 text-sm">R$ {b.finalPrice.toFixed(2)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Aguardando Produção */}
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <CheckCircle size={20} className="text-green-500" />
              Prontos para Produzir
            </h3>
            <p className="text-3xl font-bold text-gray-800">{stats.approved}</p>
            <p className="text-sm text-gray-500">Orçamentos aprovados pelo financeiro</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;