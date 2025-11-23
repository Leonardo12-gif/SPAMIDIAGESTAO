import { GoogleGenAI } from "@google/genai";
import { Budget, BudgetStatus } from "../types";

export const getGeminiAnalysis = async (apiKey: string, budgets: Budget[], question: string): Promise<string> => {
  if (!apiKey) return "Por favor, configure sua chave de API (Google Gemini) nas Configurações para usar a IA.";

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Prepare context data
    const contextData = budgets.map(b => ({
      client: b.clientName,
      service: b.serviceType,
      value: b.finalPrice,
      status: b.status,
      date: b.createdAt.split('T')[0],
      inkUsed: b.inkConsumptionMl,
      paid: b.boletoPaid ? 'Sim' : 'Não',
      dueDate: b.boletoDueDate
    }));

    const prompt = `
      Você é um assistente de gestão empresarial para uma empresa de comunicação visual chamada Spamídia.
      Analise os seguintes dados de orçamentos e responda à pergunta do usuário.
      Seja conciso, profissional e útil.
      
      Dados (JSON simplificado):
      ${JSON.stringify(contextData)}

      Pergunta do Usuário: "${question}"
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Não foi possível gerar uma resposta.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Erro ao conectar com a IA. Verifique sua chave de API ou tente novamente mais tarde.";
  }
};

export const getSmartAlerts = async (apiKey: string, budgets: Budget[]): Promise<string[]> => {
   if (!apiKey) return [];

   try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Filter pertinent data for alerts
    const pending = budgets.filter(b => b.status === BudgetStatus.PENDING_APPROVAL).length;
    const unpaid = budgets.filter(b => b.boletoIssued && !b.boletoPaid).length;
    
    const prompt = `
      Analise estes métricas rápidas da Spamídia:
      - Orçamentos pendentes de aprovação: ${pending}
      - Boletos em aberto: ${unpaid}
      - Data atual: ${new Date().toLocaleDateString()}
      
      Gere 3 alertas curtos e estratégicos para o gestor financeiro em formato de lista simples.
      Foque em urgência e fluxo de caixa.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            maxOutputTokens: 200,
        }
    });

    const text = response.text || "";
    // Split by newlines and clean up
    return text.split('\n').filter(line => line.trim().length > 5).map(l => l.replace(/^[-\d.]+\s*/, ''));

   } catch (e) {
       console.error(e);
       return [];
   }
}