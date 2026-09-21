(() => {
    "use strict";

    /*
     * =========================================================
     * REPRODUCTOR DE NUESTRA CANCIÓN
     * =========================================================
     *
     * Este reproductor pertenece al index.html.
     *
     * navigation.js NO crea ni reemplaza este audio.
     *
     * El elemento <audio> permanece cargado mientras
     * se muestran las páginas dentro de la ventana modal.
     * =========================================================
     */

    let audio = null;
    let toggleButton = null;
    let status = null;


    /*
     * =========================================================
     * OBTENER ELEMENTOS
     * =========================================================
     */

    function getElements() {

        audio = document.getElementById(
            "love-audio"
        );

        toggleButton = document.getElementById(
            "music-toggle"
        );

        status = document.getElementById(
            "music-status"
        );
    }


    /*
     * =========================================================
     * ACTUALIZAR INTERFAZ
     * =========================================================
     */

    function updatePlayer() {

        if (!audio) {
            return;
        }


        if (audio.paused) {

            if (toggleButton) {

                toggleButton.textContent = "♫";

                toggleButton.setAttribute(
                    "aria-label",
                    "Reproducir nuestra canción"
                );

                toggleButton.classList.remove(
                    "is-playing"
                );
            }


            if (status) {

                status.textContent = "Pausada";
            }

        } else {

            if (toggleButton) {

                toggleButton.textContent = "Ⅱ";

                toggleButton.setAttribute(
                    "aria-label",
                    "Pausar nuestra canción"
                );

                toggleButton.classList.add(
                    "is-playing"
                );
            }


            if (status) {

                status.textContent = "Reproduciendo";
            }
        }
    }


    /*
     * =========================================================
     * REPRODUCIR / PAUSAR
     * =========================================================
     */

    async function toggleMusic() {

        if (!audio) {
            return;
        }


        if (audio.paused) {

            try {

                await audio.play();

            } catch (error) {

                console.warn(
                    "No se pudo reproducir la canción:",
                    error
                );

                if (status) {

                    status.textContent =
                        "Pulsa nuevamente para reproducir";
                }

            }

        } else {

            audio.pause();
        }


        updatePlayer();
    }


    /*
     * =========================================================
     * INICIALIZACIÓN
     * =========================================================
     */

    function initialize() {

        getElements();


        if (!audio) {

            console.error(
                'No se encontró el elemento "#love-audio".'
            );

            return;
        }


        if (!toggleButton) {

            console.error(
                'No se encontró el botón "#music-toggle".'
            );

            return;
        }


        /*
         * Evitar registrar el evento dos veces.
         */

        if (
            toggleButton.dataset.playerInitialized ===
            "true"
        ) {

            updatePlayer();

            return;
        }


        toggleButton.dataset.playerInitialized =
            "true";


        /*
         * Clic del botón.
         */

        toggleButton.addEventListener(
            "click",
            toggleMusic
        );


        /*
         * Actualizar cuando comienza.
         */

        audio.addEventListener(
            "play",
            updatePlayer
        );


        /*
         * Actualizar cuando se pausa.
         */

        audio.addEventListener(
            "pause",
            updatePlayer
        );


        /*
         * Actualizar cuando termina.
         */

        audio.addEventListener(
            "ended",
            () => {

                audio.currentTime = 0;

                updatePlayer();

            }
        );


        /*
         * Estado inicial.
         */

        updatePlayer();
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