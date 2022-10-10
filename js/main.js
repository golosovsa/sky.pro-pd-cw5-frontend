const BACKEND_HOST="http://127.0.0.1:5000"

function createOption(value, text) {
    const element = document.createElement("option");
    element.setAttribute("value", value);
    element.textContent = text;
    return element;
}

function removeChildren(node) {
    if (!node) {
        return;
    }
    while (true) {
        if (!node.firstChild) {
            break;
        }
        node.firstChild.remove()
    }
}

async function fetchStatusAndPage() {
    response = await fetch(BACKEND_HOST + "/status/");
    if (response.status !== 200) {
        return {
            server_status: "offline",
        };
    }
    data = await response.json();
    return data;
}

async function fetchStartGame() {
    response = await fetch(BACKEND_HOST + "/start-game/", {
        method: "POST",
        cache: 'no-cache'
    });
    if (response.status !== 201) {
        document.app.showError("Start game failed. Refresh page (F5).");
        return false;
    }
    return true;
}

async function fetchUnitClassesAndEquipment() {
    response = await fetch(BACKEND_HOST + "/unit-class/");
    if (response.status !== 200) {
        document.app.showError("Fetch unit class names failed. Refresh page (F5).");
        return null;
    }
    const unitClassNames = await response.json();
    response = await fetch(BACKEND_HOST + "/equipment/");
    if (response.status !== 200) {
        document.app.showError("Fetch equipment failed. Refresh page (F5).");
        return null;
    }
    const equipment = await response.json();
    return {
        "unitClassNames": unitClassNames,
        "equipment": equipment,
    }
}

async function fetchCreatePlayer(data) {
    response = await fetch(BACKEND_HOST + "/player/", {
        method: "POST",
        cache: 'no-cache',
        body: new URLSearchParams(data),
    })
    if (response.status !== 201) {
        document.app.showError("Create player failed. Refresh page (F5).");
        return false;
    }
    return true;
}

async function fetchCreateEnemy(data) {
    response = await fetch(BACKEND_HOST + "/enemy/", {
        method: "POST",
        cache: 'no-cache',
        body: new URLSearchParams(data),
    })
    if (response.status !== 201) {
        document.app.showError("Create enemy failed. Refresh page (F5).");
        return false;
    }
    return true;
}

