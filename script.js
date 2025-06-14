
/*
SISTEMA DE CONTAGEM DE DESCIDAS DE TIROLESA - HTML/CSS/JS PURO
============================================================

Este sistema permite registrar e gerenciar descidas de tirolesa por tipo de cadeirinha.
Desenvolvido em HTML, CSS e JavaScript puro para máxima compatibilidade.

FUNCIONALIDADES:
- Contador de descidas por tipo (B, T0, T1, T2)
- Histórico detalhado com horários
- Resumo estatístico
- Persistência local (localStorage)
- Interface responsiva
- Sistema de notificações

ESTRUTURA DE DADOS:
- Record: { id: timestamp, type: string, timestamp: ISO date }
- Armazenamento: localStorage
*/

// ======================
// VARIÁVEIS GLOBAIS
// ======================
let records = [];
let operatorName = '';
let activeTab = 'counter';
let modalCallback = null;

// ======================
// INICIALIZAÇÃO
// ======================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏔️ Inicializando Contador de Descidas');
    initializeApp();
});

function initializeApp() {
    loadData();
    updateCurrentDate();
    bindEvents();
    updateDisplay();
    console.log('✅ Aplicação inicializada com sucesso!');
}

// ======================
// GERENCIAMENTO DE DADOS
// ======================
function loadData() {
    try {
        const storedRecords = localStorage.getItem('tirolesa-records');
        records = storedRecords ? JSON.parse(storedRecords) : [];
        
        const storedOperator = localStorage.getItem('operator-name');
        operatorName = storedOperator || '';
        
        document.getElementById('operatorName').value = operatorName;
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        records = [];
        operatorName = '';
    }
}

function saveRecords() {
    try {
        localStorage.setItem('tirolesa-records', JSON.stringify(records));
    } catch (error) {
        console.error('Erro ao salvar registros:', error);
    }
}

function saveOperatorName(name) {
    operatorName = name;
    localStorage.setItem('operator-name', name);
}

function getTodayRecords() {
    const today = new Date().toDateString();
    return records.filter(record => {
        const recordDate = new Date(record.timestamp).toDateString();
        return recordDate === today;
    });
}

// ======================
// FUNÇÕES PRINCIPAIS
// ======================
function addRecord(type) {
    const newRecord = {
        id: Date.now().toString(),
        type: type,
        timestamp: new Date().toISOString()
    };
    
    records.push(newRecord);
    saveRecords();
    updateDisplay();
    showNotification(`Descida ${type} registrada!`);
}

function deleteRecord(id) {
    records = records.filter(record => record.id !== id);
    saveRecords();
    updateDisplay();
    showNotification('Registro excluído!');
}

function clearAllRecords() {
    showConfirmModal(
        'Tem certeza que deseja zerar todas as contagens? Esta ação não pode ser desfeita.',
        function() {
            records = [];
            saveRecords();
            updateDisplay();
            showNotification('Todos os registros foram limpos!');
        }
    );
}

// ======================
// INTERFACE E EVENTOS
// ======================
function updateCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const currentDate = new Date().toLocaleDateString('pt-BR', options);
    dateElement.textContent = currentDate;
}

function bindEvents() {
    // Eventos dos botões de contador
    document.querySelectorAll('.counter-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            const type = e.currentTarget.dataset.type;
            addRecord(type);
            
            // Animação de feedback
            e.currentTarget.style.transform = 'scale(0.95)';
            setTimeout(function() {
                e.currentTarget.style.transform = '';
            }, 150);
        });
    });

    // Eventos das tabs
    document.querySelectorAll('.tab-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            const tab = e.currentTarget.dataset.tab;
            switchTab(tab);
        });
    });

    // Campo nome do operador
    document.getElementById('operatorName').addEventListener('input', function(e) {
        saveOperatorName(e.target.value);
    });

    // Botão limpar tudo
    document.getElementById('clearAllBtn').addEventListener('click', function() {
        clearAllRecords();
    });

    // Botão exportar
    document.getElementById('exportBtn').addEventListener('click', function() {
        exportSummaryAsImage();
    });

    // Eventos do modal
    document.getElementById('modalCancel').addEventListener('click', function() {
        hideModal();
    });

    document.getElementById('modalConfirm').addEventListener('click', function() {
        if (modalCallback) {
            modalCallback();
        }
        hideModal();
    });

    document.getElementById('modalOverlay').addEventListener('click', function(e) {
        if (e.target === e.currentTarget) {
            hideModal();
        }
    });

    // Atalhos de teclado
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            hideModal();
        }
        
        if (['1', '2', '3', '4'].includes(e.key) && activeTab === 'counter') {
            const types = ['B', 'T0', 'T1', 'T2'];
            addRecord(types[parseInt(e.key) - 1]);
        }
    });
}

