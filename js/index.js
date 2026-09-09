// ==========================================
// ROBÓCODE - INTERAÇÕES E COMPORTAMENTOS
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 RoboCode carregado com sucesso!');

    // ==========================================
    // 1. SCROLL SUAVE PARA LINKS INTERNOS
    // ==========================================
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            // Evita scroll se for apenas "#" ou link vazio
            if (targetId === '#' || targetId === '') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Atualiza a URL sem recarregar a página (opcional)
                history.pushState(null, null, targetId);
            }
        });
    });

    // ==========================================
    // 2. EFEITO DE DESTAQUE AO PASSOAR SOBRE CARDS
    // ==========================================
    const cards = document.querySelectorAll('.card, .feature-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
        });
    });

    // ==========================================
    // 3. CONTADOR DE CARDS VISÍVEIS (Exemplo de interação)
    // ==========================================
    const cardCount = document.querySelectorAll('.card:not([style*="opacity: 0.7"])').length;
    console.log(`📚 Atividades disponíveis: ${cardCount}`);

    // ==========================================
    // 4. ANIMAÇÃO DE ENTRADA DOS CARDS (SCROLL REVEAL)
    // ==========================================
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.card, .feature-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // ==========================================
    // 5. BOTÃO "ACESSAR AULAS" - DESTAQUE NO MENU
    // ==========================================
    const btnNav = document.querySelector('.btn-nav');
    if (btnNav) {
        btnNav.addEventListener('click', function(e) {
            // Se for o botão do menu, apenas navega normalmente
            // Este é apenas um exemplo de interação adicional
            console.log('🔗 Navegando para as atividades...');
        });
    }

    // ==========================================
    // 6. PREVENÇÃO DE CLIQUE EM BOTÕES DESABILITADOS
    // ==========================================
    document.querySelectorAll('button[disabled]').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            alert('🔒 Esta atividade ainda está em desenvolvimento!');
        });
    });

    // ==========================================
    // 7. DETECTAR SE O USUÁRIO ESTÁ NO TOPO
    // ==========================================
    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY;
        const navbar = document.querySelector('.navbar');
        
        if (scrollPosition > 100) {
            navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
        } else {
            navbar.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)';
        }
    });

    console.log('✅ Todas as interações foram inicializadas!');
});


  const navbar = document.querySelector('.navbar');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  (function() {
            'use strict';

            const modalOverlay = document.getElementById('modalOverlay');
            const abrirMenuBtn = document.getElementById('abrirModalMenuBtn');
            const fecharBtn = document.getElementById('fecharModalBtn');

            // Função para abrir o modal
            function abrirModal() {
                modalOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
                fecharBtn.focus();
            }

            // Função para fechar o modal
            function fecharModal() {
                modalOverlay.classList.remove('active');
                document.body.style.overflow = '';
                abrirMenuBtn.focus();
            }

            // Evento de clique no botão do menu
            if (abrirMenuBtn) {
                abrirMenuBtn.addEventListener('click', abrirModal);
            }

            // Evento de clique no botão fechar
            fecharBtn.addEventListener('click', fecharModal);

            // Evento de clique no overlay (fundo escuro) para fechar
            modalOverlay.addEventListener('click', function(e) {
                if (e.target === modalOverlay) {
                    fecharModal();
                }
            });

            // Evento de tecla ESC para fechar
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
                    fecharModal();
                }
            });

            // Previne que o modal feche ao clicar dentro da caixa
            const modalBox = document.querySelector('.modal-box');
            if (modalBox) {
                modalBox.addEventListener('click', function(e) {
                    e.stopPropagation();
                });
            }

            console.log('✅ Modal do CRIARTEC carregado com sucesso!');
        })();
