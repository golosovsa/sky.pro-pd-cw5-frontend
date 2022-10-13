const BACKEND_HOST="/app"

function createLogMessage(message) {
    const element = document.createElement("p");
    const em = document.createElement("em");
    em.textContent = message;
    element.appendChild(em);
    return element;
}

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
    const response = await fetch(BACKEND_HOST + "/status/");
    if (response.status !== 200) {
        return {
            server_status: "offline",
        };
    }
    data = await response.json();
    return data;
}

async function fetchStartGame() {
    const response = await fetch(BACKEND_HOST + "/start-game/", {
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
    let response = await fetch(BACKEND_HOST + "/unit-class/");
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
    const response = await fetch(BACKEND_HOST + "/player/", {
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
    const response = await fetch(BACKEND_HOST + "/enemy/", {
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

async function fetchPlayerAndEnemy() {
    let response = await fetch(BACKEND_HOST + "/player/");
    if (response.status !== 200) {
        document.app.showError("Fetch player failed. Refresh page (F5).");
        return null;
    }
    const player = await response.json();
    response = await fetch(BACKEND_HOST + "/enemy/");
    if (response.status !== 200) {
        document.app.showError("Fetch enemy failed. Refresh page (F5).");
        return null;
    }
    const enemy = await response.json();
    return {
        player: player,
        enemy: enemy,
    };
}

async function fetchExpandPlayerAndEnemy(data) {
    const playerUnitClass = data.player.unit_class;
    const playerWeapon = data.player.weapon;
    const playerArmor = data.player.armor;

    const enemyUnitClass = data.enemy.unit_class;
    const enemyWeapon = data.enemy.weapon;
    const enemyArmor = data.enemy.armor;

    let response = await fetch(BACKEND_HOST + `/unit-class/${playerUnitClass}`)
    if (response.status !== 200) {
        document.app.showError("Fetch player unit-class failed. Refresh page (F5).");
        return null;
    }
    data.player.unit_class = await response.json();

    response = await fetch(BACKEND_HOST + `/equipment/weapon/${playerWeapon}`)
    if (response.status !== 200) {
        document.app.showError("Fetch player weapon failed. Refresh page (F5).");
        return null;
    }
    data.player.weapon = await response.json();

    response = await fetch(BACKEND_HOST + `/equipment/armor/${playerArmor}`)
    if (response.status !== 200) {
        document.app.showError("Fetch player armor failed. Refresh page (F5).");
        return null;
    }
    data.player.armor = await response.json();

    response = await fetch(BACKEND_HOST + `/unit-class/${enemyUnitClass}`)
    if (response.status !== 200) {
        document.app.showError("Fetch enemy unit-class failed. Refresh page (F5).");
        return null;
    }
    data.enemy.unit_class = await response.json();

    response = await fetch(BACKEND_HOST + `/equipment/weapon/${enemyWeapon}`)
    if (response.status !== 200) {
        document.app.showError("Fetch enemy weapon failed. Refresh page (F5).");
        return null;
    }
    data.enemy.weapon = await response.json();

    response = await fetch(BACKEND_HOST + `/equipment/armor/${enemyArmor}`)
    if (response.status !== 200) {
        document.app.showError("Fetch enemy armor failed. Refresh page (F5).");
        return null;
    }
    data.enemy.armor = await response.json();

    return data;
}

async function fetchBattleLog() {
    const response = await fetch(BACKEND_HOST + "/battle-log/");
    if (response.status !== 200) {
        document.app.showError("Fetch battle log failed. Refresh page (F5).");
        return null;
    }
    data = await response.json();
    return data;
}

async function fetchFight(action) {
    const response = await fetch(BACKEND_HOST + "/fight/", {
        method: "POST",
        cache: 'no-cache',
        body: new URLSearchParams({action: action,}),
    });

    if (response.status !== 201) {
        document.app.showError("Fetch fight failed. Refresh page (F5).");
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

            fightPlayerName: document.querySelector(".fight__player-name"),
            fightPlayerClass: document.querySelector(".fight__player-class"),
            fightPlayerWeapon: document.querySelector(".fight__player-weapon"),
            fightPlayerArmor: document.querySelector(".fight__player-armor"),
            fightPlayerHP: document.querySelector(".fight__player-hp"),
            fightPlayerMaxHP: document.querySelector(".fight__player-max-hp"),
            fightPlayerStamina: document.querySelector(".fight__player-stamina"),
            fightPlayerMaxStamina: document.querySelector(".fight__player-max-stamina"),

            fightButtonHit: document.querySelector(".fight__button_hit"),
            fightButtonSkill: document.querySelector(".fight__button_skill"),
            fightButtonSkip: document.querySelector(".fight__button_skip"),
            fightButtonExit: document.querySelector(".fight__button_exit"),

            fightEnemyName: document.querySelector(".fight__enemy-name"),
            fightEnemyClass: document.querySelector(".fight__enemy-class"),
            fightEnemyWeapon: document.querySelector(".fight__enemy-weapon"),
            fightEnemyArmor: document.querySelector(".fight__enemy-armor"),
            fightEnemyHP: document.querySelector(".fight__enemy-hp"),
            fightEnemyMaxHP: document.querySelector(".fight__enemy-max-hp"),
            fightEnemyStamina: document.querySelector(".fight__enemy-stamina"),
            fightEnemyMaxStamina: document.querySelector(".fight__enemy-max-stamina"),

            fightConsole: document.querySelector(".fight__console"),

            errorMsg: document.querySelector(".page__error-msg"),
        },
        pages: {
            pageStartAndResults: document.querySelector(".page_start_and_results"),
            pageCreatePlayer: document.querySelector(".page_create_player"),
            pageCreateEnemy: document.querySelector(".page_create_enemy"),
            pageFight: document.querySelector(".page_fight"),
            pageError: document.querySelector(".page_error"),
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
                    
                    if (page === "fight") {
                        document.app.updateFight();
                    }

                    return
                }

                document.app.hideAllPages();
                document.app.blocks.spinner.start()

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
                    case "fight":
                        document.app.fight()
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
            });

            document.app.blocks.fightButtonHit.addEventListener("click", () => {
                fetchFight("hit").then(is_ok => {
                    if (!is_ok) {
                        return
                    }
                    const buttonHit = document.app.blocks.fightButtonHit;
                    const buttonSkill = document.app.blocks.fightButtonSkill;
                    const buttonSkip = document.app.blocks.fightButtonSkip;
                    const buttonExit = document.app.blocks.fightButtonExit;

                    buttonHit.disabled = true;
                    buttonSkill.disabled = true;
                    buttonSkip.disabled = true;
                    buttonExit.disabled = true;
                })
            });

            document.app.blocks.fightButtonSkill.addEventListener("click", () => {
                fetchFight("skill").then(is_ok => {
                    if (!is_ok) {
                        return
                    }
                    const buttonHit = document.app.blocks.fightButtonHit;
                    const buttonSkill = document.app.blocks.fightButtonSkill;
                    const buttonSkip = document.app.blocks.fightButtonSkip;
                    const buttonExit = document.app.blocks.fightButtonExit;

                    buttonHit.disabled = true;
                    buttonSkill.disabled = true;
                    buttonSkip.disabled = true;
                    buttonExit.disabled = true;
                })
            });

            document.app.blocks.fightButtonSkip.addEventListener("click", () => {
                fetchFight("skip").then(is_ok => {
                    if (!is_ok) {
                        return
                    }
                    const buttonHit = document.app.blocks.fightButtonHit;
                    const buttonSkill = document.app.blocks.fightButtonSkill;
                    const buttonSkip = document.app.blocks.fightButtonSkip;
                    const buttonExit = document.app.blocks.fightButtonExit;

                    buttonHit.disabled = true;
                    buttonSkill.disabled = true;
                    buttonSkip.disabled = true;
                    buttonExit.disabled = true;
                })
            });

            document.app.blocks.fightButtonExit.addEventListener("click", () => {
                fetchFight("exit").then(is_ok => {
                    if (!is_ok) {
                        return
                    }
                    const buttonHit = document.app.blocks.fightButtonHit;
                    const buttonSkill = document.app.blocks.fightButtonSkill;
                    const buttonSkip = document.app.blocks.fightButtonSkip;
                    const buttonExit = document.app.blocks.fightButtonExit;

                    buttonHit.disabled = true;
                    buttonSkill.disabled = true;
                    buttonSkip.disabled = true;
                    buttonExit.disabled = true;
                })
            });


            document.app.idleTimerID = setInterval(document.app.idle, 700);
        },

        showError: function(errorMessage) {
            clearInterval(document.app.idleTimerID);
            console.log(errorMessage);
            document.app.blocks.errorMsg.textContent = errorMessage;
            document.app.pages.pageError.classList.remove("page_hidden")
            // window.location.reload();
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
        },

        fight: function() {
            fetchPlayerAndEnemy().then(data => {
                if (data === null) {
                    return
                }

                fetchExpandPlayerAndEnemy(data).then(data => {
                    document.app.currentPage = "fight";

                    const playerName = document.app.blocks.fightPlayerName;
                    const playerClass = document.app.blocks.fightPlayerClass;
                    const playerWeapon = document.app.blocks.fightPlayerWeapon;
                    const playerArmor = document.app.blocks.fightPlayerArmor;
                    const playerHP = document.app.blocks.fightPlayerHP;
                    const playerMaxHP = document.app.blocks.fightPlayerMaxHP;
                    const playerStamina = document.app.blocks.fightPlayerStamina;
                    const playerMaxStamina = document.app.blocks.fightPlayerMaxStamina;
                    const enemyName = document.app.blocks.fightEnemyName;
                    const enemyClass = document.app.blocks.fightEnemyClass;
                    const enemyWeapon = document.app.blocks.fightEnemyWeapon;
                    const enemyArmor = document.app.blocks.fightEnemyArmor;
                    const enemyHP = document.app.blocks.fightEnemyHP;
                    const enemyMaxHP = document.app.blocks.fightEnemyMaxHP;
                    const enemyStamina = document.app.blocks.fightEnemyStamina;
                    const enemyMaxStamina = document.app.blocks.fightEnemyMaxStamina;

                    playerName.textContent = data.player.name;
                    playerClass.textContent = data.player.unit_class.name;
                    playerWeapon.textContent = `Оружие: ${data.player.weapon.name}, урон: ${data.player.weapon.min_damage} - ${data.player.weapon.max_damage}`;
                    playerArmor.textContent = `Броня: ${data.player.armor.name}, защита: ${data.player.armor.defence}`;
                    playerHP.textContent = Math.round(data.player.health_points, -2);
                    playerMaxHP.textContent = data.player.unit_class.max_health;
                    playerStamina.textContent = Math.round(data.player.stamina_points, -2);
                    playerMaxStamina.textContent = data.player.unit_class.max_stamina;

                    enemyName.textContent = data.enemy.name;
                    enemyClass.textContent = data.enemy.unit_class.name;
                    enemyWeapon.textContent = `Оружие: ${data.enemy.weapon.name}, урон: ${data.enemy.weapon.min_damage} - ${data.enemy.weapon.max_damage}`;
                    enemyArmor.textContent = `Броня: ${data.enemy.armor.name}, защита: ${data.enemy.armor.defence}`;
                    enemyHP.textContent = Math.round(data.enemy.health_points, -2);
                    enemyMaxHP.textContent = data.enemy.unit_class.max_health;
                    enemyStamina.textContent = Math.round(data.enemy.stamina_points, -2);
                    enemyMaxStamina.textContent = data.enemy.unit_class.max_stamina;

                    document.app.blocks.fightConsole.replaceChildren();
                    document.app.log = [];

                    document.app.blocks.spinner.halt();
                    document.app.pages.pageFight.classList.remove("page_hidden")
                })
            })
        },

        log: [],

        updateFight: function() {
            fetchPlayerAndEnemy().then(data => {
                if (data === null) {
                    return
                }

                const playerHP = document.app.blocks.fightPlayerHP;
                const playerStamina = document.app.blocks.fightPlayerStamina;
                const enemyHP = document.app.blocks.fightEnemyHP;
                const enemyStamina = document.app.blocks.fightEnemyStamina;
                playerHP.textContent = Math.round(data.player.health_points * 100) / 100;
                playerStamina.textContent = Math.round(data.player.stamina_points * 100) / 100;
                enemyHP.textContent = Math.round(data.enemy.health_points * 100) / 100;
                enemyStamina.textContent = Math.round(data.enemy.stamina_points * 100) / 100;

            });

            fetchBattleLog().then(data => {
                if (data === null) {
                    return
                }

                document.app.log = document.app.log.concat(data.log)
                const log = document.app.log;

                if (log.length === 0) {
                    const buttonHit = document.app.blocks.fightButtonHit;
                    const buttonSkill = document.app.blocks.fightButtonSkill;
                    const buttonSkip = document.app.blocks.fightButtonSkip;
                    const buttonExit = document.app.blocks.fightButtonExit;

                    buttonHit.disabled = false;
                    buttonSkill.disabled = false;
                    buttonSkip.disabled = false;
                    buttonExit.disabled = false;
                } else {
                    const fightConsole = document.app.blocks.fightConsole;
                    const message = log.shift();
                    fightConsole.insertBefore(
                        createLogMessage(message), 
                        fightConsole.firstChild
                    );
                }
            })
        },
    };

    document.app.run()
})