// ======================
// NAVEGAÇÃO ENTRE TABS
// ======================
function switchTab(tab) {
    activeTab = tab;
    
    // Atualizar botões
    document.querySelectorAll('.tab-btn').forEach(function(btn) {
        btn.classList.remove('active');
    });
    document.querySelector('[data-tab="' + tab + '"]').classList.add('active');
    
    // Atualizar conteúdo
    document.querySelectorAll('.tab-content').forEach(function(content) {
        content.classList.remove('active');
    });
    document.getElementById(tab + 'Tab').classList.add('active');
    
    // Atualizar dados específicos
    if (tab === 'history') {
        updateHistoryDisplay();
    } else if (tab === 'summary') {
        updateSummaryDisplay();
    }
}

// ======================
// ATUALIZAÇÃO DE DISPLAYS
// ======================
function updateDisplay() {
    updateCounterDisplay();
    updateHistoryCount();
    
    if (activeTab === 'history') {
        updateHistoryDisplay();
    } else if (activeTab === 'summary') {
        updateSummaryDisplay();
    }
}

function updateCounterDisplay() {
    const todayRecords = getTodayRecords();
    
    // Contar por tipo
    const counts = {
        B: todayRecords.filter(function(r) { return r.type === 'B'; }).length,
        T0: todayRecords.filter(function(r) { return r.type === 'T0'; }).length,
        T1: todayRecords.filter(function(r) { return r.type === 'T1'; }).length,
        T2: todayRecords.filter(function(r) { return r.type === 'T2'; }).length
    };
    
    // Atualizar contadores
    Object.keys(counts).forEach(function(type) {
        const countElement = document.getElementById('count' + type);
        const totalElement = document.getElementById('total' + type);
        
        if (countElement) countElement.textContent = counts[type];
        if (totalElement) totalElement.textContent = counts[type];
    });
    
    // Total geral
    const grandTotal = todayRecords.length;
    const grandTotalElement = document.getElementById('grandTotal');
    if (grandTotalElement) {
        grandTotalElement.textContent = grandTotal;
    }
}

function updateHistoryCount() {
    const todayRecords = getTodayRecords();
    const countElement = document.getElementById('historyCount');
    if (countElement) {
        countElement.textContent = '(' + todayRecords.length + ')';
    }
}

