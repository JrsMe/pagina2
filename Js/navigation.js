(() => {
    "use strict";

    let started = false;

    function init() {
        if (started) return;
        started = true;

        const audio = document.getElementById("love-audio");
        const button = document.getElementById("music-toggle");
        const status = document.getElementById("music-status");
        const home = document.querySelector(".home-screen");

        let container = document.getElementById("spa-page-container");

        if (!container) {
            container = document.createElement("div");
            container.id = "spa-page-container";

            if (home && home.parentNode) {
                home.parentNode.insertBefore(container, home);
                container.appendChild(home);
            } else {
                document.body.appendChild(container);
            }
        } else if (home && home.parentNode !== container) {
            container.appendChild(home);
        }

        if (audio) {
            audio.loop = true;
            audio.volume = 0.35;
        }

        function updatePlayer() {
            if (!audio || !button || !status) return;

            if (audio.paused) {
                button.textContent = "▶";
                button.setAttribute("aria-label", "Reproducir nuestra canción");
                status.textContent = "Pausada";
            } else {
                button.textContent = "Ⅱ";
                button.setAttribute("aria-label", "Pausar nuestra canción");
                status.textContent = "Reproduciendo";
            }
        }

        if (button && audio) {
            button.addEventListener("click", async (event) => {
                event.preventDefault();
                event.stopPropagation();

                try {
                    if (audio.paused) {
                        await audio.play();
                    } else {
                        audio.pause();
                    }
                } catch (error) {
                    console.error("No se pudo reproducir nuestra canción:", error);
                    if (status) status.textContent = "No se pudo reproducir";
                }

                updatePlayer();
            });
        }

        if (audio) {
            audio.addEventListener("play", updatePlayer);
            audio.addEventListener("pause", updatePlayer);
            audio.addEventListener("ended", updatePlayer);
            audio.addEventListener("error", () => {
                console.error("No se pudo cargar audio/nuestra-cancion.mp3", audio.error);
                if (status) status.textContent = "Audio no disponible";
            });
        }

        updatePlayer();

        function isModifiedClick(event) {
            return event.ctrlKey ||
                   event.shiftKey ||
                   event.altKey ||
                   event.metaKey ||
                   event.button !== 0;
        }

        function isExternal(href) {
            return !href ||
                   /^(https?:|mailto:|tel:|javascript:)/i.test(href);
        }

        function isHash(href) {
            return href === "#" || href.startsWith("#");
        }

        function toUrl(href) {
            try {
                return new URL(href, window.location.href);
            } catch {
                return null;
            }
        }

        function isPage(url) {
            const path = url.pathname.toLowerCase();
            return path.endsWith(".html") ||
                   path === "/" ||
                   path.endsWith("/");
        }

        function isHome(url) {
            const path = url.pathname;
            return path === "/" || path.endsWith("/index.html");
        }

        function removePageCss() {
            document.querySelectorAll("link[data-spa-style]")
                .forEach(link => link.remove());
        }

        function loadPageCss(doc, pageUrl) {
            removePageCss();

            const globalCss = new URL(
                "css/style.css",
                window.location.href
            ).href;

            doc.querySelectorAll('link[rel="stylesheet"]').forEach(style => {
                const href = style.getAttribute("href");
                if (!href) return;

                try {
                    const absolute = new URL(href, pageUrl).href;

                    if (absolute === globalCss) return;

                    const link = document.createElement("link");
                    link.rel = "stylesheet";
                    link.href = absolute;
                    link.dataset.spaStyle = "true";
                    document.head.appendChild(link);
                } catch (error) {
                    console.error("No se pudo cargar CSS:", href, error);
                }
            });
        }

        function fixPaths(root, baseUrl) {
            root.querySelectorAll("[src], [href], [poster], [data-image]")
                .forEach(element => {
                    ["src", "href", "poster", "data-image"].forEach(attribute => {
                        if (!element.hasAttribute(attribute)) return;

                        const value = element.getAttribute(attribute);
                        if (!value ||
                            value.startsWith("#") ||
                            /^(data:|blob:|https?:|mailto:|tel:|javascript:)/i.test(value)) {
                            return;
                        }

                        try {
                            element.setAttribute(
                                attribute,
                                new URL(value, baseUrl).href
                            );
                        } catch (error) {
                            console.warn("Ruta no válida:", value);
                        }
                    });
                });
        }

        function removePageScripts() {
            document.querySelectorAll("script[data-spa-page-script]")
                .forEach(script => script.remove());
        }

        function runPageScripts(doc) {
            removePageScripts();

            doc.querySelectorAll("script").forEach(original => {
                if (original.src) return;

                const code = original.textContent.trim();
                if (!code) return;

                const script = document.createElement("script");
                script.dataset.spaPageScript = "true";

                script.textContent = code.replace(
                    /DOMContentLoaded/g,
                    "spa-page-ready"
                );

                document.body.appendChild(script);
            });

            document.dispatchEvent(
                new Event("spa-page-ready")
            );
        }

        function showHome(updateHistory) {
            removePageCss();
            removePageScripts();

            container.innerHTML = "";

            if (home) {
                container.appendChild(home);
                home.style.display = "";
                home.classList.add("home-visible");
            }

            document.body.className = "";
            document.title = "Para Brizly ♡";

            if (updateHistory) {
                const target = new URL(
                    "index.html#menu",
                    window.location.href
                );

                history.pushState({}, "", target.href);
            }

            window.scrollTo(0, 0);
            updatePlayer();
        }

        async function loadPage(url, updateHistory = true) {
            if (isHome(url)) {
                showHome(updateHistory);
                return;
            }

            try {
                const response = await fetch(
                    url.href,
                    {
                        method: "GET",
                        cache: "no-store",
                        credentials: "same-origin"
                    }
                );

                if (!response.ok) {
                    throw new Error("HTTP " + response.status);
                }

                const html = await response.text();
                const doc = new DOMParser().parseFromString(
                    html,
                    "text/html"
                );

                loadPageCss(doc, url.href);

                const fragment = document.createDocumentFragment();

                Array.from(doc.body.children).forEach(child => {
                    if (
                        child.matches(
                            "audio, .love-music-player, script, .welcome-screen"
                        )
                    ) {
                        return;
                    }

                    const clone = child.cloneNode(true);
                    fixPaths(clone, url.href);
                    fragment.appendChild(clone);
                });

                container.innerHTML = "";
                container.appendChild(fragment);

                if (home) {
                    home.style.display = "none";
                }

                document.body.className = doc.body.className || "";

                if (doc.title) {
                    document.title = doc.title;
                }

                runPageScripts(doc);

                if (updateHistory) {
                    history.pushState({}, "", url.href);
                }

                window.scrollTo(0, 0);
                updatePlayer();

            } catch (error) {
                console.error("Error cargando página:", error);

                container.innerHTML = `
                    <section style="
                        min-height:60vh;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        padding:40px 20px;
                        text-align:center;
                    ">
                        <div>
                            <p style="
                                font-family:Georgia,serif;
                                font-size:1.5rem;
                                color:#f5dce5;
                                margin:0 0 12px;
                            ">
                                No pude abrir esta página.
                            </p>

                            <p style="
                                color:rgba(255,255,255,.55);
                                margin:0 0 24px;
                            ">
                                Comprueba que el archivo exista dentro de pages.
                            </p>

                            <button
                                type="button"
                                id="spa-error-home"
                                style="
                                    padding:11px 20px;
                                    border-radius:30px;
                                    border:1px solid rgba(200,120,148,.35);
                                    background:rgba(128,62,85,.16);
                                    color:#fff;
                                    cursor:pointer;
                                "
                            >
                                Volver al inicio
                            </button>
                        </div>
                    </section>
                `;

                const errorButton =
                    document.getElementById("spa-error-home");

                if (errorButton) {
                    errorButton.addEventListener(
                        "click",
                        () => showHome(true)
                    );
                }
            }
        }

        document.addEventListener(
            "click",
            event => {
                const link =
                    event.target.closest?.("a[href]");

                if (!link || isModifiedClick(event)) {
                    return;
                }

                const href = link.getAttribute("href");

                if (
                    !href ||
                    isExternal(href) ||
                    isHash(href)
                ) {
                    return;
                }

                const url = toUrl(href);

                if (!url || !isPage(url)) {
                    return;
                }

                event.preventDefault();
                event.stopImmediatePropagation();

                loadPage(url, true);
            },
            true
        );

        window.addEventListener("popstate", () => {
            loadPage(
                new URL(window.location.href),
                false
            );
        });

        console.log("Sistema SPA inicializado.");
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            init,
            { once: true }
        );
    } else {
        init();
    }
})();