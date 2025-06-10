
import React from 'react';
import { DescentRecord } from '../pages/Index';

interface CounterButtonsProps {
  onAddRecord: (type: 'B' | 'T0' | 'T1' | 'T2') => void;
  todayRecords: DescentRecord[];
}

export const CounterButtons: React.FC<CounterButtonsProps> = ({ onAddRecord, todayRecords }) => {
  const getCountByType = (type: 'B' | 'T0' | 'T1' | 'T2') => {
    return todayRecords.filter(record => record.type === type).length;
  };

  const buttonConfigs = [
    { type: 'B' as const, color: 'bg-green-500 hover:bg-green-600', label: 'Cadeirinha B', emoji: '🟢' },
    { type: 'T0' as const, color: 'bg-blue-500 hover:bg-blue-600', label: 'Cadeirinha T0', emoji: '🔵' },
    { type: 'T1' as const, color: 'bg-yellow-500 hover:bg-yellow-600', label: 'Cadeirinha T1', emoji: '🟡' },
    { type: 'T2' as const, color: 'bg-red-500 hover:bg-red-600', label: 'Cadeirinha T2', emoji: '🔴' },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Registrar Nova Descida
        </h2>
        <p className="text-muted-foreground">
          Clique no tipo de cadeirinha utilizada
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {buttonConfigs.map(({ type, color, label, emoji }) => (
          <button
            key={type}
            onClick={() => onAddRecord(type)}
            className={`${color} text-white p-8 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95`}
          >
            <div className="text-6xl mb-4">{emoji}</div>
            <div className="text-xl font-bold mb-2">{label}</div>
            <div className="text-3xl font-extrabold bg-black/20 rounded-lg py-2 px-4 inline-block">
              {getCountByType(type)}
            </div>
          </button>
        ))}
      </div>

      <div className="bg-card rounded-lg p-6 shadow-md max-w-2xl mx-auto">
        <h3 className="text-lg font-semibold mb-4 text-center">Totais do Dia</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {buttonConfigs.map(({ type, emoji }) => (
            <div key={type} className="bg-accent rounded-lg p-3">
              <div className="text-2xl mb-1">{emoji}</div>
              <div className="font-bold text-lg">{getCountByType(type)}</div>
              <div className="text-sm text-muted-foreground">{type}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t text-center">
          <div className="text-sm text-muted-foreground">Total Geral</div>
          <div className="text-2xl font-bold text-primary">{todayRecords.length}</div>
        </div>
      </div>
    </div>
  );
};