function updateHistoryDisplay() {
    const todayRecords = getTodayRecords();
    const historyList = document.getElementById('historyList');
    const emptyHistory = document.getElementById('emptyHistory');
    const historyDescription = document.getElementById('historyDescription');
    
    // Atualizar descrição
    const count = todayRecords.length;
    historyDescription.textContent = count + ' descida' + (count !== 1 ? 's' : '') + ' registrada' + (count !== 1 ? 's' : '');
    
    if (todayRecords.length === 0) {
        historyList.style.display = 'none';
        emptyHistory.style.display = 'block';
        return;
    }
    
    historyList.style.display = 'block';
    emptyHistory.style.display = 'none';
    
    // Ordenar por data (mais recente primeiro)
    const sortedRecords = todayRecords.slice().sort(function(a, b) {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
    
    // Gerar HTML
    historyList.innerHTML = sortedRecords.map(function(record, index) {
        const emoji = getTypeEmoji(record.type);
        const color = getTypeColor(record.type);
        const time = new Date(record.timestamp).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        const number = sortedRecords.length - index;
        
        return '<div class="history-item">' +
            '<div class="history-item-content">' +
                '<div class="history-emoji">' + emoji + '</div>' +
                '<div class="history-details">' +
                    '<div class="history-type">' +
                        '<span class="type-badge ' + color + '">Cadeirinha ' + record.type + '</span>' +
                        '<span class="history-number">#' + number + '</span>' +
                    '</div>' +
                    '<div class="history-time">' + time + '</div>' +
                '</div>' +
            '</div>' +
            '<button class="delete-btn" onclick="deleteRecord(\'' + record.id + '\')" title="Excluir registro">' +
                '🗑️' +
            '</button>' +
        '</div>';
    }).join('');
}

function updateSummaryDisplay() {
    const todayRecords = getTodayRecords();
    const summaryContent = document.getElementById('summaryContent');
    const emptySummary = document.getElementById('emptySummary');
    const exportBtn = document.getElementById('exportBtn');
    
    if (todayRecords.length === 0) {
        summaryContent.style.display = 'none';
        emptySummary.style.display = 'block';
        exportBtn.disabled = true;
        return;
    }
    
    summaryContent.style.display = 'block';
    emptySummary.style.display = 'none';
    exportBtn.disabled = false;
    
    summaryContent.innerHTML = generateSummaryHTML(todayRecords);
}

function generateSummaryHTML(records) {
    const counts = {
        B: records.filter(function(r) { return r.type === 'B'; }).length,
        T0: records.filter(function(r) { return r.type === 'T0'; }).length,
        T1: records.filter(function(r) { return r.type === 'T1'; }).length,
        T2: records.filter(function(r) { return r.type === 'T2'; }).length
    };
    
    // Primeira e última descida
    const sortedRecords = records.slice().sort(function(a, b) {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
    const first = sortedRecords[0];
    const last = sortedRecords[sortedRecords.length - 1];
    
    // Dados por hora
    const hourlyData = getHourlyData(records);
    
    return '<div class="summary-header">' +
            '<h2 class="summary-title">📊 Resumo do Dia</h2>' +
            '<p class="summary-date">' + new Date().toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            }) + '</p>' +
            (operatorName ? '<p class="summary-operator">Operador: ' + operatorName + '</p>' : '') +
        '</div>' +

        '<div class="summary-total">' +
            '<h3>Total de Descidas</h3>' +
            '<div class="summary-total-count">' + records.length + '</div>' +
        '</div>' +

        '<div class="summary-types">' +
            '<h3>Descidas por Tipo de Cadeirinha</h3>' +
            '<div class="summary-types-grid">' +
                '<div class="summary-type-item green">' +
                    '<div class="summary-type-emoji">🟢</div>' +
                    '<div class="summary-type-count">' + counts.B + '</div>' +
                    '<div class="summary-type-label">Cadeirinha B</div>' +
                '</div>' +
                '<div class="summary-type-item blue">' +
                    '<div class="summary-type-emoji">🔵</div>' +
                    '<div class="summary-type-count">' + counts.T0 + '</div>' +
                    '<div class="summary-type-label">Cadeirinha T0</div>' +
                '</div>' +
                '<div class="summary-type-item yellow">' +
                    '<div class="summary-type-emoji">🟡</div>' +
                    '<div class="summary-type-count">' + counts.T1 + '</div>' +
                    '<div class="summary-type-label">Cadeirinha T1</div>' +
                '</div>' +
                '<div class="summary-type-item red">' +
                    '<div class="summary-type-emoji">🔴</div>' +
                    '<div class="summary-type-count">' + counts.T2 + '</div>' +
                    '<div class="summary-type-label">Cadeirinha T2</div>' +
                '</div>' +
            '</div>' +
        '</div>' +

        '<div class="summary-first-last">' +
            '<div class="summary-time-card">' +
                '<h3>🌅 Primeira Descida</h3>' +
                '<div class="summary-time-emoji">' + getTypeEmoji(first.type) + '</div>' +
                '<div class="summary-time-type">Cadeirinha ' + first.type + '</div>' +
                '<div class="summary-time-value">' + new Date(first.timestamp).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                }) + '</div>' +
            '</div>' +
            '<div class="summary-time-card">' +
                '<h3>🌆 Última Descida</h3>' +
                '<div class="summary-time-emoji">' + getTypeEmoji(last.type) + '</div>' +
                '<div class="summary-time-type">Cadeirinha ' + last.type + '</div>' +
                '<div class="summary-time-value">' + new Date(last.timestamp).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                }) + '</div>' +
            '</div>' +
        '</div>' +

        (hourlyData.length > 0 ? generateHourlyChartHTML(hourlyData) : '');
}