document.addEventListener("DOMContentLoaded", () => {
    
    document.app = {
        blocks: {
            spinner: new Vanilla_spinner({
                append_to: '.spinner__container',
                speed: 18,
                size: 64,
                show: false,
            }),
            resultTitle: document.querySelector(".page__result"),
            gameStartButton: document.querySelector(".button__start-game"),

            createPlayerForm: document.querySelector(".create-player__form"),
            createPlayerClassSelect: document.querySelector(".create-player__unit-class"),
            createPlayerWeaponSelect: document.querySelector(".create-player__weapon"),
            createPlayerArmorSelect: document.querySelector(".create-player__armor"),
            createPlayerButton: document.querySelector(".button__create-player"),

            createEnemyForm: document.querySelector(".create-enemy__form"),
            createEnemyClassSelect: document.querySelector(".create-enemy__unit-class"),
            createEnemyWeaponSelect: document.querySelector(".create-enemy__weapon"),
            createEnemyArmorSelect: document.querySelector(".create-enemy__armor"),
            createEnemyButton: document.querySelector(".button__create-enemy"),
        },
        pages: {
            pageStartAndResults: document.querySelector(".page_start_and_results"),
            pageCreatePlayer: document.querySelector(".page_create_player"),
            pageCreateEnemy: document.querySelector(".page_create_enemy"),
            
        },
        
        currentPage: null,
        idle: function() {
            fetchStatusAndPage().then((data) => {
                if (data.server_status !== "online") {
                    document.app.showError("Server offline");
                    return
                }
                page = data.current_screen;

                if (document.app.currentPage === page) {
                    return
                }

                document.app.hideAllPages();
                document.app.blocks.spinner.start()

                console.log(page);

                switch (page) {
                    case "start_and_results":
                        document.app.showStartAndResults(data.fight_result);
                        break;
                    case "create_player":
                        document.app.createPlayer();
                        break;
                    case "create_enemy":
                        document.app.createEnemy();
                        break;
                    default:
                        break;
                }
            })
        },

        idleTimerID: null,

        run: function () {

            document.app.blocks.gameStartButton.addEventListener("click", (event) => {
                fetchStartGame().then((is_ok) => {
                    if (is_ok) {
                        document.app.hideAllPages();
                        document.app.blocks.spinner.start()
                    }
                })
            });

            document.app.blocks.createPlayerForm.addEventListener("submit", (event) => {
                event.preventDefault();
                const formData = new FormData(document.app.blocks.createPlayerForm);

                fetchCreatePlayer({
                    name: formData.get("name"),
                    unit_class: formData.get("unit_class"),
                    weapon: formData.get("weapon"),
                    armor: formData.get("armor"),
                }).then((is_ok) => {
                    if (is_ok) {
                        document.app.hideAllPages();
                        document.app.blocks.spinner.start()
                    }
                })
            });

            document.app.blocks.createEnemyForm.addEventListener("submit", (event) => {
                event.preventDefault();
                const formData = new FormData(document.app.blocks.createEnemyForm);

                fetchCreateEnemy({
                    name: formData.get("name"),
                    unit_class: formData.get("unit_class"),
                    weapon: formData.get("weapon"),
                    armor: formData.get("armor"),
                }).then((is_ok) => {
                    if (is_ok) {
                        document.app.hideAllPages();
                        document.app.blocks.spinner.start()
                    }
                })
            })


            document.app.idleTimerID = setInterval(document.app.idle, 1000);
        },

        showError: function(errorMessage) {
            clearInterval(document.app.idleTimerID);
            console.log(errorMessage);
        },

        hideAllPages: function() {
            for (const name in document.app.pages) {
                const block = document.app.pages[name];
                block.classList.add("page_hidden");
            }
        },

        showStartAndResults: function(result) {
            document.app.currentPage = "start_and_results";
            document.app.blocks.resultTitle.textContent = result;
            document.app.blocks.spinner.halt();
            document.app.pages.pageStartAndResults.classList.remove("page_hidden")
        },

        createPlayer: function() {
            fetchUnitClassesAndEquipment().then(data => {

                if (data === null) {
                    return
                }

                document.app.currentPage = "create_player";
            
                const clsSelect = document.app.blocks.createPlayerClassSelect;
                const weaponSelect = document.app.blocks.createPlayerWeaponSelect;
                const armorSelect = document.app.blocks.createPlayerArmorSelect;

                removeChildren(clsSelect);
                removeChildren(weaponSelect);
                removeChildren(armorSelect);

                clsSelect.appendChild(createOption("", "Выберите класс"))
                weaponSelect.appendChild(createOption("", "Выберите оружие"))
                armorSelect.appendChild(createOption("", "Выберите броню"))

                console.log(data);

                for (const cls of data.unitClassNames.unit_class_names) {
                    clsSelect.appendChild(createOption(cls, cls));
                }

                for (const weapon of data.equipment.weapon) {
                    weaponSelect.appendChild(createOption(weapon, weapon));
                }

                for (const armor of data.equipment.armor) {
                    armorSelect.appendChild(createOption(armor, armor));
                }

                document.app.blocks.spinner.halt();
                document.app.pages.pageCreatePlayer.classList.remove("page_hidden")
            })
        },

        createEnemy: function() {
            fetchUnitClassesAndEquipment().then(data => {

                if (data === null) {
                    return
                }

                document.app.currentPage = "create_enemy";
            
                const clsSelect = document.app.blocks.createEnemyClassSelect;
                const weaponSelect = document.app.blocks.createEnemyWeaponSelect;
                const armorSelect = document.app.blocks.createEnemyArmorSelect;

                removeChildren(clsSelect);
                removeChildren(weaponSelect);
                removeChildren(armorSelect);

                clsSelect.appendChild(createOption("", "Выберите класс"))
                weaponSelect.appendChild(createOption("", "Выберите оружие"))
                armorSelect.appendChild(createOption("", "Выберите броню"))

                for (const cls of data.unitClassNames.unit_class_names) {
                    clsSelect.appendChild(createOption(cls, cls));
                }

                for (const weapon of data.equipment.weapon) {
                    weaponSelect.appendChild(createOption(weapon, weapon));
                }

                for (const armor of data.equipment.armor) {
                    armorSelect.appendChild(createOption(armor, armor));
                }

                document.app.blocks.spinner.halt();
                document.app.pages.pageCreateEnemy.classList.remove("page_hidden")
            })
        }
    };

    document.app.run()
})