// Controle de abas - Atividade 4 (modernizado)
document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = {
        sobre: document.getElementById('sobre'),
        materiais: document.getElementById('materiais'),
        passo: document.getElementById('passo')
    };

    function activateTab(tabId) {
        // Remove classe active de todas as abas
        tabs.forEach(tab => tab.classList.remove('active'));
        // Adiciona active na aba clicada
        const activeTab = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
        if (activeTab) activeTab.classList.add('active');

        // Oculta todos os conteúdos
        Object.values(contents).forEach(content => {
            if (content) content.style.display = 'none';
        });

        // Mostra o conteúdo correspondente
        if (contents[tabId]) {
            contents[tabId].style.display = 'block';
        }
    }

    // Event listeners
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            activateTab(tabId);
        });
    });

    // Inicializa com a aba "sobre" ativa
    activateTab('sobre');
});