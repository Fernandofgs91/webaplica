/**
 * RoboCode - Atividade 01: LED
 * Comportamentos e interações da página
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔦 Atividade 01 - LED carregada com sucesso!');

    // ==========================================
    // 1. SISTEMA DE ABAS (TABS)
    // ==========================================
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = {
        sobre: document.getElementById('sobre'),
        materiais: document.getElementById('materiais'),
        passo: document.getElementById('passo')
    };

    // Função para abrir uma aba específica
    function openTab(tabId) {
        // Esconde todos os conteúdos
        Object.values(tabContents).forEach(content => {
            if (content) content.style.display = 'none';
        });

        // Remove a classe 'active' de todos os botões
        tabButtons.forEach(btn => {
            btn.classList.remove('active');
        });

        // Mostra o conteúdo da aba selecionada
        if (tabContents[tabId]) {
            tabContents[tabId].style.display = 'block';
        }

        // Adiciona a classe 'active' ao botão correspondente
        const activeButton = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }

    // Adiciona evento de clique em cada botão de aba
    tabButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const tabId = this.getAttribute('data-tab');
            if (tabId) {
                openTab(tabId);
                
                // Atualiza a URL sem recarregar a página (opcional)
                history.pushState(null, null, `?tab=${tabId}`);
            }
        });
    });

    // Verifica se há uma aba na URL ao carregar a página
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && tabContents[tabParam]) {
        openTab(tabParam);
    }

    // ==========================================
    // 2. BOTÃO "MARCAR COMO CONCLUÍDA"
    // ==========================================
    const btnConcluir = document.getElementById('btnConcluir');

    if (btnConcluir) {
        // Verifica se a atividade já foi concluída (salvo no localStorage)
        const isCompleted = localStorage.getItem('atividade1_concluida') === 'true';
        
        if (isCompleted) {
            btnConcluir.classList.add('completed');
            btnConcluir.innerHTML = '<i class="fa-solid fa-check-circle"></i> Atividade já concluída! ✅';
        }

        btnConcluir.addEventListener('click', function() {
            // Se já estiver concluída, não faz nada
            if (this.classList.contains('completed')) {
                alert('📌 Esta atividade já foi concluída anteriormente!');
                return;
            }

            // Confirmação antes de marcar como concluída
            const confirmar = confirm('✅ Deseja marcar esta atividade como concluída?');
            
            if (confirmar) {
                // Salva no localStorage
                localStorage.setItem('atividade1_concluida', 'true');
                
                // Atualiza o botão
                this.classList.add('completed');
                this.innerHTML = '<i class="fa-solid fa-check-circle"></i> Atividade concluída! ✅';
                
                // Mensagem de sucesso
                alert('🎉 Parabéns! Você concluiu a Atividade 01 - LED!');
                
                // Dispara um evento personalizado (para possíveis integrações futuras)
                document.dispatchEvent(new CustomEvent('atividadeConcluida', {
                    detail: { atividade: 'LED', numero: 1 }
                }));
            }
        });
    }

    // ==========================================
    // 3. ANIMAÇÃO DE CARDS AO PASSAR O MOUSE
    // ==========================================
    const resourceCards = document.querySelectorAll('.resource-card');
    resourceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s ease';
        });
    });

    // ==========================================
    // 4. CONTADOR DE RECURSOS DISPONÍVEIS
    // ==========================================
    const totalRecursos = document.querySelectorAll('.resource-card').length;
    console.log(`📚 Total de recursos disponíveis: ${totalRecursos}`);

    // ==========================================
    // 5. SCROLL SUAVE PARA LINKS INTERNOS
    // ==========================================
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ==========================================
    // 6. DETECTAR MUDANÇAS DE ABA (Para Analytics)
    // ==========================================
    const tabObserver = new MutationObserver(() => {
        const activeTab = document.querySelector('.tab-btn.active');
        if (activeTab) {
            const tabName = activeTab.getAttribute('data-tab');
            console.log(`📊 Aba ativa: ${tabName}`);
        }
    });

    // Observa mudanças na classe 'active' dos botões
    tabButtons.forEach(btn => {
        tabObserver.observe(btn, { attributes: true, attributeFilter: ['class'] });
    });

    console.log('✅ Atividade 01 inicializada com sucesso!');
});

// ==========================================
// 7. EVENTO PARA RESETAR O PROGRESSO (Ferramenta de Debug)
// ==========================================
// Digite no console: resetProgress() para limpar o progresso da atividade
window.resetProgress = function() {
    if (confirm('⚠️ Tem certeza que deseja resetar o progresso da Atividade 01?')) {
        localStorage.removeItem('atividade1_concluida');
        alert('🔄 Progresso resetado! Recarregue a página para ver as mudanças.');
        location.reload();
    }
};