
/*
SISTEMA DE CONTAGEM DE DESCIDAS DE TIROLESA - ARQUIVO PRINCIPAL
=============================================================
*/

// Importar módulos
import { DataManager } from './js/dataManager.js';
import { UIManager } from './js/uiManager.js';
import { EventManager } from './js/eventManager.js';
import { DisplayManager } from './js/displayManager.js';

// Variáveis globais
let dataManager, uiManager, eventManager, displayManager;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏔️ Inicializando Contador de Descidas');
    initializeApp();
});

function initializeApp() {
    try {
        // Inicializar gerenciadores
        dataManager = new DataManager();
        uiManager = new UIManager();
        displayManager = new DisplayManager(dataManager, uiManager);
        eventManager = new EventManager(dataManager, displayManager, uiManager);
        
        // Carregar dados e configurar interface
        dataManager.loadData();
        uiManager.updateCurrentDate();
        eventManager.bindEvents();
        displayManager.updateDisplay();
        
        console.log('✅ Aplicação inicializada com sucesso!');
    } catch (error) {
        console.error('Erro na inicialização:', error);
    }
}

// Funções globais expostas para o HTML
window.deleteRecord = function(id) {
    dataManager.deleteRecord(id);
    displayManager.updateDisplay();
    uiManager.showNotification('Registro excluído!');
};

window.exportSummaryAsImage = function() {
    const records = dataManager.getTodayRecords();
    
    if (records.length === 0) {
        alert('Não há dados para exportar. Registre algumas descidas primeiro.');
        return;
    }
    
    const exportBtn = document.getElementById('exportBtn');
    if (!exportBtn) return;
    
    const originalHTML = exportBtn.innerHTML;
    
    exportBtn.innerHTML = '<div class="loading"><div class="spinner"></div><span>Exportando...</span></div>';
    exportBtn.disabled = true;
    
    setTimeout(function() {
        try {
            const date = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
            const filename = 'tirolesa-resumo-' + date + (dataManager.operatorName ? '-' + dataManager.operatorName.replace(/\s+/g, '-') : '') + '.png';
            
            console.log('Simulando download de: ' + filename);
            alert('Em uma implementação real, seria baixado o arquivo: ' + filename);
            uiManager.showNotification('Resumo exportado com sucesso!');
        } catch (error) {
            console.error('Erro ao exportar:', error);
            alert('Erro ao exportar imagem. Tente novamente.');
        } finally {
            exportBtn.innerHTML = originalHTML;
            exportBtn.disabled = false;
        }
    }, 2000);
};

console.log('📋 Sistema carregado - Funcionalidades disponíveis:');
console.log('🔧 Atalhos: 1-4 para adicionar descidas, ESC para fechar modal');
console.log('💾 Dados salvos automaticamente no navegador');
