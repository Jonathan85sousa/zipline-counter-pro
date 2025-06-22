
/*
ANIMAÇÕES E ESTILOS DINÂMICOS
============================
*/

// CSS para animações
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

// Tratamento de erros
window.addEventListener('error', function(event) {
    console.error('Erro na aplicação:', event.error);
});
