
import React from 'react';

interface HeaderProps {
  operatorName: string;
  setOperatorName: (name: string) => void;
  onClearAll: () => void;
}

export const Header: React.FC<HeaderProps> = ({ operatorName, setOperatorName, onClearAll }) => {
  return (
    <header className="bg-card shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary">
              🏔️ Contador de Descidas
            </h1>
            <p className="text-muted-foreground">
              {new Date().toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              placeholder="Nome do operador"
              value={operatorName}
              onChange={(e) => setOperatorName(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm bg-background"
            />
            <button
              onClick={onClearAll}
              className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors text-sm font-medium"
            >
              Zerar Tudo
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
