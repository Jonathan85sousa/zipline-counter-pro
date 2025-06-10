
import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import { DescentRecord } from '../pages/Index';

interface ExportButtonProps {
  records: DescentRecord[];
  operatorName: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ records, operatorName }) => {
  const [isExporting, setIsExporting] = useState(false);

  const exportSummaryAsImage = async () => {
    if (records.length === 0) {
      alert('Não há dados para exportar. Registre algumas descidas primeiro.');
      return;
    }

    setIsExporting(true);
    
    try {
      const element = document.getElementById('summary-export');
      if (!element) {
        throw new Error('Elemento de resumo não encontrado');
      }

      // Configurações para melhor qualidade da imagem
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        height: element.scrollHeight,
        width: element.scrollWidth
      });

      // Converter canvas para blob e fazer download
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Erro ao gerar imagem');
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        const date = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
        const filename = `tirolesa-resumo-${date}${operatorName ? `-${operatorName.replace(/\s+/g, '-')}` : ''}.png`;
        link.download = filename;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 'image/png', 1.0);

    } catch (error) {
      console.error('Erro ao exportar imagem:', error);
      alert('Erro ao exportar imagem. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={exportSummaryAsImage}
      disabled={isExporting || records.length === 0}
      className={`px-8 py-4 rounded-xl font-semibold text-lg shadow-lg transition-all transform ${
        isExporting 
          ? 'bg-muted text-muted-foreground cursor-not-allowed' 
          : records.length === 0
          ? 'bg-muted text-muted-foreground cursor-not-allowed'
          : 'bg-green-600 hover:bg-green-700 text-white hover:scale-105 active:scale-95'
      }`}
    >
      {isExporting ? (
        <div className="flex items-center space-x-2">
          <div className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full"></div>
          <span>Exportando...</span>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <span>📸</span>
          <span>Exportar como PNG</span>
        </div>
      )}
    </button>
  );
};
