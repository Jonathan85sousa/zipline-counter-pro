
import React from 'react';
import { DescentRecord } from '../pages/Index';

interface DaySummaryProps {
  records: DescentRecord[];
  operatorName: string;
}

export const DaySummary: React.FC<DaySummaryProps> = ({ records, operatorName }) => {
  const getCountByType = (type: 'B' | 'T0' | 'T1' | 'T2') => {
    return records.filter(record => record.type === type).length;
  };

  const getFirstAndLastDescents = () => {
    if (records.length === 0) return { first: null, last: null };
    
    const sortedRecords = [...records].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    return {
      first: sortedRecords[0],
      last: sortedRecords[sortedRecords.length - 1]
    };
  };

  const { first, last } = getFirstAndLastDescents();

  const getHourlyData = () => {
    const hourlyCount: { [hour: string]: number } = {};
    
    records.forEach(record => {
      const hour = new Date(record.timestamp).getHours();
      const hourKey = `${hour.toString().padStart(2, '0')}:00`;
      hourlyCount[hourKey] = (hourlyCount[hourKey] || 0) + 1;
    });

    return Object.entries(hourlyCount).sort(([a], [b]) => a.localeCompare(b));
  };

  const hourlyData = getHourlyData();
  const maxHourlyCount = Math.max(...hourlyData.map(([, count]) => count), 1);

  if (records.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-semibold text-muted-foreground mb-2">
          Nenhum dado para resumir
        </h3>
        <p className="text-muted-foreground">
          Registre algumas descidas para ver o resumo do dia
        </p>
      </div>
    );
  }

  return (
    <div id="summary-export" className="space-y-6 max-w-4xl mx-auto bg-background p-6 rounded-lg">
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-primary to-blue-600 text-primary-foreground rounded-2xl p-6 shadow-xl mb-4">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            🎯 CONTADOR DE DESCIDAS
          </h1>
          <h2 className="text-xl sm:text-2xl font-semibold">
            📊 Resumo do Dia
          </h2>
        </div>
        <p className="text-lg text-muted-foreground">
          {new Date().toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
        {operatorName && (
          <p className="text-muted-foreground mt-2">Operador: {operatorName}</p>
        )}
      </div>

      {/* Total Geral */}
      <div className="bg-primary text-primary-foreground rounded-xl p-6 text-center shadow-lg">
        <h3 className="text-xl font-semibold mb-2">Total de Descidas</h3>
        <div className="text-5xl font-bold">{records.length}</div>
      </div>

      {/* Totais por Tipo */}
      <div className="bg-card rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-center">Descidas por Tipo de Cadeirinha</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { type: 'B' as const, emoji: '🟢', color: 'border-green-500' },
            { type: 'T0' as const, emoji: '🔵', color: 'border-blue-500' },
            { type: 'T1' as const, emoji: '🟡', color: 'border-yellow-500' },
            { type: 'T2' as const, emoji: '🔴', color: 'border-red-500' }
          ].map(({ type, emoji, color }) => (
            <div key={type} className={`bg-accent rounded-lg p-4 text-center border-2 ${color}`}>
              <div className="text-3xl mb-2">{emoji}</div>
              <div className="text-2xl font-bold">{getCountByType(type)}</div>
              <div className="text-sm text-muted-foreground">Cadeirinha {type}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Primeira e Última Descida */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-3 text-center">🌅 Primeira Descida</h3>
          {first && (
            <div className="text-center">
              <div className="text-2xl mb-2">
                {first.type === 'B' ? '🟢' : first.type === 'T0' ? '🔵' : first.type === 'T1' ? '🟡' : '🔴'}
              </div>
              <div className="font-medium">Cadeirinha {first.type}</div>
              <div className="text-sm text-muted-foreground">
                {new Date(first.timestamp).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          )}
        </div>

        <div className="bg-card rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-3 text-center">🌅 Última Descida</h3>
          {last && (
            <div className="text-center">
              <div className="text-2xl mb-2">
                {last.type === 'B' ? '🟢' : last.type === 'T0' ? '🔵' : last.type === 'T1' ? '🟡' : '🔴'}
              </div>
              <div className="font-medium">Cadeirinha {last.type}</div>
              <div className="text-sm text-muted-foreground">
                {new Date(last.timestamp).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Gráfico por Hora */}
      {hourlyData.length > 0 && (
        <div className="bg-card rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-center">Descidas por Hora</h3>
          <div className="space-y-2">
            {hourlyData.map(([hour, count]) => (
              <div key={hour} className="flex items-center space-x-3">
                <div className="w-12 text-sm text-muted-foreground">{hour}</div>
                <div className="flex-1 bg-accent rounded-full h-6 relative overflow-hidden">
                  <div 
                    className="bg-primary h-full rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium transition-all duration-500"
                    style={{ width: `${(count / maxHourlyCount) * 100}%`, minWidth: count > 0 ? '2rem' : '0' }}
                  >
                    {count > 0 && count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
