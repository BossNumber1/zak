const initialState = {
    page: {
        body: {
            class: null
        },
        header: {
            navigation: false,
            title: null
        }
    },
    articles: {
        current: {
            seasonId: null
        }
    },
    notifications: {
        unreadCount: 0,
        list: [],
        unreadChatsTotalMessage: 0,
        unreadChats: []
    },
    seasonState: {
        id: 0,
        has: 0,
        date: null
    },
    chat: {
        isOpen: false,
        current: {
            step: 1,
            id: null,
            specialist: {
                id: null
            }
        }
    },
    profile: {
        season: {
            id: null,
            name: null
        },
    },
    helpVideos: {}
};

function reducers (state = initialState, action) {
    switch (action.type) {
        case 'SET_HELP_VIDEOS':
            return {
                ...state,
                helpVideos: action.payload
            };
        case 'ARTICLES_CHANGE_SEASON':
            return {
                ...state,
                articles: {
                    current: {
                        seasonId: action.payload
                    }
                }
            };
        case 'NOTIFICATIONS_UPDATE':
            return {
                ...state,
                notifications: action.payload
            };
        case 'NOTIFICATIONS':
            return {
                ...state,
                notifications: action.payload
            };
        case 'SEASON_STATE':
            return {
                ...state,
                seasonState: action.payload
            };
        case 'TOGGLE_CHAT':
            return {
                ...state,
                chat: {
                    ...state.chat,
                    ...action.payload
                }
            };
        case 'AUTHORIZATION':
            return {
                ...state,
                profile: {
                    ...state.profile,
                    ...action.payload
                }
            };
        case 'CHANGE_PAGE':
            return {
                ...state,
                page: action.payload
            };
        case 'CHANGE_PAGE_TO_SIGNIN':
            return {
                ...state,
                page: action.payload
            };
        case 'CHANGE_PAGE_TO_DASHBOARD':
            return {
                ...state,
                page: action.payload
            };
        case 'HIDE.SNACKBAR':
            return {
                ...state,
                snackbar: {
                    ...state.snackbar,
                    open: false
                }
            };
        case 'HIDE.SIDEBAR':
            return {
                ...state,
                sidebar: {
                    ...state.sidebar,
                    active: false
                }
            };
        case 'CABINET.CHANGE_CABINET_TYPE':
            return {
                ...state,
                profile: {
                    ...state.profile,
                    access: {
                        ...state.profile.access,
                        ...action.payload
                    }
                }
            };

        case 'MAIN.HOME':
            return {
                ...state,
                page: {
                    type:   "MAIN",
                    title:  "Главная страница",
                    class:  "tm-page-main tm-page-main-home"
                },
                sidebar: {
                    ...state.sidebar,
                    active: false
                }
            };
        case 'MAIN.ABOUT':
            return {
                ...state,
                page: {
                    type:   "MAIN",
                    title:  "О платформе",
                    class:  "tm-page-main tm-page-main-about"
                },
                sidebar: {
                    ...state.sidebar,
                    active: false
                }
            };
        case 'PAGE.DOCUMENTS':
            return {
                ...state,
                page: {
                    type:   "DOCUMENTS",
                    title:  "Раскрытие информации",
                    class:  "tm-page-main tm-page-documents"
                },
                sidebar: {
                    ...state.sidebar,
                    active: false
                }
            };
        case 'MAIN.BORROWERS':
            return {
                ...state,
                page: {
                    type:   "MAIN",
                    title:  "Заёмщикам",
                    class:  "tm-page-main tm-page-main-borrowers"
                },
                sidebar: {
                    ...state.sidebar,
                    active: false
                }
            };
        case 'MAIN.SIGNIN':
            return {
                ...state,
                page: {
                    type:   "MAIN",
                    title:  "Авторизация",
                    class:  "tm-page-main tm-page-main-signin"
                },
                sidebar: {
                    ...state.sidebar,
                    active: false
                }
            };
        case 'MAIN.RESTORE':
            return {
                ...state,
                page: {
                    type:   "MAIN",
                    title:  "Восстановление пароли",
                    class:  "tm-page-main tm-page-main-restore"
                },
                sidebar: {
                    ...state.sidebar,
                    active: false
                }
            };
        case 'MAIN.SIGNUP':
            return {
                ...state,
                page: {
                    type:   "MAIN",
                    title:  "Регистрация",
                    class:  "tm-page-main tm-page-main-signup"
                },
                sidebar: {
                    ...state.sidebar,
                    active: false
                }
            };
        case 'MAIN.SIGNUP.STEP_TWO':
            return {
                ...state,
                page: {
                    type:   "MAIN",
                    title:  "Регистрация",
                    class:  "tm-page-main tm-page-main-signup"
                },
                sidebar: {
                    ...state.sidebar,
                    active: false
                },
                signupData: {
                    ...state.signupData,
                    ...action.payload.signupData
                }
            };
        case 'CABINET.INDEX':
            return {
                ...state,
                page: {
                    type:   "CABINET",
                    title:  "Личный кабинет",
                    class:  "tm-page-cabinet tm-page-cabinet-index"
                },
                sidebar: {
                    active: true,
                    currentItem: null
                },
                footer: false,
                profile: {
                    ...state.profile,
                    ...action.payload.profile
                }
            };
        case 'CABINET.BALANCE':
            return {
                ...state,
                page: {
                    type:   "CABINET",
                    title:  "Баланс",
                    class:  "tm-page-cabinet tm-page-cabinet-balance"
                },
                sidebar: {
                    active: true,
                    currentItem: 0
                },
                footer: false,
                profile: {
                    ...state.profile,
                    ...action.payload.profile
                }
            };
        case 'CABINET.REQUESTS':
            return {
                ...state,
                page: {
                    type:   "CABINET",
                    title:  "Заявки",
                    class:  "tm-page-cabinet tm-page-cabinet-requests"
                },
                sidebar: {
                    active: true,
                    currentItem: 1
                },
                footer: false,
                profile: {
                    ...state.profile,
                    ...action.payload.profile
                }
            };
        case 'CABINET.PROJECTS':
            return {
                ...state,
                page: {
                    type:   "CABINET",
                    title:  "Проекты",
                    class:  "tm-page-cabinet tm-page-cabinet-projects"
                },
                sidebar: {
                    active: true,
                    currentItem: 2
                },
                footer: false,
                profile: {
                    ...state.profile,
                    ...action.payload.profile
                }
            };
        case 'CABINET.PROJECT':
            return {
                ...state,
                page: {
                    type:   "CABINET",
                    title:  "Проекты",
                    class:  "tm-page-cabinet tm-page-project"
                },
                sidebar: {
                    active: true,
                    currentItem: 2
                },
                footer: false,
                profile: {
                    ...state.profile,
                    ...action.payload.profile
                },
                project: {
                    ...state.project,
                    ...action.payload.project
                }
            };
        case 'PERSONAL_AREA.PROJECT.EDIT':
            return {
                ...state,
                page: {
                    type:   "CABINET",
                    title:  "Редактирование проекта",
                    class:  "tm-page-cabinet tm-page-project"
                },
                sidebar: {
                    active: true,
                    currentItem: 2
                },
                footer: false,
                profile: {
                    ...state.profile,
                    ...action.payload.profile
                },
                project: {
                    ...state.project,
                    ...action.payload.project
                }
            };
        case 'CABINET.INVESTMENTS':
            return {
                ...state,
                page: {
                    type:   "CABINET",
                    title:  "Мои инвестиции",
                    class:  "tm-page-cabinet tm-page-cabinet-investments"
                },
                sidebar: {
                    active: true,
                    currentItem: 3
                },
                footer: false,
                profile: {
                    ...state.profile,
                    ...action.payload.profile
                }
            };
        case 'CABINET.DOCUMENTS':
            return {
                ...state,
                page: {
                    type:   "CABINET",
                    title:  "Документы",
                    class:  "tm-page-cabinet tm-page-cabinet-documents"
                },
                sidebar: {
                    active: true,
                    currentItem: 4
                },
                footer: false,
                profile: {
                    ...state.profile,
                    ...action.payload.profile
                }
            };
        case 'CABINET.SETTINGS':
            return {
                ...state,
                page: {
                    type:   "CABINET",
                    title:  "Настройки",
                    class:  "tm-page-cabinet tm-page-cabinet-settings"
                },
                sidebar: {
                    active: true,
                    currentItem: 3
                },
                footer: false,
                profile: {
                    ...state.profile,
                    mainData: {
                        ...state.profile.mainData,
                        ...action.payload.mainData
                    },
                    passportData: {
                        ...state.profile.passportData,
                        ...action.payload.passportData
                    },
                    entrepreneurData: {
                        ...state.profile.entrepreneurData,
                        ...action.payload.entrepreneurData
                    }
                }
            };
        default:
            return state
    }
}

export default reducers;