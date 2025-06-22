
/*
GERENCIADOR DE DADOS
==================
*/

export class DataManager {
    constructor() {
        this.records = [];
        this.operatorName = '';
    }

    loadData() {
        try {
            const storedRecords = localStorage.getItem('tirolesa-records');
            this.records = storedRecords ? JSON.parse(storedRecords) : [];
            
            const storedOperator = localStorage.getItem('operator-name');
            this.operatorName = storedOperator || '';
            
            const operatorInput = document.getElementById('operatorName');
            if (operatorInput) {
                operatorInput.value = this.operatorName;
            }
            console.log('Dados carregados:', this.records.length, 'registros');
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            this.records = [];
            this.operatorName = '';
        }
    }

    saveRecords() {
        try {
            localStorage.setItem('tirolesa-records', JSON.stringify(this.records));
            console.log('Dados salvos:', this.records.length, 'registros');
        } catch (error) {
            console.error('Erro ao salvar registros:', error);
        }
    }

    saveOperatorName(name) {
        this.operatorName = name;
        localStorage.setItem('operator-name', name);
    }

    getTodayRecords() {
        const today = new Date().toDateString();
        return this.records.filter(function(record) {
            const recordDate = new Date(record.timestamp).toDateString();
            return recordDate === today;
        });
    }

    addRecord(type) {
        console.log('Adicionando registro do tipo:', type);
        
        const newRecord = {
            id: Date.now().toString(),
            type: type,
            timestamp: new Date().toISOString()
        };
        
        this.records.push(newRecord);
        this.saveRecords();
        
        console.log('Registro adicionado:', newRecord);
        return newRecord;
    }

    removeLastRecord(type) {
        console.log('Removendo último registro do tipo:', type);
        
        const todayRecords = this.getTodayRecords();
        const typeRecords = todayRecords.filter(function(record) {
            return record.type === type;
        });
        
        if (typeRecords.length === 0) {
            console.log('Nenhum registro do tipo', type, 'para remover');
            return false;
        }
        
        // Pegar o último registro deste tipo (mais recente)
        const lastRecord = typeRecords.sort(function(a, b) {
            return new Date(b.timestamp) - new Date(a.timestamp);
        })[0];
        
        // Remover o registro
        this.records = this.records.filter(function(record) {
            return record.id !== lastRecord.id;
        });
        
        this.saveRecords();
        console.log('Registro removido:', lastRecord);
        return true;
    }

    deleteRecord(id) {
        this.records = this.records.filter(function(record) {
            return record.id !== id;
        });
        this.saveRecords();
    }

    clearAllRecords() {
        this.records = [];
        this.saveRecords();
    }
}
