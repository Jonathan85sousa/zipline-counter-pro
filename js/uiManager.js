
/*
GERENCIADOR DE INTERFACE
=======================
*/

export class UIManager {
    constructor() {
        this.activeTab = 'counter';
        this.modalCallback = null;
    }

    updateCurrentDate() {
        const dateElement = document.getElementById('currentDate');
        if (dateElement) {
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            const currentDate = new Date().toLocaleDateString('pt-BR', options);
            dateElement.textContent = currentDate;
        }
    }

    switchTab(tab) {
        this.activeTab = tab;
        
        // Atualizar botões
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(function(btn) {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector('[data-tab="' + tab + '"]');
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        // Atualizar conteúdo
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(function(content) {
            content.classList.remove('active');
        });
        const activeContent = document.getElementById(tab + 'Tab');
        if (activeContent) {
            activeContent.classList.add('active');
        }
    }

    showConfirmModal(message, callback) {
        this.modalCallback = callback;
        const modalMessage = document.getElementById('modalMessage');
        const modalOverlay = document.getElementById('modalOverlay');
        
        if (modalMessage) modalMessage.textContent = message;
        if (modalOverlay) modalOverlay.classList.add('active');
    }

    hideModal() {
        const modalOverlay = document.getElementById('modalOverlay');
        if (modalOverlay) modalOverlay.classList.remove('active');
        this.modalCallback = null;
    }

    showNotification(message) {
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

    getTypeEmoji(type) {
        const emojis = {
            'B': '🟢',
            'T0': '🔵',
            'T1': '🟡',
            'T2': '🔴'
        };
        return emojis[type] || '⚪';
    }

    getTypeColor(type) {
        const colors = {
            'B': 'green',
            'T0': 'blue',
            'T1': 'yellow',
            'T2': 'red'
        };
        return colors[type] || 'gray';
    }
}
