(() => {
    "use strict";

    console.log("✅ script.js cargado correctamente");

    const START_DATE = new Date(2025, 4, 27);

    /* =====================================================
       CONTADOR
       ===================================================== */

    function updateCounter() {
        const yearsElement =
            document.getElementById("counter-years");

        const monthsElement =
            document.getElementById("counter-months");

        const daysElement =
            document.getElementById("counter-days");

        if (
            !yearsElement ||
            !monthsElement ||
            !daysElement
        ) {
            console.warn(
                "⚠️ No se encontraron los elementos del contador."
            );
            return;
        }

        const now = new Date();

        let years =
            now.getFullYear() -
            START_DATE.getFullYear();

        let months =
            now.getMonth() -
            START_DATE.getMonth();

        let days =
            now.getDate() -
            START_DATE.getDate();

        if (days < 0) {
            months--;

            const previousMonth =
                new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    0
                );

            days += previousMonth.getDate();
        }

        if (months < 0) {
            years--;
            months += 12;
        }

        yearsElement.textContent = years;
        monthsElement.textContent = months;
        daysElement.textContent = days;
    }


    /* =====================================================
       REPRODUCIR NUESTRA CANCIÓN
       ===================================================== */

    function startLoveMusic() {
        console.log(
            "🎵 Intentando reproducir nuestra canción..."
        );

        const audio =
            document.getElementById("love-audio");

        if (!audio) {
            console.error(
                "❌ No existe #love-audio"
            );
            return;
        }

        audio.volume = 1;

        const playPromise = audio.play();

        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    console.log(
                        "❤️ La canción comenzó correctamente."
                    );

                    const status =
                        document.getElementById(
                            "music-status"
                        );

                    const toggle =
                        document.getElementById(
                            "music-toggle"
                        );

                    if (status) {
                        status.textContent =
                            "Reproduciendo";
                    }

                    if (toggle) {
                        toggle.textContent = "Ⅱ";

                        toggle.setAttribute(
                            "aria-label",
                            "Pausar nuestra canción"
                        );

                        toggle.classList.add(
                            "is-playing"
                        );
                    }
                })
                .catch((error) => {
                    console.error(
                        "❌ El navegador rechazó la reproducción:",
                        error
                    );
                });
        }
    }


    /* =====================================================
       ENTRAR A NUESTRO MUNDO
       ===================================================== */

    function initializeWelcome() {
        console.log(
            "🔎 Buscando pantalla de bienvenida..."
        );

        const welcomeScreen =
            document.querySelector(
                ".welcome-screen"
            );

        const enterButton =
            document.querySelector(
                ".enter-button"
            );

        const menu =
            document.getElementById("menu");

        console.log(
            "welcomeScreen:",
            welcomeScreen
        );

        console.log(
            "enterButton:",
            enterButton
        );

        console.log(
            "menu:",
            menu
        );

        if (!welcomeScreen) {
            console.error(
                "❌ No se encontró .welcome-screen"
            );
            return;
        }

        if (!enterButton) {
            console.error(
                "❌ No se encontró .enter-button"
            );
            return;
        }

        console.log(
            "✅ Botón encontrado correctamente."
        );

        if (
            enterButton.dataset.initialized ===
            "true"
        ) {
            return;
        }

        enterButton.dataset.initialized =
            "true";

        enterButton.addEventListener(
            "click",
            function () {

                console.log(
                    "❤️ SE PRESIONÓ ENTRAR A NUESTRO MUNDO"
                );

                /*
                 * 1. Reproducir la canción
                 */
                startLoveMusic();


                /*
                 * 2. Ocultar completamente
                 *    la pantalla de bienvenida
                 */
                welcomeScreen.style.opacity = "0";
                welcomeScreen.style.visibility =
                    "hidden";
                welcomeScreen.style.pointerEvents =
                    "none";


                /*
                 * 3. Mostrar el menú
                 */
                if (menu) {
                    menu.style.opacity = "1";
                    menu.style.visibility =
                        "visible";
                    menu.style.pointerEvents =
                        "auto";

                    /*
                     * Si el menú utiliza display,
                     * también lo activamos.
                     */
                    menu.style.display = "block";
                }

                console.log(
                    "🏠 Bienvenida ocultada. Menú mostrado."
                );
            }
        );
    }


    /* =====================================================
       INICIALIZACIÓN
       ===================================================== */

    function initialize() {
        console.log(
            "🚀 Inicializando página..."
        );

        updateCounter();

        initializeWelcome();

        console.log(
            "✅ Inicialización terminada."
        );
    }


    if (
        document.readyState ===
        "loading"
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