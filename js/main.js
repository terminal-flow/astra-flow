 (function() {
        'use strict';

        /* ===== 1. INTERSECTION OBSERVER — Scroll Reveal ===== */
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.06, rootMargin: '0px 0px -30px 0px' });

        document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

        /* ===== 2. NAVBAR SCROLL EFFECT ===== */
        const navbar = document.getElementById('navbar');
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('nav-scrolled', window.pageYOffset > 40);
        }, { passive: true });

        /* ===== 3. MOBILE MENU ===== */
        const mobileToggle = document.getElementById('mobile-toggle');
        const mobileMenu = document.getElementById('mobile-menu');
        const hamburgerIcon = document.getElementById('hamburger-icon');
        const closeIcon = document.getElementById('close-icon');
        let menuOpen = false;

        mobileToggle.addEventListener('click', () => {
            menuOpen = !menuOpen;
            mobileMenu.classList.toggle('open', menuOpen);
            hamburgerIcon.classList.toggle('hidden', menuOpen);
            closeIcon.classList.toggle('hidden', !menuOpen);
        });

        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuOpen = false;
                mobileMenu.classList.remove('open');
                hamburgerIcon.classList.remove('hidden');
                closeIcon.classList.add('hidden');
            });
        });

        /* ===== 4. HERO CANVAS — AI Network Animation ===== */
        const canvas = document.getElementById('hero-canvas');
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animFrame;
        let canvasWidth, canvasHeight;

        function resizeCanvas() {
            const section = canvas.parentElement;
            canvasWidth = section.offsetWidth;
            canvasHeight = section.offsetHeight;
            canvas.width = canvasWidth * window.devicePixelRatio;
            canvas.height = canvasHeight * window.devicePixelRatio;
            canvas.style.width = canvasWidth + 'px';
            canvas.style.height = canvasHeight + 'px';
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        }

        function initParticles() {
            particles = [];
            const count = Math.min(Math.floor((canvasWidth * canvasHeight) / 18000), 80);
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * canvasWidth,
                    y: Math.random() * canvasHeight,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    r: Math.random() * 1.5 + 0.5,
                    opacity: Math.random() * 0.3 + 0.1
                });
            }
        }

        function drawParticles() {
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            const connectionDist = 150;

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > canvasWidth) p.vx *= -1;
                if (p.y < 0 || p.y > canvasHeight) p.vy *= -1;

                // Draw particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(25, 25, 112, ${p.opacity})`;
                ctx.fill();

                // Draw connections
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < connectionDist) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(25, 25, 112, ${0.04 * (1 - dist / connectionDist)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }

            animFrame = requestAnimationFrame(drawParticles);
        }

        // Use IntersectionObserver to only animate when visible
        const canvasObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!animFrame) drawParticles();
                } else {
                    if (animFrame) {
                        cancelAnimationFrame(animFrame);
                        animFrame = null;
                    }
                }
            });
        }, { threshold: 0 });

        resizeCanvas();
        initParticles();
        canvasObserver.observe(canvas);

        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                resizeCanvas();
                initParticles();
            }, 200);
        }, { passive: true });

        /* ===== 5. TERMINAL TYPING ANIMATION ===== */
        const terminalOutput = document.getElementById('terminal-output');
        const terminalLines = [
            { type: 'command', text: '$ astra deploy --workflow customer-onboarding' },
            { type: 'output', text: '▸ Validating workflow config...' },
            { type: 'output', text: '▸ Building execution graph... 4 nodes, 3 edges' },
            { type: 'output', text: '▸ Deploying to production cluster...' },
            { type: 'success', text: '✓ Workflow deployed successfully' },
            { type: 'link', text: '  Dashboard: https://app.astraflow.ai/wf/a8f3k2' },
            { type: 'spacer', text: '' },
            { type: 'command', text: '$ astra agent run support-v3 --live' },
            { type: 'output', text: '▸ Loading agent: support-v3 (GPT-4o)' },
            { type: 'output', text: '▸ Connecting tools: slack, zendesk, notion' },
            { type: 'success', text: '✓ Agent running — monitoring 3 channels' },
            { type: 'spacer', text: '' },
            { type: 'command', text: '$ astra trigger automation invoice-processor' },
            { type: 'output', text: '▸ Triggering: invoice-processor' },
            { type: 'output', text: '▸ Processing 847 pending items...' },
            { type: 'success', text: '✓ Complete — 847/847 processed (avg 120ms)' },
        ];

        let terminalStarted = false;

        function startTerminal() {
            if (terminalStarted) return;
            terminalStarted = true;
            terminalOutput.innerHTML = '';

            let lineIndex = 0;

            function typeLine() {
                if (lineIndex >= terminalLines.length) {
                    // Add blinking cursor
                    const cursorLine = document.createElement('p');
                    cursorLine.innerHTML = '<span class="text-white/30">$</span> <span class="cursor-blink inline-block w-1.5 h-3.5 bg-white/50 ml-0.5"></span>';
                    terminalOutput.appendChild(cursorLine);
                    return;
                }

                const line = terminalLines[lineIndex];
                const el = document.createElement('p');

                if (line.type === 'spacer') {
                    el.innerHTML = '&nbsp;';
                    el.style.height = '8px';
                } else if (line.type === 'command') {
                    el.innerHTML = `<span class="text-white/30">$</span> <span class="text-white/90">${line.text.substring(2)}</span>`;
                } else if (line.type === 'success') {
                    el.innerHTML = `<span class="text-emerald-400/80">${line.text}</span>`;
                } else if (line.type === 'link') {
                    el.innerHTML = `<span class="text-white/25">${line.text.split(':')[0]}:</span> <span class="text-blue-400/70 underline">${line.text.split(': ')[1]}</span>`;
                } else {
                    el.innerHTML = `<span class="text-white/30">${line.text}</span>`;
                }

                el.style.opacity = '0';
                el.style.transform = 'translateY(4px)';
                terminalOutput.appendChild(el);

                requestAnimationFrame(() => {
                    el.style.transition = 'opacity 0.3s, transform 0.3s';
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                });

                lineIndex++;
                const delay = line.type === 'command' ? 600 : line.type === 'spacer' ? 200 : 250;
                setTimeout(typeLine, delay);
            }

            setTimeout(typeLine, 400);
        }

        // Trigger terminal when in view
        const terminalSection = terminalOutput.closest('section');
        const terminalObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    startTerminal();
                    terminalObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        terminalObserver.observe(terminalSection);

        /* ===== 6. COPY BUTTON ===== */
        const copyBtn = document.getElementById('copy-btn');
        copyBtn.addEventListener('click', () => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            copyBtn.style.color = 'rgba(52,211,153,0.8)';
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.color = '';
            }, 2000);
        });

        /* ===== 7. CTA FORM ===== */
        const ctaForm = document.getElementById('cta-form');
        const ctaMessage = document.getElementById('cta-message');
        ctaForm.addEventListener('submit', (e) => {
            e.preventDefault();
            ctaMessage.classList.remove('hidden');
            ctaForm.reset();
            setTimeout(() => ctaMessage.classList.add('hidden'), 5000);
        });

    })();