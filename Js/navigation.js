document.addEventListener("DOMContentLoaded", () => {

    /*
     * ============================================================
     * NAVEGACIÓN SPA
     * Mantiene index.html vivo para que el audio NO se reinicie.
     * ============================================================
     */

    let pageContainer =
        document.getElementById("spa-page-container");

    const homeScreen =
        document.querySelector(".home-screen");

    const welcomeScreen =
        document.querySelector(".welcome-screen");

    const permanentAudio =
        document.getElementById("love-audio");

    const permanentPlayer =
        document.querySelector(".love-music-player");


    /*
     * ------------------------------------------------------------
     * Crear automáticamente el contenedor SPA
     * ------------------------------------------------------------
     */

    if (!pageContainer) {

        pageContainer =
            document.createElement("div");

        pageContainer.id =
            "spa-page-container";

        if (homeScreen) {

            homeScreen.parentNode.insertBefore(
                pageContainer,
                homeScreen
            );

            pageContainer.appendChild(
                homeScreen
            );

        } else {

            document.body.appendChild(
                pageContainer
            );

        }

    } else if (
        homeScreen &&
        homeScreen.parentNode !== pageContainer
    ) {

        pageContainer.appendChild(
            homeScreen
        );

    }


    /*
     * ------------------------------------------------------------
     * Estado
     * ------------------------------------------------------------
     */

    let currentPage =
        window.location.pathname +
        window.location.search;


    /*
     * ------------------------------------------------------------
     * Utilidades
     * ------------------------------------------------------------
     */

    function isExternalLink(href) {

        if (!href) {
            return true;
        }

        return (
            href.startsWith("http://") ||
            href.startsWith("https://") ||
            href.startsWith("mailto:") ||
            href.startsWith("tel:") ||
            href.startsWith("javascript:")
        );

    }


    function isHashLink(href) {

        return (
            href === "#" ||
            href.startsWith("#")
        );

    }


    function getAbsoluteUrl(href) {

        return new URL(
            href,
            window.location.href
        );

    }


    function isPageLink(url) {

        const pathname =
            url.pathname.toLowerCase();

        return (
            pathname.endsWith(".html") ||
            pathname === "/" ||
            pathname.endsWith("/")
        );

    }


    /*
     * ------------------------------------------------------------
     * Convertir rutas de imágenes, enlaces, etc.
     * ------------------------------------------------------------
     */

    function fixPaths(element, baseUrl) {

        const attributes = [
            "src",
            "href",
            "poster",
            "data-image"
        ];


        attributes.forEach(attribute => {

            const elements =
                element.querySelectorAll(
                    `[${attribute}]`
                );


            elements.forEach(item => {

                const value =
                    item.getAttribute(
                        attribute
                    );


                if (
                    !value ||
                    value.startsWith("#") ||
                    value.startsWith("data:") ||
                    value.startsWith("blob:") ||
                    value.startsWith("http://") ||
                    value.startsWith("https://") ||
                    value.startsWith("mailto:") ||
                    value.startsWith("tel:") ||
                    value.startsWith("javascript:")
                ) {

                    return;

                }


                try {

                    item.setAttribute(
                        attribute,
                        new URL(
                            value,
                            baseUrl
                        ).href
                    );

                } catch (error) {

                    console.warn(
                        "No se pudo corregir la ruta:",
                        value
                    );

                }

            });

        });

    }


    /*
     * ------------------------------------------------------------
     * Cargar CSS de cada página
     * ------------------------------------------------------------
     */

    function loadPageStyles(doc, pageUrl) {

        document
            .querySelectorAll(
                "link[data-spa-style]"
            )
            .forEach(link => {

                link.remove();

            });


        const styles =
            doc.querySelectorAll(
                'link[rel="stylesheet"]'
            );


        styles.forEach(style => {

            const href =
                style.getAttribute(
                    "href"
                );


            if (!href) {
                return;
            }


            try {

                const absoluteHref =
                    new URL(
                        href,
                        pageUrl
                    ).href;


                /*
                 * No volver a cargar style.css.
                 * Ya está cargado permanentemente.
                 */

                if (
                    absoluteHref ===
                    new URL(
                        "css/style.css",
                        window.location.href
                    ).href
                ) {

                    return;

                }


                const link =
                    document.createElement(
                        "link"
                    );

                link.rel =
                    "stylesheet";

                link.href =
                    absoluteHref;

                link.dataset.spaStyle =
                    "true";

                document.head.appendChild(
                    link
                );

            } catch (error) {

                console.warn(
                    "No se pudo cargar CSS:",
                    href
                );

            }

        });

    }


    /*
     * ------------------------------------------------------------
     * Ejecutar scripts internos de la página
     * ------------------------------------------------------------
     */

    function removePageScripts() {

        document
            .querySelectorAll(
                "script[data-spa-page-script]"
            )
            .forEach(script => {

                script.remove();

            });

    }


    function runPageScripts(doc) {

        removePageScripts();


        const scripts =
            doc.querySelectorAll(
                "script"
            );


        scripts.forEach(originalScript => {

            /*
             * Nunca ejecutar scripts externos
             * de las páginas.
             *
             * El sistema global ya está cargado.
             */

            if (
                originalScript.src
            ) {

                return;

            }


            const code =
                originalScript.textContent;


            if (!code.trim()) {
                return;
            }


            /*
             * Las páginas fueron diseñadas originalmente
             * para DOMContentLoaded.
             *
             * En navegación SPA necesitamos sustituirlo
             * por nuestro evento personalizado.
             */

            const modifiedCode =
                code.replace(
                    /DOMContentLoaded/g,
                    "spa:page-ready"
                );


            const script =
                document.createElement(
                    "script"
                );


            script.dataset.spaPageScript =
                "true";


            script.textContent =
                modifiedCode;


            document.body.appendChild(
                script
            );

        });


        /*
         * Avisar a cualquier script de la página
         * que ya puede inicializarse.
         */

        document.dispatchEvent(
            new Event(
                "spa:page-ready"
            )
        );

    }


    /*
     * ------------------------------------------------------------
     * Mostrar inicio
     * ------------------------------------------------------------
     */

    function showHome(pushState) {

        /*
         * Limpiar la página actual.
         */

        pageContainer.innerHTML = "";


        if (homeScreen) {

            pageContainer.appendChild(
                homeScreen
            );

            homeScreen.style.display =
                "";

            homeScreen.classList.add(
                "home-visible"
            );

        }


        /*
         * Quitar CSS exclusivo de páginas.
         */

        document
            .querySelectorAll(
                "link[data-spa-style]"
            )
            .forEach(link => {

                link.remove();

            });


        removePageScripts();


        document.body.className =
            "";


        if (pushState) {

            history.pushState(
                {},
                "",
                "../index.html#menu"
            );

        }


        window.scrollTo({
            top: 0,
            behavior: "instant"
        });


        currentPage =
            window.location.pathname;

    }


    /*
     * ------------------------------------------------------------
     * Cargar una página
     * ------------------------------------------------------------
     */

    async function loadPage(
        path,
        pushState = true
    ) {

        /*
         * HOME
         */

        if (
            path === "/" ||
            path === "index.html" ||
            path === "/index.html"
        ) {

            showHome(
                pushState
            );

            return;

        }


        /*
         * Evitar tocar el audio.
         *
         * Estas referencias existen solamente para
         * dejar explícito que son elementos permanentes.
         */

        void permanentAudio;
        void permanentPlayer;


        try {

            const pageUrl =
                new URL(
                    path,
                    window.location.href
                );


            const response =
                await fetch(
                    pageUrl.href,
                    {
                        cache: "no-cache"
                    }
                );


            if (!response.ok) {

                throw new Error(
                    `HTTP ${response.status}`
                );

            }


            const html =
                await response.text();


            const parser =
                new DOMParser();


            const doc =
                parser.parseFromString(
                    html,
                    "text/html"
                );


            /*
             * ----------------------------------------------------
             * Preparar CSS
             * ----------------------------------------------------
             */

            loadPageStyles(
                doc,
                pageUrl.href
            );


            /*
             * ----------------------------------------------------
             * Preparar contenido
             * ----------------------------------------------------
             */

            const fragment =
                document.createDocumentFragment();


            const children =
                Array.from(
                    doc.body.children
                );


            children.forEach(child => {

                /*
                 * NO copiar:
                 *
                 * - reproductor
                 * - audio
                 * - scripts
                 * - welcome screen
                 */

                if (
                    child.matches(
                        ".love-music-player"
                    )
                ) {

                    return;

                }


                if (
                    child.matches(
                        "audio"
                    )
                ) {

                    return;

                }


                if (
                    child.matches(
                        "script"
                    )
                ) {

                    return;

                }


                if (
                    child.matches(
                        ".welcome-screen"
                    )
                ) {

                    return;

                }


                const clone =
                    child.cloneNode(
                        true
                    );


                fixPaths(
                    clone,
                    pageUrl.href
                );


                fragment.appendChild(
                    clone
                );

            });


            /*
             * ----------------------------------------------------
             * Reemplazar únicamente el contenido SPA
             *
             * El audio sigue fuera de aquí.
             * ----------------------------------------------------
             */

            pageContainer.innerHTML = "";

            pageContainer.appendChild(
                fragment
            );


            /*
             * El home ya no debe estar visible.
             */

            if (homeScreen) {

                homeScreen.style.display =
                    "none";

            }


            /*
             * ----------------------------------------------------
             * Actualizar body
             * ----------------------------------------------------
             */

            document.body.className =
                doc.body.className || "";


            /*
             * ----------------------------------------------------
             * Título
             * ----------------------------------------------------
             */

            if (doc.title) {

                document.title =
                    doc.title;

            }


            /*
             * ----------------------------------------------------
             * Ejecutar scripts propios de la página
             * ----------------------------------------------------
             */

            runPageScripts(
                doc
            );


            /*
             * ----------------------------------------------------
             * Historial
             * ----------------------------------------------------
             */

            if (pushState) {

                history.pushState(
                    {},
                    "",
                    pageUrl.href
                );

            }


            currentPage =
                pageUrl.pathname;


            /*
             * ----------------------------------------------------
             * Arriba de la página
             * ----------------------------------------------------
             */

            window.scrollTo({
                top: 0,
                behavior: "instant"
            });


        } catch (error) {

            console.error(
                "Error cargando página:",
                error
            );


            /*
             * IMPORTANTE:
             *
             * No hacemos window.location.href.
             *
             * Eso destruiría el audio.
             */

            pageContainer.innerHTML = `

                <section
                    style="
                        min-height:60vh;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        padding:40px 20px;
                        text-align:center;
                    "
                >

                    <div>

                        <p
                            style="
                                font-family:Georgia,serif;
                                font-size:1.5rem;
                                color:#f5dce5;
                                margin-bottom:12px;
                            "
                        >
                            No pude abrir esta página.
                        </p>

                        <p
                            style="
                                color:rgba(255,255,255,.55);
                                margin-bottom:24px;
                            "
                        >
                            Revisa que el archivo exista
                            dentro de la carpeta pages.
                        </p>

                        <button
                            type="button"
                            id="spa-error-home"
                            style="
                                padding:11px 18px;
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
                document.getElementById(
                    "spa-error-home"
                );


            if (errorButton) {

                errorButton.addEventListener(
                    "click",
                    () => {

                        showHome(
                            true
                        );

                    }
                );

            }

        }

    }


    /*
     * ------------------------------------------------------------
     * INTERCEPTAR CLICS
     *
     * Capture = true
     *
     * Esto es MUY importante porque script.js
     * también tiene un sistema de navegación.
     *
     * Nosotros interceptamos primero.
     * ------------------------------------------------------------
     */

    document.addEventListener(
        "click",
        event => {

            const link =
                event.target.closest(
                    "a"
                );


            if (!link) {
                return;
            }


            if (
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey ||
                event.metaKey ||
                event.button !== 0
            ) {

                return;

            }


            const href =
                link.getAttribute(
                    "href"
                );


            if (!href) {
                return;
            }


            /*
             * Enlaces externos.
             */

            if (
                isExternalLink(
                    href
                )
            ) {

                return;

            }


            /*
             * Anclas internas.
             */

            if (
                isHashLink(
                    href
                )
            ) {

                return;

            }


            let url;

            try {

                url =
                    getAbsoluteUrl(
                        href
                    );

            } catch (error) {

                return;

            }


            /*
             * Solo manejar páginas HTML.
             */

            if (
                !isPageLink(
                    url
                )
            ) {

                return;

            }


            /*
             * HOME
             */

            if (
                url.pathname.endsWith(
                    "/index.html"
                ) ||
                url.pathname === "/"
            ) {

                event.preventDefault();
                event.stopPropagation();

                if (
                    typeof event.stopImmediatePropagation ===
                    "function"
                ) {

                    event.stopImmediatePropagation();

                }


                showHome(
                    true
                );

                return;

            }


            /*
             * PÁGINA INTERNA
             */

            event.preventDefault();
            event.stopPropagation();

            if (
                typeof event.stopImmediatePropagation ===
                "function"
            ) {

                event.stopImmediatePropagation();

            }


            /*
             * Convertir URL absoluta a ruta.
             */

            let path =
                url.pathname;


            if (url.search) {

                path +=
                    url.search;

            }


            loadPage(
                path,
                true
            );

        },
        true
    );


    /*
     * ------------------------------------------------------------
     * BOTÓN ATRÁS / ADELANTE DEL NAVEGADOR
     * ------------------------------------------------------------
     */

    window.addEventListener(
        "popstate",
        () => {

            const path =
                window.location.pathname;


            if (
                path.endsWith(
                    "/index.html"
                ) ||
                path === "/"
            ) {

                showHome(
                    false
                );

                return;

            }


            loadPage(
                path,
                false
            );

        }
    );


    /*
     * ------------------------------------------------------------
     * Inicialización
     * ------------------------------------------------------------
     */

    /*
     * Si estamos en index.html, dejamos el inicio visible.
     */

    const initialPath =
        window.location.pathname;


    if (
        initialPath.endsWith(
            "/index.html"
        ) ||
        initialPath === "/"
    ) {

        if (homeScreen) {

            homeScreen.style.display =
                "";

            homeScreen.classList.add(
                "home-visible"
            );

        }

    }


    /*
     * ------------------------------------------------------------
     * Verificación del audio
     * ------------------------------------------------------------
     */

    if (!permanentAudio) {

        console.warn(
            "No se encontró #love-audio. " +
            "La navegación SPA funciona, " +
            "pero el reproductor no tiene audio permanente."
        );

    }

});