function generateHourlyChartHTML(hourlyData) {
    const maxCount = Math.max.apply(Math, hourlyData.map(function(item) { return item[1]; }));
    
    const barsHTML = hourlyData.map(function(item) {
        const hour = item[0];
        const count = item[1];
        return '<div class="chart-bar">' +
            '<div class="chart-time">' + hour + '</div>' +
            '<div class="chart-bar-container">' +
                '<div class="chart-bar-fill" style="width: ' + (count / maxCount * 100) + '%">' +
                    (count > 0 ? count : '') +
                '</div>' +
            '</div>' +
        '</div>';
    }).join('');
    
    return '<div class="hourly-chart">' +
        '<h3>Descidas por Hora</h3>' +
        barsHTML +
    '</div>';
}

function getHourlyData(records) {
    const hourlyCount = {};
    
    records.forEach(function(record) {
        const hour = new Date(record.timestamp).getHours();
        const hourKey = hour.toString().padStart(2, '0') + ':00';
        hourlyCount[hourKey] = (hourlyCount[hourKey] || 0) + 1;
    });
    
    return Object.entries(hourlyCount).sort(function(a, b) {
        return a[0].localeCompare(b[0]);
    });
}

// ======================
// FUNÇÕES AUXILIARES
// ======================
function getTypeEmoji(type) {
    const emojis = {
        'B': '🟢',
        'T0': '🔵',
        'T1': '🟡',
        'T2': '🔴'
    };
    return emojis[type] || '⚪';
}

function getTypeColor(type) {
    const colors = {
        'B': 'green',
        'T0': 'blue',
        'T1': 'yellow',
        'T2': 'red'
    };
    return colors[type] || 'gray';
}

// ======================
// SISTEMA DE MODAL
// ======================
function showConfirmModal(message, callback) {
    modalCallback = callback;
    document.getElementById('modalMessage').textContent = message;
    document.getElementById('modalOverlay').classList.add('active');
}

function hideModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    modalCallback = null;
}

// ======================
// SISTEMA DE NOTIFICAÇÕES
// ======================
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = 
        'position: fixed;' +
        'top: 20px;' +
        'right: 20px;' +
        'background: #10b981;' +
        'color: white;' +
        'padding: 1rem 1.5rem;' +
        'border-radius: 0.5rem;' +
        'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);' +
        'z-index: 1001;' +
        'font-weight: 600;' +
        'animation: slideInRight 0.3s ease-out;';
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(function() {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(function() {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ======================
// EXPORTAÇÃO DE IMAGEM
// ======================
function exportSummaryAsImage() {
    const records = getTodayRecords();
    
    if (records.length === 0) {
        alert('Não há dados para exportar. Registre algumas descidas primeiro.');
        return;
    }
    
    const exportBtn = document.getElementById('exportBtn');
    const originalHTML = exportBtn.innerHTML;
    
    exportBtn.innerHTML = '<div class="loading"><div class="spinner"></div><span>Exportando...</span></div>';
    exportBtn.disabled = true;
    
    setTimeout(function() {
        try {
            simulateImageExport();
            showNotification('Resumo exportado com sucesso!');
        } catch (error) {
            console.error('Erro ao exportar:', error);
            alert('Erro ao exportar imagem. Tente novamente.');
        } finally {
            exportBtn.innerHTML = originalHTML;
            exportBtn.disabled = false;
        }
    }, 2000);
}

function simulateImageExport() {
    const date = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    const filename = 'tirolesa-resumo-' + date + (operatorName ? '-' + operatorName.replace(/\s+/g, '-') : '') + '.png';
    
    console.log('Simulando download de: ' + filename);
    alert('Em uma implementação real, seria baixado o arquivo: ' + filename);
}

// ======================
// CSS PARA ANIMAÇÕES
// ======================
const style = document.createElement('style');
style.textContent = 
    '@keyframes slideInRight {' +
        'from { transform: translateX(100%); opacity: 0; }' +
        'to { transform: translateX(0); opacity: 1; }' +
    '}' +
    '@keyframes slideOutRight {' +
        'from { transform: translateX(0); opacity: 1; }' +
        'to { transform: translateX(100%); opacity: 0; }' +
    '}';
document.head.appendChild(style);

// ======================
// TRATAMENTO DE ERROS
// ======================
window.addEventListener('error', function(event) {
    console.error('Erro na aplicação:', event.error);
});

console.log('📋 Sistema carregado - Funcionalidades disponíveis:');
console.log('🔧 Atalhos: 1-4 para adicionar descidas, ESC para fechar modal');
console.log('💾 Dados salvos automaticamente no navegador');
