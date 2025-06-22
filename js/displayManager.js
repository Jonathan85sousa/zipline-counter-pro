
/*
GERENCIADOR DE EXIBIÇÃO
======================
*/

export class DisplayManager {
    constructor(dataManager, uiManager) {
        this.dataManager = dataManager;
        this.uiManager = uiManager;
    }

    updateDisplay() {
        this.updateCounterDisplay();
        this.updateHistoryCount();
        
        if (this.uiManager.activeTab === 'history') {
            this.updateHistoryDisplay();
        } else if (this.uiManager.activeTab === 'summary') {
            this.updateSummaryDisplay();
        }
    }

    updateCounterDisplay() {
        const todayRecords = this.dataManager.getTodayRecords();
        
        // Contar por tipo
        const counts = {
            B: todayRecords.filter(function(r) { return r.type === 'B'; }).length,
            T0: todayRecords.filter(function(r) { return r.type === 'T0'; }).length,
            T1: todayRecords.filter(function(r) { return r.type === 'T1'; }).length,
            T2: todayRecords.filter(function(r) { return r.type === 'T2'; }).length
        };
        
        // Atualizar contadores
        const types = Object.keys(counts);
        types.forEach(function(type) {
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

    updateHistoryCount() {
        const todayRecords = this.dataManager.getTodayRecords();
        const countElement = document.getElementById('historyCount');
        if (countElement) {
            countElement.textContent = '(' + todayRecords.length + ')';
        }
    }

    updateHistoryDisplay() {
        const todayRecords = this.dataManager.getTodayRecords();
        const historyList = document.getElementById('historyList');
        const emptyHistory = document.getElementById('emptyHistory');
        const historyDescription = document.getElementById('historyDescription');
        
        // Atualizar descrição
        const count = todayRecords.length;
        if (historyDescription) {
            historyDescription.textContent = count + ' descida' + (count !== 1 ? 's' : '') + ' registrada' + (count !== 1 ? 's' : '');
        }
        
        if (todayRecords.length === 0) {
            if (historyList) historyList.style.display = 'none';
            if (emptyHistory) emptyHistory.style.display = 'block';
            return;
        }
        
        if (historyList) historyList.style.display = 'block';
        if (emptyHistory) emptyHistory.style.display = 'none';
        
        // Ordenar por data (mais recente primeiro)
        const sortedRecords = todayRecords.slice().sort(function(a, b) {
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
        
        // Gerar HTML
        const self = this;
        let html = '';
        sortedRecords.forEach(function(record, index) {
            const emoji = self.uiManager.getTypeEmoji(record.type);
            const color = self.uiManager.getTypeColor(record.type);
            const time = new Date(record.timestamp).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            const number = sortedRecords.length - index;
            
            html += '<div class="history-item">' +
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
        });
        
        if (historyList) {
            historyList.innerHTML = html;
        }
    }

    updateSummaryDisplay() {
        const todayRecords = this.dataManager.getTodayRecords();
        const summaryContent = document.getElementById('summaryContent');
        const emptySummary = document.getElementById('emptySummary');
        const exportBtn = document.getElementById('exportBtn');
        
        if (todayRecords.length === 0) {
            if (summaryContent) summaryContent.style.display = 'none';
            if (emptySummary) emptySummary.style.display = 'block';
            if (exportBtn) exportBtn.disabled = true;
            return;
        }
        
        if (summaryContent) summaryContent.style.display = 'block';
        if (emptySummary) emptySummary.style.display = 'none';
        if (exportBtn) exportBtn.disabled = false;
        
        if (summaryContent) {
            summaryContent.innerHTML = this.generateSummaryHTML(todayRecords);
        }
    }

    generateSummaryHTML(records) {
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
        const hourlyData = this.getHourlyData(records);
        
        return '<div class="summary-header">' +
                '<h2 class="summary-title">📊 Resumo do Dia</h2>' +
                '<p class="summary-date">' + new Date().toLocaleDateString('pt-BR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                }) + '</p>' +
                (this.dataManager.operatorName ? '<p class="summary-operator">Operador: ' + this.dataManager.operatorName + '</p>' : '') +
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
                    '<div class="summary-time-emoji">' + this.uiManager.getTypeEmoji(first.type) + '</div>' +
                    '<div class="summary-time-type">Cadeirinha ' + first.type + '</div>' +
                    '<div class="summary-time-value">' + new Date(first.timestamp).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                    }) + '</div>' +
                '</div>' +
                '<div class="summary-time-card">' +
                    '<h3>🌆 Última Descida</h3>' +
                    '<div class="summary-time-emoji">' + this.uiManager.getTypeEmoji(last.type) + '</div>' +
                    '<div class="summary-time-type">Cadeirinha ' + last.type + '</div>' +
                    '<div class="summary-time-value">' + new Date(last.timestamp).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                    }) + '</div>' +
                '</div>' +
            '</div>' +

            (hourlyData.length > 0 ? this.generateHourlyChartHTML(hourlyData) : '');
    }

    generateHourlyChartHTML(hourlyData) {
        const maxCount = Math.max.apply(Math, hourlyData.map(function(item) { return item[1]; }));
        
        let html = '';
        hourlyData.forEach(function(item) {
            const hour = item[0];
            const count = item[1];
            html += '<div class="chart-bar">' +
                '<div class="chart-time">' + hour + '</div>' +
                '<div class="chart-bar-container">' +
                    '<div class="chart-bar-fill" style="width: ' + (count / maxCount * 100) + '%">' +
                        (count > 0 ? count : '') +
                    '</div>' +
                '</div>' +
            '</div>';
        });
        
        return '<div class="hourly-chart">' +
            '<h3>Descidas por Hora</h3>' +
            html +
        '</div>';
    }

    getHourlyData(records) {
        const hourlyCount = {};
        
        records.forEach(function(record) {
            const hour = new Date(record.timestamp).getHours();
            let hourKey = hour.toString();
            if (hourKey.length === 1) hourKey = '0' + hourKey;
            hourKey += ':00';
            hourlyCount[hourKey] = (hourlyCount[hourKey] || 0) + 1;
        });
        
        const result = [];
        const keys = Object.keys(hourlyCount);
        keys.forEach(function(key) {
            result.push([key, hourlyCount[key]]);
        });
        
        result.sort(function(a, b) {
            return a[0].localeCompare(b[0]);
        });
        
        return result;
    }
}
