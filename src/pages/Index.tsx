
import React, { useState, useEffect } from 'react';
import { CounterButtons } from '../components/CounterButtons';
import { HistoryList } from '../components/HistoryList';
import { DaySummary } from '../components/DaySummary';
import { ExportButton } from '../components/ExportButton';
import { Header } from '../components/Header';
import { useLocalStorage } from '../hooks/useLocalStorage';

export interface DescentRecord {
  id: string;
  type: 'B' | 'T0' | 'T1' | 'T2';
  timestamp: Date;
}

const Index = () => {
  const [records, setRecords] = useLocalStorage<DescentRecord[]>('tirolesa-records', []);
  const [activeTab, setActiveTab] = useState<'counter' | 'history' | 'summary'>('counter');
  const [operatorName, setOperatorName] = useLocalStorage<string>('operator-name', '');

  const addRecord = (type: 'B' | 'T0' | 'T1' | 'T2') => {
    const newRecord: DescentRecord = {
      id: Date.now().toString(),
      type,
      timestamp: new Date()
    };
    setRecords(prev => [...prev, newRecord]);
  };

  const deleteRecord = (id: string) => {
    setRecords(prev => prev.filter(record => record.id !== id));
  };

  const clearAllRecords = () => {
    if (window.confirm('Tem certeza que deseja zerar todas as contagens? Esta ação não pode ser desfeita.')) {
      setRecords([]);
    }
  };

  const getTodayRecords = () => {
    const today = new Date().toDateString();
    return records.filter(record => 
      new Date(record.timestamp).toDateString() === today
    );
  };

  const todayRecords = getTodayRecords();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Header 
        operatorName={operatorName} 
        setOperatorName={setOperatorName}
        onClearAll={clearAllRecords}
      />
      
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
          <CounterButtons onAddRecord={addRecord} todayRecords={todayRecords} />
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
