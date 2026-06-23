/* ============================================
   M.A.P.L.E — MediaWiki:BoPhan.js
   "Department Identity System" — logo từng bộ phận (M·A·P·L·E)
   Port từ else/malpe_identity_v3.html. Inject vào #mw-content-text.
   ============================================ */
(function () {
    function init() {
        var target = document.getElementById('bp-root-placeholder')
                  || document.getElementById('mw-content-text');
        if (!target) return;

        function logo(sz) { return (window.MAPLE && window.MAPLE.logoSVG) ? window.MAPLE.logoSVG(sz) : ''; }

        var PENT = 'M60 6L114 44L96 114H24L6 44Z';

        /* SVG cho 5 bộ phận (port nguyên hiệu ứng SMIL) */
        var SVG = {
            m: '<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                '<defs><clipPath id="bp-pent-m"><path d="' + PENT + '"/></clipPath></defs>' +
                '<path d="' + PENT + '" stroke="#3d1a00" stroke-width="1.2" fill="none"/>' +
                '<g clip-path="url(#bp-pent-m)">' +
                '<line x1="6" y1="60" x2="114" y2="60" stroke="#d97706" stroke-width=".5" opacity=".12"/>' +
                '<line x1="60" y1="6" x2="60" y2="114" stroke="#d97706" stroke-width=".5" opacity=".12"/>' +
                '<line x1="6" y1="35" x2="114" y2="85" stroke="#d97706" stroke-width=".5" opacity=".08"/>' +
                '<line x1="6" y1="85" x2="114" y2="35" stroke="#d97706" stroke-width=".5" opacity=".08"/>' +
                '<circle cx="60" cy="60" r="46" stroke="#d97706" stroke-width=".8" stroke-dasharray="5 3" fill="none" opacity=".18"><animateTransform attributeName="transform" type="rotate" from="0 60 60" to="360 60 60" dur="18s" repeatCount="indefinite"/></circle>' +
                '<circle cx="60" cy="60" r="30" stroke="#d97706" stroke-width=".6" stroke-dasharray="3 5" fill="none" opacity=".12"><animateTransform attributeName="transform" type="rotate" from="360 60 60" to="0 60 60" dur="12s" repeatCount="indefinite"/></circle>' +
                '<polyline points="22,90 22,42 52,42 52,62 85,62 85,34" stroke="#d97706" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="160" stroke-dashoffset="160"><animate attributeName="stroke-dashoffset" from="160" to="-160" dur="3.5s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1"/></polyline>' +
                '<circle cx="85" cy="31" r="7" fill="#d97706"><animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/><animate attributeName="r" values="5;8;5" dur="2s" repeatCount="indefinite"/></circle>' +
                '<circle cx="85" cy="31" r="3" fill="#060606"/>' +
                '<circle cx="22" cy="93" r="4.5" fill="#d97706" opacity=".35"><animate attributeName="opacity" values=".2;.5;.2" dur="3s" repeatCount="indefinite"/></circle>' +
                '</g>' +
                '<path d="' + PENT + '" stroke="#d97706" stroke-width="1.8" fill="none" opacity=".25"/>' +
                '<path d="M60 108L66 114H54Z" fill="#d97706" opacity=".5"/></svg>',

            a: '<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                '<defs><clipPath id="bp-pent-a"><path d="' + PENT + '"/></clipPath></defs>' +
                '<path d="' + PENT + '" stroke="#082530" stroke-width="1.2" fill="none"/>' +
                '<g clip-path="url(#bp-pent-a)">' +
                '<circle cx="60" cy="60" r="42" stroke="#06b6d4" stroke-width=".7" fill="none" opacity=".1"><animate attributeName="r" values="38;44;38" dur="4s" repeatCount="indefinite"/><animate attributeName="opacity" values=".08;.18;.08" dur="4s" repeatCount="indefinite"/></circle>' +
                '<circle cx="60" cy="60" r="28" stroke="#06b6d4" stroke-width=".7" fill="none" opacity=".18"><animate attributeName="r" values="24;30;24" dur="3s" repeatCount="indefinite"/><animate attributeName="opacity" values=".12;.28;.12" dur="3s" repeatCount="indefinite"/></circle>' +
                '<circle cx="60" cy="60" r="14" stroke="#06b6d4" stroke-width=".9" fill="none" opacity=".28"><animate attributeName="r" values="12;16;12" dur="2s" repeatCount="indefinite"/></circle>' +
                '<line x1="60" y1="6" x2="60" y2="114" stroke="#06b6d4" stroke-width=".5" opacity=".15"/>' +
                '<line x1="6" y1="60" x2="114" y2="60" stroke="#06b6d4" stroke-width=".5" opacity=".15"/>' +
                '<line x1="60" y1="60" x2="60" y2="18" stroke="#06b6d4" stroke-width="2" opacity=".7" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" from="0 60 60" to="360 60 60" dur="3s" repeatCount="indefinite"/></line>' +
                '<polygon points="60,32 75,46 71,68 49,68 45,46" stroke="#06b6d4" stroke-width="1.8" fill="#06b6d4" fill-opacity=".1"/>' +
                '<circle cx="60" cy="32" r="3.5" fill="#06b6d4" opacity=".9"/>' +
                '<circle cx="60" cy="60" r="5" fill="#06b6d4"><animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values=".7;1;.7" dur="2s" repeatCount="indefinite"/></circle>' +
                '</g>' +
                '<path d="' + PENT + '" stroke="#06b6d4" stroke-width="1.8" fill="none" opacity=".22"/>' +
                '<path d="M60 108L66 114H54Z" fill="#06b6d4" opacity=".45"/></svg>',

            p: '<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                '<defs><clipPath id="bp-pent-p"><path d="' + PENT + '"/></clipPath></defs>' +
                '<path d="' + PENT + '" stroke="#400a0a" stroke-width="1.2" fill="none"/>' +
                '<g clip-path="url(#bp-pent-p)">' +
                '<path d="M60 18L98 48L84 102H36L22 48Z" stroke="#ef4444" stroke-width="2" fill="#ef4444" fill-opacity=".06"/>' +
                '<line x1="60" y1="18" x2="60" y2="102" stroke="#ef4444" stroke-width="1" opacity=".2"/>' +
                '<line x1="34" y1="52" x2="86" y2="52" stroke="#ef4444" stroke-width="2" opacity=".8"><animate attributeName="x1" values="60;34;60" dur="2s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1"/><animate attributeName="x2" values="60;86;60" dur="2s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1"/></line>' +
                '<line x1="38" y1="64" x2="82" y2="64" stroke="#ef4444" stroke-width="1.4" opacity=".55"><animate attributeName="x1" values="60;38;60" dur="2.4s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1"/><animate attributeName="x2" values="60;82;60" dur="2.4s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1"/></line>' +
                '<line x1="42" y1="75" x2="78" y2="75" stroke="#ef4444" stroke-width="1" opacity=".32"><animate attributeName="x1" values="60;42;60" dur="2.8s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1"/><animate attributeName="x2" values="60;78;60" dur="2.8s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1"/></line>' +
                '<circle cx="60" cy="36" r="14" stroke="#ef4444" stroke-width=".8" fill="none" opacity=".2"><animate attributeName="r" values="10;18;10" dur="3s" repeatCount="indefinite"/><animate attributeName="opacity" values=".1;.3;.1" dur="3s" repeatCount="indefinite"/></circle>' +
                '<circle cx="60" cy="36" r="9" fill="#ef4444"><animate attributeName="opacity" values=".5;1;.5" dur="3s" repeatCount="indefinite"/><animate attributeName="r" values="8;10;8" dur="3s" repeatCount="indefinite"/></circle>' +
                '<circle cx="60" cy="36" r="3.5" fill="#060606"/>' +
                '</g>' +
                '<path d="' + PENT + '" stroke="#ef4444" stroke-width="1.8" fill="none" opacity=".3"/>' +
                '<path d="M60 108L66 114H54Z" fill="#ef4444" opacity=".6"/></svg>',

            l: '<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                '<defs><clipPath id="bp-pent-l"><path d="' + PENT + '"/></clipPath></defs>' +
                '<path d="' + PENT + '" stroke="#042010" stroke-width="1.2" fill="none"/>' +
                '<g clip-path="url(#bp-pent-l)"><g><animateTransform attributeName="transform" type="translate" values="0,0;0,6;0,0" dur="3s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1"/>' +
                '<rect x="30" y="58" width="60" height="46" rx="3" stroke="#22c55e" stroke-width="2" fill="#22c55e" fill-opacity=".07"/>' +
                '<polyline points="26,58 60,42 94,58" stroke="#22c55e" stroke-width="2.2" fill="none" stroke-linejoin="round"/>' +
                '<line x1="60" y1="42" x2="60" y2="58" stroke="#22c55e" stroke-width="1.2" opacity=".35"/>' +
                '<circle cx="44" cy="74" r="5.5" fill="#22c55e" opacity=".65"/><circle cx="76" cy="74" r="5.5" fill="#22c55e" opacity=".45"/>' +
                '<circle cx="44" cy="88" r="4" fill="#22c55e" opacity=".32"/><circle cx="76" cy="88" r="4" fill="#22c55e" opacity=".28"/>' +
                '</g>' +
                '<line x1="60" y1="10" x2="60" y2="36" stroke="#22c55e" stroke-width="1.5" stroke-linecap="round" opacity=".5"><animate attributeName="y1" values="10;20;10" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values=".2;.7;.2" dur="2s" repeatCount="indefinite"/></line>' +
                '<polyline points="53,32 60,40 67,32" stroke="#22c55e" stroke-width="1.8" fill="none" stroke-linejoin="round" opacity=".5"><animate attributeName="opacity" values=".2;.8;.2" dur="2s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0,0;0,6;0,0" dur="2s" repeatCount="indefinite"/></polyline>' +
                '</g>' +
                '<path d="' + PENT + '" stroke="#22c55e" stroke-width="1.8" fill="none" opacity=".22"/>' +
                '<path d="M60 108L66 114H54Z" fill="#22c55e" opacity=".45"/></svg>',

            e: '<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                '<defs><clipPath id="bp-pent-e"><path d="' + PENT + '"/></clipPath></defs>' +
                '<path d="' + PENT + '" stroke="#250d50" stroke-width="1.2" fill="none"/>' +
                '<g clip-path="url(#bp-pent-e)">' +
                '<path d="M22,46 C22,46 60,52 60,94 C60,52 98,46 98,46 L98,96 C98,96 60,90 60,96 C60,90 22,96 22,96 Z" stroke="#a855f7" stroke-width="2" fill="#a855f7" fill-opacity=".07" stroke-linejoin="round"/>' +
                '<line x1="60" y1="52" x2="60" y2="96" stroke="#a855f7" stroke-width="1.5" opacity=".35"/>' +
                '<line x1="30" y1="62" x2="30" y2="62" stroke="#a855f7" stroke-width="1.4" opacity=".6" stroke-linecap="round"><animate attributeName="x2" values="30;56;30" dur="2.5s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1"/></line>' +
                '<line x1="64" y1="62" x2="64" y2="62" stroke="#a855f7" stroke-width="1.4" opacity=".6" stroke-linecap="round"><animate attributeName="x2" values="64;90;64" dur="2.5s" begin=".2s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1"/></line>' +
                '<polygon points="60,14 63,22 71,22 65,27 67,35 60,30 53,35 55,27 49,22 57,22" fill="#a855f7" opacity=".9"><animate attributeName="opacity" values=".6;1;.6" dur="2.5s" repeatCount="indefinite"/></polygon>' +
                '</g>' +
                '<path d="' + PENT + '" stroke="#a855f7" stroke-width="1.8" fill="none" opacity=".25"/>' +
                '<path d="M60 108L66 114H54Z" fill="#a855f7" opacity=".5"/></svg>'
        };

        var DEPTS = [
            { c: 'bp-m', stamp: 'M-01', svg: SVG.m, letter: 'M', name: 'Mapping',    role: 'Maze Cartography',     tag: 'Sơ đồ mê cung<br>& biến động hàng đêm',       href: '/wiki/B%E1%BA%A3n_%C4%90%E1%BB%93' },
            { c: 'bp-a', stamp: 'A-02', svg: SVG.a, letter: 'A', name: 'Assessment', role: 'Capability Profiling', tag: 'Hồ sơ năng lực<br>Runner, Builder & hơn thế',  href: '/wiki/Nh%C3%A2n_S%E1%BB%B1' },
            { c: 'bp-p', stamp: 'P-03', svg: SVG.p, letter: 'P', name: 'Protocol',   role: 'Survival Codex',       tag: 'Quy tắc sinh tồn<br>nghiêm ngặt của The Glade', href: '/wiki/Th%E1%BB%A7_T%E1%BB%A5c' },
            { c: 'bp-l', stamp: 'L-04', svg: SVG.l, letter: 'L', name: 'Logistics',  role: 'Supply Operations',    tag: 'Tài nguyên, thực phẩm<br>& hộp tiếp tế The Box', href: '/wiki/Kho_L%C6%B0u_Tr%E1%BB%AF' },
            { c: 'bp-e', stamp: 'E-05', svg: SVG.e, letter: 'E', name: 'Education',  role: 'Knowledge Archive',    tag: 'Wiki sinh tồn<br>kẻ thù & môi trường Glade',   href: '/wiki/Tr%E1%BB%A3_gi%C3%BAp' }
        ];

        var cards = DEPTS.map(function (d) {
            return '<a class="bp-card ' + d.c + '" href="' + d.href + '">' +
                '<div class="bp-scan"></div>' +
                '<div class="bp-stamp">' + d.stamp + '</div>' +
                '<div class="bp-logo-wrap">' + d.svg + '</div>' +
                '<div class="bp-letter">' + d.letter + '</div>' +
                '<div class="bp-name">' + d.name + '</div>' +
                '<div class="bp-role">' + d.role + '</div>' +
                '<div class="bp-divider"></div>' +
                '<div class="bp-tagline">' + d.tag + '</div>' +
            '</a>';
        }).join('');

        var legend = DEPTS.map(function (d) {
            return '<span>' + d.letter + ' — ' + d.name + '</span>';
        }).join('');

        target.innerHTML =
            '<div id="bp-root">' +
            '<div class="bp-header">' +
                '<div class="bp-header-logo">' + logo(60) + '</div>' +
                '<div class="bp-title">M.A.P.L.E — Hệ Thống Nhận Diện Bộ Phận</div>' +
                '<div class="bp-sub">Department Identity System</div>' +
                '<div class="bp-mid">// 5 bộ phận · M · A · P · L · E</div>' +
            '</div>' +
            '<div class="bp-grid">' + cards + '</div>' +
            '<div class="bp-foot"><div class="bp-legend">' + legend + '</div>' +
                '<a href="/wiki/Trang_Ch%C3%ADnh">← Trang Chủ</a></div>' +
            '</div>';
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
