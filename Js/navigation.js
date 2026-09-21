(() => {
    "use strict";

    /*
     * =========================================================
     * NAVEGACIÓN POR VENTANAS
     * =========================================================
     *
     * El index.html permanece siempre cargado.
     *
     * Las páginas internas se muestran dentro de:
     *
     * #page-modal-content
     *
     * El audio NO se toca.
     * =========================================================
     */

    let modal = null;
    let modalContent = null;
    let modalTitle = null;
    let modalSection = null;
    let closeButton = null;
    let backdrop = null;

    let currentPageUrl = null;
    let isLoading = false;

    let loadedPageCss = [];


    /*
     * =========================================================
     * OBTENER ELEMENTOS
     * =========================================================
     */

    function getElements() {

        modal = document.getElementById("page-modal");

        modalContent = document.getElementById(
            "page-modal-content"
        );

        modalTitle = document.getElementById(
            "page-modal-title"
        );

        modalSection = document.getElementById(
            "page-modal-section"
        );

        closeButton = document.getElementById(
            "page-modal-close"
        );

        backdrop = document.querySelector(
            ".page-modal-backdrop"
        );
    }


    /*
     * =========================================================
     * NOMBRE DE LA PÁGINA
     * =========================================================
     */

    function getPageName(url) {

        const pathname = new URL(
            url,
            window.location.href
        ).pathname;

        const file = pathname
            .split("/")
            .pop()
            .replace(/\.html$/i, "");

        const names = {

            historia:
                "Nuestra historia",

            recuerdos:
                "Nuestros recuerdos",

            musica:
                "Nuestra música",

            razones:
                "Las razones",

            carta:
                "Una carta para ti",

            mensajes:
                "Nuestros mensajes",

            futuro:
                "Nuestro futuro",

            "mensaje-secreto":
                "Mensaje secreto"
        };

        return names[file] || "Nuestro mundo";
    }


    /*
     * =========================================================
     * TÍTULO DE LA PÁGINA
     * =========================================================
     */

    function getPageTitle(url) {

        const pathname = new URL(
            url,
            window.location.href
        ).pathname;

        const file = pathname
            .split("/")
            .pop()
            .replace(/\.html$/i, "");

        const titles = {

            historia:
                "Historia de nosotros",

            recuerdos:
                "Nuestros recuerdos",

            musica:
                "Canciones que me recuerdan a ti",

            razones:
                "Razones por las que te amo",

            carta:
                "Para mi niña",

            mensajes:
                "Cosas que quiero decirte",

            futuro:
                "Lo que quiero vivir contigo",

            "mensaje-secreto":
                "Solo para ti ♡"
        };

        return titles[file] || getPageName(url);
    }


    /*
     * =========================================================
     * URL ABSOLUTA
     * =========================================================
     */

    function getAbsoluteUrl(url) {

        return new URL(
            url,
            window.location.href
        ).href;
    }


    /*
     * =========================================================
     * CARGAR HTML
     * =========================================================
     */

    async function fetchPage(url) {

        const response = await fetch(
            getAbsoluteUrl(url),
            {
                cache: "no-cache"
            }
        );

        if (!response.ok) {

            throw new Error(
                `No se pudo cargar ${url} (${response.status})`
            );
        }

        return response.text();
    }


    /*
     * =========================================================
     * CORREGIR RUTAS RELATIVAS
     * =========================================================
     *
     * Las páginas están dentro de /pages/.
     *
     * Por ejemplo:
     *
     * ../images/recuerdos/recuerdo-1.jpeg
     *
     * seguirá funcionando correctamente.
     * =========================================================
     */

    function fixRelativePaths(
        container,
        pageUrl
    ) {

        const elements = container.querySelectorAll(
            "[src], [href], [poster]"
        );

        elements.forEach((element) => {

            /*
             * SRC
             */

            if (element.hasAttribute("src")) {

                const src = element.getAttribute("src");

                if (
                    src &&
                    !src.startsWith("#") &&
                    !src.startsWith("data:") &&
                    !src.startsWith("blob:") &&
                    !src.startsWith("http://") &&
                    !src.startsWith("https://") &&
                    !src.startsWith("//")
                ) {

                    try {

                        element.setAttribute(
                            "src",
                            new URL(src, pageUrl).href
                        );

                    } catch (error) {

                        console.warn(
                            "No se pudo corregir src:",
                            src
                        );
                    }
                }
            }


            /*
             * HREF
             */

            if (element.hasAttribute("href")) {

                const href = element.getAttribute("href");

                if (
                    href &&
                    !href.startsWith("#") &&
                    !href.startsWith("mailto:") &&
                    !href.startsWith("tel:") &&
                    !href.startsWith("javascript:") &&
                    !href.startsWith("http://") &&
                    !href.startsWith("https://") &&
                    !href.startsWith("//")
                ) {

                    try {

                        element.setAttribute(
                            "href",
                            new URL(href, pageUrl).href
                        );

                    } catch (error) {

                        console.warn(
                            "No se pudo corregir href:",
                            href
                        );
                    }
                }
            }


            /*
             * POSTER
             */

            if (element.hasAttribute("poster")) {

                const poster = element.getAttribute("poster");

                if (
                    poster &&
                    !poster.startsWith("data:") &&
                    !poster.startsWith("http://") &&
                    !poster.startsWith("https://") &&
                    !poster.startsWith("//")
                ) {

                    try {

                        element.setAttribute(
                            "poster",
                            new URL(
                                poster,
                                pageUrl
                            ).href
                        );

                    } catch (error) {

                        console.warn(
                            "No se pudo corregir poster:",
                            poster
                        );
                    }
                }
            }

        });
    }


    /*
     * =========================================================
     * CSS DE LA PÁGINA
     * =========================================================
     */

    function loadPageCss(
        doc,
        pageUrl
    ) {

        /*
         * Eliminar CSS de una página anterior.
         */

        loadedPageCss.forEach((link) => {

            if (
                link &&
                link.parentNode
            ) {

                link.remove();
            }
        });

        loadedPageCss = [];


        /*
         * Buscar los CSS de la página.
         */

        doc
            .querySelectorAll('link[rel="stylesheet"]')
            .forEach((originalLink) => {

                const href = originalLink.getAttribute("href");

                if (!href) {
                    return;
                }


                const absolute = new URL(
                    href,
                    pageUrl
                );


                const fileName = absolute.pathname
                    .split("/")
                    .pop()
                    .toLowerCase();


                /*
                 * style.css ya pertenece al index.
                 */

                if (fileName === "style.css") {
                    return;
                }


                /*
                 * navigation.css ya pertenece al index.
                 */

                if (fileName === "navigation.css") {
                    return;
                }


                /*
                 * Crear nuevo link.
                 */

                const link = document.createElement("link");

                link.rel = "stylesheet";

                link.href = absolute.href;

                link.dataset.modalPageCss = "true";

                document.head.appendChild(link);

                loadedPageCss.push(link);
            });
    }


    /*
     * =========================================================
     * ESPERAR CSS
     * =========================================================
     */

    function waitForCss() {

        if (loadedPageCss.length === 0) {
            return Promise.resolve();
        }

        return Promise.race([

            Promise.all(
                loadedPageCss.map((link) => {

                    return new Promise((resolve) => {

                        if (link.sheet) {

                            resolve();
                            return;
                        }

                        link.addEventListener(
                            "load",
                            resolve,
                            {
                                once: true
                            }
                        );

                        link.addEventListener(
                            "error",
                            resolve,
                            {
                                once: true
                            }
                        );

                    });

                })
            ),

            new Promise((resolve) => {

                setTimeout(
                    resolve,
                    1500
                );

            })

        ]);
    }


    /*
     * =========================================================
     * ESPERAR RENDERIZADO
     * =========================================================
     */

    function nextFrame() {

        return new Promise((resolve) => {

            requestAnimationFrame(() => {

                requestAnimationFrame(() => {

                    resolve();

                });

            });

        });
    }


    /*
     * =========================================================
     * EJECUTAR SCRIPTS DE LA PÁGINA
     * =========================================================
     */

    async function runPageScripts(container) {

        const scripts = Array.from(
            container.querySelectorAll("script")
        );


        for (const oldScript of scripts) {

            /*
             * No volver a ejecutar navigation.js.
             */

            if (oldScript.src) {

                const src = oldScript.src
                    .split("?")[0]
                    .split("#")[0]
                    .toLowerCase();


                if (
                    src.endsWith("/js/navigation.js")
                ) {

                    oldScript.remove();

                    continue;
                }


                /*
                 * No volver a ejecutar player.js.
                 */

                if (
                    src.endsWith("/audio/player.js")
                ) {

                    oldScript.remove();

                    continue;
                }
            }


            const newScript =
                document.createElement("script");


            /*
             * Script externo.
             */

            if (oldScript.src) {

                newScript.src = oldScript.src;
            }


            /*
             * Script inline.
             *
             * Cambiamos DOMContentLoaded por
             * modal-page-ready.
             */

            if (oldScript.textContent) {

                newScript.textContent =
                    oldScript.textContent.replace(
                        /DOMContentLoaded/g,
                        "modal-page-ready"
                    );
            }


            /*
             * Copiar atributos.
             */

            Array.from(
                oldScript.attributes
            ).forEach((attribute) => {

                if (
                    attribute.name === "src"
                ) {

                    return;
                }

                newScript.setAttribute(
                    attribute.name,
                    attribute.value
                );
            });


            oldScript.replaceWith(newScript);
        }


        /*
         * Esperar al renderizado.
         */

        await nextFrame();


        /*
         * Avisar a la página.
         */

        document.dispatchEvent(
            new Event("modal-page-ready")
        );


        /*
         * Segundo cálculo.
         */

        await nextFrame();


        /*
         * Actualizar elementos que dependan
         * de las dimensiones.
         */

        window.dispatchEvent(
            new Event("resize")
        );

        window.dispatchEvent(
            new Event("scroll")
        );
    }


    /*
     * =========================================================
     * PREPARAR CONTENIDO
     * =========================================================
     */

    function preparePageContent(
        doc,
        pageUrl
    ) {

        const wrapper =
            document.createElement("div");


        /*
         * Copiar únicamente el contenido
         * del BODY.
         */

        Array.from(
            doc.body.childNodes
        ).forEach((node) => {

            if (
                node.nodeType ===
                Node.ELEMENT_NODE
            ) {

                const element = node;


                /*
                 * Nunca copiar el audio principal.
                 */

                if (
                    element.id ===
                    "love-audio"
                ) {

                    return;
                }


                /*
                 * Nunca copiar el reproductor.
                 */

                if (
                    element.classList &&
                    element.classList.contains(
                        "love-music-player"
                    )
                ) {

                    return;
                }
            }


            wrapper.appendChild(
                node.cloneNode(true)
            );
        });


        fixRelativePaths(
            wrapper,
            pageUrl
        );


        return wrapper;
    }


    /*
     * =========================================================
     * ABRIR VENTANA
     * =========================================================
     */

    async function openPage(
        url,
        updateHistory = true
    ) {

        if (isLoading) {
            return;
        }


        getElements();


        if (
            !modal ||
            !modalContent
        ) {

            console.error(
                "No se encontró la ventana de navegación."
            );

            return;
        }


        const absoluteUrl =
            getAbsoluteUrl(url);


        /*
         * No recargar la misma página.
         */

        if (
            currentPageUrl === absoluteUrl &&
            modal.classList.contains("is-open")
        ) {

            return;
        }


        isLoading = true;


        try {

            /*
             * Actualizar títulos.
             */

            if (modalTitle) {

                modalTitle.textContent =
                    getPageTitle(absoluteUrl);
            }


            if (modalSection) {

                modalSection.textContent =
                    getPageName(absoluteUrl);
            }


            /*
             * Animación.
             */

            modalContent.classList.remove(
                "is-ready"
            );

            modalContent.classList.add(
                "is-changing"
            );


            /*
             * Abrir ventana inmediatamente.
             */

            if (
                !modal.classList.contains(
                    "is-open"
                )
            ) {

                modal.classList.add(
                    "is-open"
                );

                modal.setAttribute(
                    "aria-hidden",
                    "false"
                );

                document.body.classList.add(
                    "modal-open"
                );
            }


            /*
             * Mostrar indicador de carga.
             */

            modalContent.innerHTML = `
                <div class="page-modal-loading">
                    <span class="page-modal-loading-heart">
                        ♡
                    </span>

                    <span>
                        Preparando nuestro pequeño mundo...
                    </span>
                </div>
            `;


            /*
             * Cargar HTML.
             */

            const html =
                await fetchPage(absoluteUrl);


            const doc =
                new DOMParser().parseFromString(
                    html,
                    "text/html"
                );


            /*
             * Cargar CSS de la página.
             */

            loadPageCss(
                doc,
                absoluteUrl
            );

            await waitForCss();


            /*
             * Preparar contenido.
             */

            const newContent =
                preparePageContent(
                    doc,
                    absoluteUrl
                );


            /*
             * Sustituir contenido.
             */

            modalContent.innerHTML = "";

            modalContent.appendChild(
                newContent
            );


            /*
             * Esperar layout.
             */

            await nextFrame();


            /*
             * Ejecutar scripts de la página.
             */

            await runPageScripts(
                modalContent
            );


            /*
             * Volver al principio.
             */

            modalContent.scrollTop = 0;


            /*
             * Finalizar transición.
             */

            modalContent.classList.remove(
                "is-changing"
            );

            modalContent.classList.add(
                "is-ready"
            );


            /*
             * Guardar página actual.
             */

            currentPageUrl =
                absoluteUrl;


            /*
             * Actualizar historial.
             */

            if (updateHistory) {

                window.history.pushState(
                    {
                        modalPage:
                            absoluteUrl
                    },
                    "",
                    absoluteUrl
                );
            }


        } catch (error) {

            console.error(
                "Error al abrir página:",
                error
            );


            modalContent.innerHTML = `
                <div
                    style="
                        min-height: 60%;
                        display: grid;
                        place-items: center;
                        padding: 40px;
                        text-align: center;
                        color: rgba(255,235,245,.8);
                    "
                >

                    <div>

                        <div
                            style="
                                font-size: 2.5rem;
                                margin-bottom: 15px;
                            "
                        >
                            ♡
                        </div>

                        <h2>
                            No pude abrir esta parte
                            de nuestro mundo.
                        </h2>

                        <p>
                            Intenta nuevamente.
                        </p>

                    </div>

                </div>
            `;

        } finally {

            isLoading = false;
        }
    }


    /*
     * =========================================================
     * CERRAR VENTANA
     * =========================================================
     */

    function closePage(
        updateHistory = true
    ) {

        getElements();


        if (!modal) {
            return;
        }


        modal.classList.remove(
            "is-open"
        );


        modal.setAttribute(
            "aria-hidden",
            "true"
        );


        document.body.classList.remove(
            "modal-open"
        );


        currentPageUrl = null;


        /*
         * Eliminar CSS secundario.
         */

        loadedPageCss.forEach((link) => {

            if (
                link &&
                link.parentNode
            ) {

                link.remove();
            }
        });


        loadedPageCss = [];


        /*
         * Limpiar contenido.
         */

        if (modalContent) {

            modalContent.innerHTML = "";

            modalContent.classList.remove(
                "is-changing",
                "is-ready"
            );
        }


        /*
         * Si estamos dentro de /pages/,
         * regresar visualmente al index.
         */

        if (
            updateHistory &&
            window.location.pathname
                .toLowerCase()
                .includes("/pages/")
        ) {

            window.history.pushState(
                {},
                "",
                "../index.html"
            );
        }
    }


    /*
     * =========================================================
     * MANEJAR ENLACES
     * =========================================================
     */

    function handleLink(event) {

        /*
         * Solo clic izquierdo.
         */

        if (event.button !== 0) {
            return;
        }


        /*
         * Permitir Ctrl / Cmd / Shift / Alt.
         */

        if (
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey ||
            event.altKey
        ) {

            return;
        }


        const link =
            event.target.closest("a");


        if (!link) {
            return;
        }


        /*
         * Enlaces especiales.
         */

        if (
            link.target === "_blank" ||
            link.hasAttribute("download") ||
            link.href.startsWith("mailto:") ||
            link.href.startsWith("tel:")
        ) {

            return;
        }


        let url;

        try {

            url = new URL(
                link.href,
                window.location.href
            );

        } catch (error) {

            return;
        }


        /*
         * Solo mismo dominio.
         */

        if (
            url.origin !==
            window.location.origin
        ) {

            return;
        }


        const pathname =
            url.pathname.toLowerCase();


        /*
         * Solo páginas dentro de /pages/.
         */

        if (
            !pathname.includes("/pages/")
        ) {

            /*
             * Si apunta al index,
             * cerrar la ventana.
             */

            if (
                pathname.endsWith("/index.html") ||
                pathname.endsWith("/")
            ) {

                if (
                    modal &&
                    modal.classList.contains("is-open")
                ) {

                    event.preventDefault();

                    closePage(true);
                }
            }

            return;
        }


        /*
         * Solo archivos HTML.
         */

        if (
            !pathname.endsWith(".html")
        ) {

            return;
        }


        /*
         * Interceptar enlace.
         */

        event.preventDefault();


        openPage(
            url.href,
            true
        );
    }


    /*
     * =========================================================
     * ATRÁS / ADELANTE
     * =========================================================
     */

    function handlePopState() {

        const pathname =
            window.location.pathname
                .toLowerCase();


        if (
            pathname.includes("/pages/")
        ) {

            openPage(
                window.location.href,
                false
            );

        } else {

            closePage(false);
        }
    }


    /*
     * =========================================================
     * TECLA ESC
     * =========================================================
     */

    function handleKeyboard(event) {

        if (event.key !== "Escape") {
            return;
        }


        if (
            modal &&
            modal.classList.contains("is-open")
        ) {

            closePage(true);
        }
    }


    /*
     * =========================================================
     * INICIALIZACIÓN
     * =========================================================
     */

    function initialize() {

        getElements();


        if (
            !modal ||
            !modalContent
        ) {

            console.error(
                "No se encontró #page-modal."
            );

            return;
        }


        /*
         * Interceptar enlaces.
         */

        document.addEventListener(
            "click",
            handleLink,
            true
        );


        /*
         * Botón cerrar.
         */

        if (closeButton) {

            closeButton.addEventListener(
                "click",
                () => {

                    closePage(true);

                }
            );
        }


        /*
         * Fondo.
         */

        if (backdrop) {

            backdrop.addEventListener(
                "click",
                () => {

                    closePage(true);

                }
            );
        }


        /*
         * ESC.
         */

        document.addEventListener(
            "keydown",
            handleKeyboard
        );


        /*
         * Historial.
         */

        window.addEventListener(
            "popstate",
            handlePopState
        );


        /*
         * Si el usuario entra directamente
         * a una página interna, abrirla dentro
         * de la ventana.
         */

        const pathname =
            window.location.pathname
                .toLowerCase();


        if (
            pathname.includes("/pages/")
        ) {

            setTimeout(() => {

                openPage(
                    window.location.href,
                    false
                );

            }, 50);
        }
    }


    /*
     * =========================================================
     * ARRANQUE
     * =========================================================
     */

    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize,
            {
                once: true
            }
        );

    } else {

        initialize();
    }

})();