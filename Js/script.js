document.addEventListener("DOMContentLoaded", () => {

    const welcomeScreen =
        document.querySelector(".welcome-screen");

    const homeScreen =
        document.querySelector(".home-screen");

    const enterButton =
        document.querySelector(".enter-button");


    if (
        enterButton &&
        welcomeScreen &&
        homeScreen
    ) {

        enterButton.addEventListener(
            "click",
            () => {

                welcomeScreen.classList.add(
                    "welcome-hidden"
                );


                setTimeout(() => {

                    welcomeScreen.style.display =
                        "none";

                    homeScreen.classList.add(
                        "home-visible"
                    );


                    window.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    });

                }, 700);

            }
        );

    }


    if (
        window.location.hash === "#menu"
    ) {

        if (welcomeScreen) {

            welcomeScreen.style.display =
                "none";

            welcomeScreen.classList.add(
                "welcome-hidden"
            );

        }


        if (homeScreen) {

            homeScreen.classList.add(
                "home-visible"
            );

        }


        window.scrollTo({
            top: 0,
            behavior: "instant"
        });

    }


    const yearsElement =
        document.getElementById(
            "counter-years"
        );

    const monthsElement =
        document.getElementById(
            "counter-months"
        );

    const daysElement =
        document.getElementById(
            "counter-days"
        );


    if (
        yearsElement &&
        monthsElement &&
        daysElement
    ) {

        const startDate =
            new Date(
                2025,
                4,
                27
            );


        function updateLoveCounter() {

            const now =
                new Date();


            if (now < startDate) {

                yearsElement.textContent =
                    "0";

                monthsElement.textContent =
                    "0";

                daysElement.textContent =
                    "0";

                return;

            }


            let years =
                now.getFullYear() -
                startDate.getFullYear();


            let months =
                now.getMonth() -
                startDate.getMonth();


            let days =
                now.getDate() -
                startDate.getDate();


            if (days < 0) {

                months--;

                const previousMonth =
                    new Date(
                        now.getFullYear(),
                        now.getMonth(),
                        0
                    );

                days +=
                    previousMonth.getDate();

            }


            if (months < 0) {

                years--;

                months += 12;

            }


            yearsElement.textContent =
                years;

            monthsElement.textContent =
                months;

            daysElement.textContent =
                days;

        }


        updateLoveCounter();


        setInterval(
            updateLoveCounter,
            1000
        );

    }


    const internalLinks =
        document.querySelectorAll(
            'a[href]'
        );


    internalLinks.forEach(link => {

        link.addEventListener(
            "click",
            event => {

                const href =
                    link.getAttribute(
                        "href"
                    );


                if (
                    !href ||
                    href === "#" ||
                    href.startsWith(
                        "javascript:"
                    )
                ) {

                    return;

                }


                if (
                    href.startsWith(
                        "http://"
                    ) ||
                    href.startsWith(
                        "https://"
                    ) ||
                    href.startsWith(
                        "mailto:"
                    ) ||
                    href.startsWith(
                        "tel:"
                    )
                ) {

                    return;

                }


                if (
                    href.startsWith("#")
                ) {

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


                event.preventDefault();


                document.body.classList.add(
                    "page-exit"
                );


                setTimeout(() => {

                    window.location.href =
                        href;

                }, 500);

            }
        );

    });


    window.addEventListener(
        "pageshow",
        () => {

            document.body.classList.remove(
                "page-exit"
            );

        }
    );

});