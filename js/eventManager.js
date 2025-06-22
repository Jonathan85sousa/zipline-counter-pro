
/*
GERENCIADOR DE EVENTOS
=====================
*/

export class EventManager {
    constructor(dataManager, displayManager, uiManager) {
        this.dataManager = dataManager;
        this.displayManager = displayManager;
        this.uiManager = uiManager;
    }

    bindEvents() {
        this.bindCounterEvents();
        this.bindTabEvents();
        this.bindFormEvents();
        this.bindModalEvents();
        this.bindKeyboardEvents();
    }

    bindCounterEvents() {
        // Eventos dos botões de contador (adicionar)
        const counterBtns = document.querySelectorAll('.counter-btn');
        console.log('Vinculando eventos aos botões de contador:', counterBtns.length);
        
        const self = this;
        counterBtns.forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const type = this.getAttribute('data-type');
                console.log('Clique no botão contador:', type);
                
                self.dataManager.addRecord(type);
                self.displayManager.updateDisplay();
                self.uiManager.showNotification('Descida ' + type + ' registrada!');
                
                // Animação de feedback
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            });
        });

        // Eventos dos botões de reduzir
        const reduceBtns = document.querySelectorAll('.reduce-btn');
        console.log('Vinculando eventos aos botões de redução:', reduceBtns.length);
        
        reduceBtns.forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const type = this.getAttribute('data-type');
                console.log('Clique no botão redução:', type);
                
                const removed = self.dataManager.removeLastRecord(type);
                if (removed) {
                    self.displayManager.updateDisplay();
                    self.uiManager.showNotification('Descida ' + type + ' removida!');
                } else {
                    self.uiManager.showNotification('Nenhuma descida ' + type + ' para remover');
                }
                
                // Animação de feedback
                this.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            });
        });
    }

    bindTabEvents() {
        const self = this;
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                const tab = e.currentTarget.dataset.tab;
                self.uiManager.switchTab(tab);
                
                // Atualizar dados específicos
                if (tab === 'history') {
                    self.displayManager.updateHistoryDisplay();
                } else if (tab === 'summary') {
                    self.displayManager.updateSummaryDisplay();
                }
            });
        });
    }

    bindFormEvents() {
        const self = this;
        
        // Campo nome do operador
        const operatorInput = document.getElementById('operatorName');
        if (operatorInput) {
            operatorInput.addEventListener('input', function(e) {
                self.dataManager.saveOperatorName(e.target.value);
            });
        }

        // Botão limpar tudo
        const clearBtn = document.getElementById('clearAllBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', function() {
                self.uiManager.showConfirmModal(
                    'Tem certeza que deseja zerar todas as contagens? Esta ação não pode ser desfeita.',
                    function() {
                        self.dataManager.clearAllRecords();
                        self.displayManager.updateDisplay();
                        self.uiManager.showNotification('Todos os registros foram limpos!');
                    }
                );
            });
        }
    }

    bindModalEvents() {
        const self = this;
        
        const modalCancel = document.getElementById('modalCancel');
        const modalConfirm = document.getElementById('modalConfirm');
        const modalOverlay = document.getElementById('modalOverlay');
        
        if (modalCancel) {
            modalCancel.addEventListener('click', function() {
                self.uiManager.hideModal();
            });
        }

        if (modalConfirm) {
            modalConfirm.addEventListener('click', function() {
                if (self.uiManager.modalCallback) {
                    self.uiManager.modalCallback();
                }
                self.uiManager.hideModal();
            });
        }

        if (modalOverlay) {
            modalOverlay.addEventListener('click', function(e) {
                if (e.target === e.currentTarget) {
                    self.uiManager.hideModal();
                }
            });
        }
    }

    bindKeyboardEvents() {
        const self = this;
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                self.uiManager.hideModal();
            }
            
            if (['1', '2', '3', '4'].indexOf(e.key) !== -1 && self.uiManager.activeTab === 'counter') {
                const types = ['B', 'T0', 'T1', 'T2'];
                const type = types[parseInt(e.key) - 1];
                self.dataManager.addRecord(type);
                self.displayManager.updateDisplay();
                self.uiManager.showNotification('Descida ' + type + ' registrada!');
            }
        });
    }
}
