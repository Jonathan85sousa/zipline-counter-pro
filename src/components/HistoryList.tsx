
import React from 'react';
import { DescentRecord } from '../pages/Index';

interface HistoryListProps {
  records: DescentRecord[];
  onDeleteRecord: (id: string) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ records, onDeleteRecord }) => {
  const sortedRecords = [...records].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'B': return 'bg-green-100 text-green-800 border-green-200';
      case 'T0': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'T1': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'T2': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'B': return '🟢';
      case 'T0': return '🔵';
      case 'T1': return '🟡';
      case 'T2': return '🔴';
      default: return '⚪';
    }
  };

  if (records.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-semibold text-muted-foreground mb-2">
          Nenhuma descida registrada hoje
        </h3>
        <p className="text-muted-foreground">
          Vá para a aba "Contador" para registrar a primeira descida
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Histórico do Dia
        </h2>
        <p className="text-muted-foreground">
          {records.length} descida{records.length !== 1 ? 's' : ''} registrada{records.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="space-y-3 max-w-2xl mx-auto">
        {sortedRecords.map((record, index) => (
          <div
            key={record.id}
            className="bg-card rounded-lg p-4 shadow-sm border flex items-center justify-between hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="text-2xl">{getTypeEmoji(record.type)}</div>
              <div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${getTypeColor(record.type)}`}
                  >
                    Cadeirinha {record.type}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    #{sortedRecords.length - index}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {new Date(record.timestamp).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </div>
              </div>
            </div>
            
            <button
              onClick={() => onDeleteRecord(record.id)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
              title="Excluir registro"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
