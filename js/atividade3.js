/**
 * RoboCode - Atividade 03: Sensor de Distância
 * Comportamentos e interações da página
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('📡 Atividade 03 - Sensor carregada com sucesso!');

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
                
                // Atualiza a URL sem recarregar a página
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
    // 2. ANIMAÇÃO DE CARDS AO PASSAR O MOUSE
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
    // 6. DETECTAR MUDANÇAS DE ABA
    // ==========================================
    const tabObserver = new MutationObserver(() => {
        const activeTab = document.querySelector('.tab-btn.active');
        if (activeTab) {
            const tabName = activeTab.getAttribute('data-tab');
            console.log(`📊 Aba ativa: ${tabName}`);
        }
    });

    tabButtons.forEach(btn => {
        tabObserver.observe(btn, { attributes: true, attributeFilter: ['class'] });
    });

    // ==========================================
    // 7. SIMULAÇÃO DE LEITURA DO SENSOR
    // ==========================================
    // Adiciona interação visual para simular a leitura do sensor
    const headerIcon = document.querySelector('.header-icon');
    if (headerIcon) {
        let isMeasuring = false;
        
        headerIcon.addEventListener('click', function() {
            if (isMeasuring) return;
            
            isMeasuring = true;
            this.style.transform = 'scale(0.9)';
            this.style.transition = 'transform 0.1s ease';
            
            // Simula uma leitura de distância
            const distancia = Math.floor(Math.random() * 200) + 10; // 10 a 210 cm
            const status = distancia < 100 ? '🟢 OBJETO PRÓXIMO!' : '🔵 OBJETO LONGE';
            
            // Feedback visual
            const originalBg = this.style.backgroundColor;
            this.style.backgroundColor = '#d5b8e8';
            
            // Exibe a leitura simulada
            console.log(`📡 Distância medida: ${distancia}cm - ${status}`);
            
            // Notificação para o usuário
            const mensagem = `📡 Leitura do Sensor: ${distancia}cm\n${status}`;
            
            // Usa um alert apenas para demonstração
            // Em produção, poderia usar um modal ou toast notification
            if (distancia < 100) {
                alert(`📡 OBJETO DETECTADO!\nDistância: ${distancia}cm\n\n💡 O LED acenderia!`);
            } else {
                alert(`📡 Nenhum objeto próximo.\nDistância: ${distancia}cm\n\n💡 O LED permaneceria apagado.`);
            }
            
            setTimeout(() => {
                this.style.transform = 'scale(1)';
                this.style.backgroundColor = originalBg || '#f4ebf9';
                isMeasuring = false;
            }, 300);
        });
        
        // Dica para o usuário
        console.log('💡 Clique no ícone do sensor para simular uma leitura de distância!');
    }

    // ==========================================
    // 8. FUNÇÃO PARA RESETAR O PROGRESSO
    // ==========================================
    window.resetProgress = function() {
        if (confirm('⚠️ Tem certeza que deseja resetar o progresso da Atividade 03?')) {
            localStorage.removeItem('atividade3_concluida');
            alert('🔄 Progresso resetado! Recarregue a página para ver as mudanças.');
            location.reload();
        }
    };

    // ==========================================
    // 9. FUNÇÃO PARA VERIFICAR PROGRESSO
    // ==========================================
    window.verificarProgresso = function() {
        const status = localStorage.getItem('atividade3_concluida') === 'true';
        console.log(`📊 Status da Atividade 03: ${status ? '✅ Concluída' : '⏳ Pendente'}`);
        return status;
    };

    // ==========================================
    // 10. SIMULAÇÃO DE DISTÂNCIA CONTÍNUA (Opcional)
    // ==========================================
    // Função para simular leituras contínuas do sensor
    let intervaloSimulacao = null;
    
    window.iniciarSimulacaoSensor = function() {
        if (intervaloSimulacao) {
            console.log('⏹️ Simulação já está em execução.');
            return;
        }
        
        console.log('🔄 Iniciando simulação contínua do sensor...');
        intervaloSimulacao = setInterval(() => {
            const distancia = Math.floor(Math.random() * 200) + 10;
            const status = distancia < 100 ? 'PRÓXIMO' : 'LONGE';
            console.log(`📡 Sensor: ${distancia}cm - ${status}`);
        }, 3000);
    };
    
    window.pararSimulacaoSensor = function() {
        if (intervaloSimulacao) {
            clearInterval(intervaloSimulacao);
            intervaloSimulacao = null;
            console.log('⏹️ Simulação do sensor interrompida.');
        } else {
            console.log('ℹ️ Nenhuma simulação em execução.');
        }
    };

    console.log('✅ Atividade 03 inicializada com sucesso!');
    console.log('💡 Digite iniciarSimulacaoSensor() para simular leituras contínuas.');
    console.log('💡 Digite pararSimulacaoSensor() para interromper a simulação.');
});


// ==========================================
// 11. FUNÇÃO GLOBAL PARA STATUS DO SENSOR
// ==========================================
window.statusSensor = function() {
    const distancia = Math.floor(Math.random() * 200) + 10;
    const status = distancia < 100 ? '🟢 OBJETO PRÓXIMO' : '🔵 OBJETO LONGE';
    return {
        distancia: distancia,
        status: status,
        led: distancia < 100 ? 'LIGADO' : 'DESLIGADO'
    };
};