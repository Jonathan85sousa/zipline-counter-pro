
import React, { useState } from 'react';
import { CounterButtons } from '../components/CounterButtons';
import { HistoryList } from '../components/HistoryList';
import { DaySummary } from '../components/DaySummary';
import { ExportButton } from '../components/ExportButton';
import { Header } from '../components/Header';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useSupabaseCounters } from '../hooks/useSupabaseCounters';

export interface DescentRecord {
  id: string;
  type: 'B' | 'T0' | 'T1' | 'T2';
  timestamp: Date;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState<'counter' | 'history' | 'summary'>('counter');
  const [operatorName, setOperatorName] = useLocalStorage<string>('operator-name', '');
  
  const {
    counts,
    records,
    isLoading,
    isConnected,
    addRecord,
    deleteRecord,
    clearAllRecords
  } = useSupabaseCounters(operatorName);

  // Convert Supabase records to local format for compatibility
  const todayRecords: DescentRecord[] = records.map(record => ({
    id: record.id,
    type: record.type as 'B' | 'T0' | 'T1' | 'T2',
    timestamp: new Date(record.timestamp)
  }));

  const getTodayRecords = () => todayRecords;

  const handleClearAll = () => {
    if (window.confirm('Tem certeza que deseja zerar todas as contagens? Esta ação não pode ser desfeita.')) {
      clearAllRecords();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <div className="text-xl font-semibold">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Header 
        operatorName={operatorName} 
        setOperatorName={setOperatorName}
        onClearAll={handleClearAll}
      />
      
      {/* Connection Status */}
      <div className="container mx-auto px-4 py-2">
        <div className="flex justify-center">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            isConnected 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {isConnected ? '🟢 Conectado em tempo real' : '🔴 Desconectado'}
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          <button
            onClick={() => setActiveTab('counter')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'counter' 
                ? 'bg-primary text-primary-foreground shadow-lg' 
                : 'bg-card text-card-foreground hover:bg-accent'
            }`}
          >
            Contador
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'history' 
                ? 'bg-primary text-primary-foreground shadow-lg' 
                : 'bg-card text-card-foreground hover:bg-accent'
            }`}
          >
            Histórico ({todayRecords.length})
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'summary' 
                ? 'bg-primary text-primary-foreground shadow-lg' 
                : 'bg-card text-card-foreground hover:bg-accent'
            }`}
          >
            Resumo
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'counter' && (
          <CounterButtons 
            onAddRecord={addRecord} 
            todayRecords={todayRecords}
            counts={counts}
          />
        )}

        {activeTab === 'history' && (
          <HistoryList records={todayRecords} onDeleteRecord={deleteRecord} />
        )}

        {activeTab === 'summary' && (
          <div>
            <DaySummary records={todayRecords} operatorName={operatorName} />
            <div className="mt-6 flex justify-center">
              <ExportButton records={todayRecords} operatorName={operatorName} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
