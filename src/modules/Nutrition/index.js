import React from 'react';
import { Link } from 'react-router-dom';
import store from "../../utils/store";
import { connect } from "react-redux";
import ScrollContainer from 'react-indiana-drag-scroll';

import UIkit from "uikit";

class Nutrition extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            seasons: [],
            season: {
                weeks: []
            },
            isLoaded: false,
            isLoadedRecipes: false,
            current: {
                step: 1,
                nutritionMealId: null,
                nutritionMenuId: null,
                menu: null,
                rules: null,
                products: null,
                seasonId: null,
                week: null,
                recipe: {}
            },
            nutrition: {
                meals: [],
                menus: [],
                recipes: []
            }
        };

        this.changeNutritionMenus = this.changeNutritionMenus.bind(this);
        this.changeNutritionMeals = this.changeNutritionMeals.bind(this);
        this.actionGetMeals = this.actionGetMeals.bind(this);
        this.actionGetMenuRecipes = this.actionGetMenuRecipes.bind(this);
        this.changeNutritionRecipeItem = this.changeNutritionRecipeItem.bind(this);

        this.backToMenu = this.backToMenu.bind(this);
        this.backToRecipes = this.backToRecipes.bind(this);
    }

    componentDidMount() {
        const accessToken = localStorage.getItem("accessToken");

        let modalTrainingDone = document.getElementById('tm-modal-workouts-training-done');
        let modalTrainingCircle = document.getElementById('tm-modal-workouts-training-circle');

        if (modalTrainingDone) {
            modalTrainingDone.parentNode.removeChild(modalTrainingDone);
        }

        if (modalTrainingCircle) {
            modalTrainingCircle.parentNode.removeChild(modalTrainingCircle);
        }

        store.dispatch({
            type: "CHANGE_PAGE",
            payload: {
                body: {
                    class: "tm-page-nutrition tm-page-nutrition-step-1"
                },
                header: {
                    navigation: true,
                    title: "Питание"
                }
            }
        });

        UIkit.offcanvas("#offcanvas-usage").hide();

        store.dispatch({
            type: "TOGGLE_CHAT",
            payload: {
                isOpen: false
            }
        });

        fetch( `https://api-academy.zubareva.online/api/profile/seasons`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : accessToken
            },
        })
        .then(res => res.json())
        .then(
            (result) => {
                if (result.list.length > 0) {
                    this.setState({
                        seasons: result.list,
                        season: result.list[0]
                    })
                }
            },(error) => {
                console.log(error)
            }
        );
    }

    componentWillMount() {
        this.actionGetMenus();
        this.actionGetMeals();

        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            this.props.history.push('/signin');
        }
    }

    actionGetMenus = () => {
        const accessToken = localStorage.getItem("accessToken");

        fetch( `https://api-academy.zubareva.online/api/recipes/menu?season_id=${this.state.current.seasonId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : accessToken
            },
        })
        .then(res => res.json())
        .then(
            (result) => {
                this.setState({
                    isLoaded: true,
                    nutrition: {
                        ...this.state.nutrition,
                        menus: result.list
                    }
                })
            },(error) => {
                console.log(error)
            }
        );
    };

    async changeNutritionMenus(nutritionMenuId) {
        await this.setState({
            current: {
                ...this.state.current,
                step: 2,
                nutritionMenuId: nutritionMenuId
            }
        });

        this.actionGetMenuRecipes();

        store.dispatch({
            type: "CHANGE_PAGE",
            payload: {
                body: {
                    class: "tm-page-nutrition tm-page-nutrition-step-2"
                },
                header: {
                    navigation: true,
                    title: "Питание"
                }
            }
        });
    };

    async changeNutritionMeals(nutritionMeallId) {
        await this.setState({
            isLoadedRecipes: false,
            current: {
                ...this.state.current,
                step: 2,
                nutritionMealId: nutritionMeallId
            }
        });

        await this.actionGetMenuRecipes();
    };

    changeNutritionRecipeItem = (recipe) => {
        this.setState({
            current: {
                ...this.state.current,
                step: 3,
                recipe: recipe
            }
        });
    };

    actionGetMeals = () => {
        const accessToken = localStorage.getItem("accessToken");

        fetch( `https://api-academy.zubareva.online/api/directory/recipetype`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : accessToken
            },
        })
        .then(res => res.json())
        .then(
            (result) => {
                this.setState({
                    current: {
                        ...this.state.current,
                        nutritionMealId: result.list[0].id
                    },
                    nutrition: {
                        ...this.state.nutrition,
                        meals: result.list
                    }
                })
            },(error) => {
                console.log(error)
            }
        );
    };

    async actionGetMenuRecipes() {
        const accessToken = localStorage.getItem("accessToken");
        const nutritionMenuId = this.state.current.nutritionMenuId;
        const nutritionMealId = this.state.current.nutritionMealId;

        await fetch( `https://api-academy.zubareva.online/api/recipes/list?menu=${nutritionMenuId}&type=${nutritionMealId}&week=${this.state.current.week}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : accessToken
            },
        })
        .then(res => res.json())
        .then(
            (result) => {
                this.setState({
                    isLoadedRecipes: true,
                    current: {
                        ...this.state.current,
                        menu: result.menu,
                        rules: result.rules,
                        products: result.products_list,
                    },
                    nutrition: {
                        ...this.state.nutrition,
                        recipes: result.list
                    }
                })
            },(error) => {
                console.log(error)
            }
        );
    };

    async changeSeason(e) {
        if (e.target.value > 0) {
            await this.setState({
                current: {
                    ...this.state.current,
                    seasonId: parseInt(e.target.value)
                },
                season: this.state.seasons.filter((seasonItem) => seasonItem.id === parseInt(e.target.value))[0]
            });

            await this.actionGetMenus();

            if (this.state.current.step === 2) {
                await this.actionGetMenuRecipes();
            }
        }
        else{
            await this.setState({
                current: {
                    ...this.state.current,
                    seasonId: null,
                    week: null
                },
                season: this.state.seasons[0]
            });
        }
    };

    async changeWeek(e) {
        if (e.target.value > 0) {
            await this.setState({
                current: {
                    ...this.state.current,
                    week: parseInt(e.target.value)
                }
            });

            if (this.state.current.step === 2) {
                await this.actionGetMenuRecipes();
            }
        }
        else{
            await this.setState({
                current: {
                    ...this.state.current,
                    seasonId: null,
                    week: null
                },
                season: this.state.seasons[0]
            });
        }
    };

    backToMenu = () => {
        this.setState({
            isLoadedRecipes: false,
            current: {
                ...this.state.current,
                step: 1,
                nutritionMenuId: null
            }
        });

        store.dispatch({
            type: "CHANGE_PAGE",
            payload: {
                body: {
                    class: "tm-page-nutrition tm-page-nutrition-step-1"
                },
                header: {
                    navigation: true,
                    title: "Питание"
                }
            }
        });
    };

    backToRecipes = () => {
        this.setState({
            current: {
                ...this.state.current,
                step: 2
            }
        });

        store.dispatch({
            type: "CHANGE_PAGE",
            payload: {
                body: {
                    class: "tm-page-nutrition tm-page-nutrition-step-2"
                },
                header: {
                    navigation: true,
                    title: "Питание"
                }
            }
        });
    };

    render() {
        const {isLoaded, seasons, season, isLoadedRecipes, current, nutrition } = this.state;

        return (
            <>
                {
                    <>
                        <div className="uk-container uk-container-large uk-section">
                            {
                                (seasons.length > 0) && (
                                    <>
                                        <div className="uk-visible@m tm-nutrition-header-buttons">
                                            <div className="tm-button-change-course" data-uk-toggle="target: #tm-modal-change-course">
                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M14.8812 12.6313H10.1031C9.82186 11.7375 8.98436 11.0875 7.99999 11.0875C7.01561 11.0875 6.17811 11.7375 5.89686 12.6313H1.11874C0.753113 12.6313 0.456238 12.9281 0.456238 13.2938C0.456238 13.6594 0.753113 13.9563 1.11874 13.9563H5.89686C6.17811 14.85 7.01561 15.5 7.99999 15.5C8.98436 15.5 9.82186 14.85 10.1031 13.9563H14.8812C15.2469 13.9563 15.5437 13.6594 15.5437 13.2938C15.5437 12.9281 15.2469 12.6313 14.8812 12.6313ZM7.99999 14.175C7.51249 14.175 7.11874 13.7781 7.11874 13.2938C7.11874 12.8063 7.51561 12.4125 7.99999 12.4125C8.48436 12.4125 8.88124 12.8094 8.88124 13.2938C8.88124 13.7813 8.48749 14.175 7.99999 14.175Z" fill="#FFA53A"/>
                                                    <path d="M14.8812 2.04375H13.6312C13.35 1.15 12.5125 0.5 11.5281 0.5C10.5437 0.5 9.70624 1.15 9.42499 2.04375H1.11874C0.753113 2.04375 0.456238 2.34062 0.456238 2.70625C0.456238 3.07187 0.753113 3.36875 1.11874 3.36875H9.42499C9.70624 4.2625 10.5437 4.9125 11.5281 4.9125C12.5125 4.9125 13.35 4.2625 13.6312 3.36875H14.8812C15.2469 3.36875 15.5437 3.07187 15.5437 2.70625C15.5437 2.34062 15.2469 2.04375 14.8812 2.04375ZM11.5281 3.5875C11.0406 3.5875 10.6469 3.19062 10.6469 2.70625C10.6469 2.22187 11.0437 1.825 11.5281 1.825C12.0156 1.825 12.4094 2.22187 12.4094 2.70625C12.4094 3.19062 12.0156 3.5875 11.5281 3.5875Z" fill="#FFA53A"/>
                                                    <path d="M14.8812 7.33751H4.76561C4.48436 6.44376 3.64686 5.79376 2.66249 5.79376C1.44686 5.79376 0.456238 6.78439 0.456238 8.00001C0.456238 9.21564 1.44686 10.2063 2.66249 10.2063C3.64686 10.2063 4.48436 9.55626 4.76561 8.66251H14.8812C15.2469 8.66251 15.5437 8.36564 15.5437 8.00001C15.5437 7.63439 15.2469 7.33751 14.8812 7.33751ZM2.66249 8.88126C2.17499 8.88126 1.78124 8.48439 1.78124 8.00001C1.78124 7.51564 2.17811 7.11876 2.66249 7.11876C3.14686 7.11876 3.54374 7.51564 3.54374 8.00001C3.54374 8.48751 3.14686 8.88126 2.66249 8.88126Z" fill="#FFA53A"/>
                                                </svg>
                                                <span>Выбрать курс</span>
                                            </div>
                                        </div>
                                        <div className="uk-hidden@m uk-flex uk-flex-middle">
                                            <h2 className="uk-h2 uk-margin-remove" style={{fontWeight: 700}}>Питание</h2>
                                            <div className="uk-margin-left">
                                                <div className="tm-button-change-course" data-uk-toggle="target: #tm-modal-change-course">
                                                   <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M14.8812 12.6313H10.1031C9.82186 11.7375 8.98436 11.0875 7.99999 11.0875C7.01561 11.0875 6.17811 11.7375 5.89686 12.6313H1.11874C0.753113 12.6313 0.456238 12.9281 0.456238 13.2938C0.456238 13.6594 0.753113 13.9563 1.11874 13.9563H5.89686C6.17811 14.85 7.01561 15.5 7.99999 15.5C8.98436 15.5 9.82186 14.85 10.1031 13.9563H14.8812C15.2469 13.9563 15.5437 13.6594 15.5437 13.2938C15.5437 12.9281 15.2469 12.6313 14.8812 12.6313ZM7.99999 14.175C7.51249 14.175 7.11874 13.7781 7.11874 13.2938C7.11874 12.8063 7.51561 12.4125 7.99999 12.4125C8.48436 12.4125 8.88124 12.8094 8.88124 13.2938C8.88124 13.7813 8.48749 14.175 7.99999 14.175Z" fill="#FFA53A"/>
                                                        <path d="M14.8812 2.04375H13.6312C13.35 1.15 12.5125 0.5 11.5281 0.5C10.5437 0.5 9.70624 1.15 9.42499 2.04375H1.11874C0.753113 2.04375 0.456238 2.34062 0.456238 2.70625C0.456238 3.07187 0.753113 3.36875 1.11874 3.36875H9.42499C9.70624 4.2625 10.5437 4.9125 11.5281 4.9125C12.5125 4.9125 13.35 4.2625 13.6312 3.36875H14.8812C15.2469 3.36875 15.5437 3.07187 15.5437 2.70625C15.5437 2.34062 15.2469 2.04375 14.8812 2.04375ZM11.5281 3.5875C11.0406 3.5875 10.6469 3.19062 10.6469 2.70625C10.6469 2.22187 11.0437 1.825 11.5281 1.825C12.0156 1.825 12.4094 2.22187 12.4094 2.70625C12.4094 3.19062 12.0156 3.5875 11.5281 3.5875Z" fill="#FFA53A"/>
                                                        <path d="M14.8812 7.33751H4.76561C4.48436 6.44376 3.64686 5.79376 2.66249 5.79376C1.44686 5.79376 0.456238 6.78439 0.456238 8.00001C0.456238 9.21564 1.44686 10.2063 2.66249 10.2063C3.64686 10.2063 4.48436 9.55626 4.76561 8.66251H14.8812C15.2469 8.66251 15.5437 8.36564 15.5437 8.00001C15.5437 7.63439 15.2469 7.33751 14.8812 7.33751ZM2.66249 8.88126C2.17499 8.88126 1.78124 8.48439 1.78124 8.00001C1.78124 7.51564 2.17811 7.11876 2.66249 7.11876C3.14686 7.11876 3.54374 7.51564 3.54374 8.00001C3.54374 8.48751 3.14686 8.88126 2.66249 8.88126Z" fill="#FFA53A"/>
                                                    </svg>
                                                    <span>Выбрать курс</span>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )
                            }
                            {
                                (this.props.seasonState.id === 0 && this.props.seasonState.has === 1 && nutrition.menus.length === 0) && (
                                    <div className="tm-wrapper-plug">
                                        <h3 className="uk-3">Ожидайте начала сезона</h3>
                                        <div>{this.props.seasonState.date}</div>
                                    </div>
                                )
                            }
                            {
                                (this.props.seasonState.id === 0 && this.props.seasonState.has === 0 && nutrition.menus.length === 0) && (
                                    <div className="tm-wrapper-plug">
                                        <h3 className="uk-3">Мы не обнаружили у вас сезона</h3>
                                        <a href="https://off-slender.zubareva.online" target="_blank" className="uk-button uk-button-primary" rel="noreferrer">Купить</a>
                                        <a href="https://wa.me/79182611437?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5%2C%20%D1%83%20%D0%BC%D0%B5%D0%BD%D1%8F%20%D0%B2%D0%BE%D0%BF%D1%80%D0%BE%D1%81%20%D0%BF%D0%BE%20%D0%BC%D0%B0%D1%80%D0%B0%D1%84%D0%BE%D0%BD%D1%83%2C%20" target="_blank" className="uk-button uk-button-default uk-margin-left" rel="noreferrer">Техническая поддержка</a>
                                    </div>
                                )
                            }
                            {
                                (isLoaded) ? (
                                    <>
                                        {
                                            (current.step === 1) && (
                                                nutrition.menus.length > 0 && (
                                                    <>

                                                        <h3 className="uk-h3 uk-text-bolder uk-margin-medium-bottom uk-margin-remove-top uk-visible@m">Выберите тип меню</h3>
                                                        <h4 className="uk-h4 uk-text-bolder uk-margin-medium-bottom uk-margin-remove-top uk-hidden@m">Выберите тип меню</h4>
                                                        <div className="tm-nutrition-list-menu">
                                                            <div className="uk-child-width-1-2 uk-child-width-1-4@s" data-uk-grid>
                                                                {
                                                                    nutrition.menus.map((menuItem, key) => (
                                                                        <div key={key}>
                                                                            <div className="tm-nutrition-list-menu-item" onClick={() => this.changeNutritionMenus(menuItem.id)}>
                                                                                <img src={menuItem.picture} alt="" />
                                                                                <div className="uk-text-center uk-margin-top">
                                                                                    <div className="tm-name">
                                                                                        {menuItem.name}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                                }
                                                            </div>
                                                        </div>
                                                    </>
                                                )
                                            )
                                        }
                                        {
                                            (current.step === 2 || current.step === 3) && (
                                                <div className="uk-width-3-5@s">
                                                    <div className="uk-margin-medium-bottom">
                                                        <div className="tm-nutrition-list-meals">
                                                            <ScrollContainer className="scroll-container">
                                                                <ul data-uk-tab style={{width: "500px"}}>
                                                                    {
                                                                        nutrition.meals.map((mealItem, key) => (
                                                                            <li key={key}><a href="#" onClick={() => this.changeNutritionMeals(mealItem.id)}>{mealItem.name}</a></li>
                                                                        ))
                                                                    }
                                                                </ul>
                                                            </ScrollContainer>
                                                        </div>
                                                        <div className="tm-nutrition-navigation">
                                                            <ScrollContainer className="scroll-container">
                                                                <div>
                                                                    <div className="tm-nutrition-navigation-item" onClick={current.step === 2 ? this.backToMenu : this.backToRecipes}>
                                                                        <svg width="22" height="13" viewBox="0 0 22 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                            <path d="M21.5 6.5H1.5" stroke="currentColor"/>
                                                                            <path d="M6 12L1 6.5L6 1" stroke="currentColor"/>
                                                                        </svg>
                                                                        <div>
                                                                            {
                                                                                current.step === 2 ? 'К выбору меню' : 'К списку рецептов'
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                    <div className="tm-nutrition-navigation-item" data-uk-toggle="target: #tm-modal-menu;">
                                                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                            <path d="M5.35112 11.3619C5.0919 11.3619 4.84735 11.3081 4.62236 11.1956C4.16261 10.9706 3.78601 10.5255 3.54146 9.90925C3.27735 9.24897 3.17953 8.46153 3.28224 7.80613C3.38984 7.10183 3.70286 6.61763 4.16261 6.43177C4.29467 6.37797 4.43651 6.35352 4.57835 6.35352C5.44894 6.35352 6.50539 7.31704 6.99449 8.54956C7.23903 9.16582 7.26838 9.74785 7.08741 10.2272C6.91134 10.6771 6.54941 11.0342 6.05542 11.2249C5.82554 11.3179 5.58589 11.3619 5.35112 11.3619ZM4.59302 7.19965C4.549 7.19965 4.50498 7.20944 4.47074 7.22411C4.07458 7.38062 3.92785 8.58869 4.32891 9.60112C4.4952 10.0169 4.72018 10.3054 4.98919 10.4375C5.10168 10.4913 5.22395 10.5206 5.35112 10.5206C5.47828 10.5206 5.61034 10.4913 5.7424 10.4424C6.01629 10.3348 6.20215 10.1587 6.29508 9.92882C6.40268 9.65003 6.37333 9.28321 6.20704 8.86748C5.84022 7.93819 5.02342 7.19965 4.59302 7.19965Z" fill="currentColor"/>
                                                                            <path d="M11.9925 20.7871C11.7724 20.7871 11.5768 20.5719 11.5768 20.3323V20.298L11.5572 20.2736C11.4154 20.0779 10.4078 19.7111 9.91385 19.7111H9.90895L0.567198 20.7529C0.552525 20.7529 0.537852 20.7578 0.518288 20.7578C0.415578 20.7578 0.312867 20.7186 0.234612 20.6502C0.146574 20.5719 0.0927734 20.4545 0.0927734 20.3372V4.68603C0.0927734 4.47083 0.254176 4.28986 0.469378 4.26541L9.85515 3.22363C9.86494 3.22363 9.87472 3.22363 9.88939 3.22363C10.354 3.22363 11.3469 3.46329 11.9338 3.89859L11.9925 3.94261L12.0512 3.89859C12.6528 3.44862 13.6701 3.22363 14.0761 3.22363L23.5254 4.25563C23.7406 4.28008 23.902 4.46105 23.902 4.67625V20.3274C23.902 20.4496 23.8482 20.5621 23.7602 20.6453C23.6819 20.7138 23.5792 20.7529 23.4765 20.7529C23.4618 20.7529 23.4472 20.7529 23.4276 20.748L14.032 19.7111H14.0272C13.6016 19.716 12.6283 20.0633 12.4376 20.3225L12.4229 20.3469V20.3763C12.4229 20.4007 12.4131 20.4252 12.4082 20.4448V20.4496V20.4545C12.3789 20.6551 12.2126 20.7871 11.9925 20.7871ZM0.943803 5.05775V19.8578L9.86005 18.8699C10.3394 18.8699 11.3518 19.1095 11.9387 19.5448L11.9974 19.5888L12.0561 19.5448C12.6577 19.0948 13.675 18.8699 14.081 18.8699L23.051 19.8578V5.05775L14.032 4.0551H14.0272C13.6016 4.05999 12.6283 4.40725 12.4376 4.67136L12.4229 4.69582V4.72516C12.4229 4.74962 12.4131 4.77407 12.4082 4.79364V4.79853V4.80342C12.3838 5.00395 12.2175 5.136 11.9974 5.136C11.7724 5.136 11.5817 4.9208 11.5817 4.68114V4.64691L11.5621 4.62245C11.4203 4.42681 10.4127 4.05999 9.91874 4.05999H9.91385L0.943803 5.05775Z" fill="currentColor"/>
                                                                            <path d="M11.9978 20.7521C11.763 20.7521 11.5723 20.5614 11.5723 20.3266V4.67551C11.5723 4.44075 11.763 4.25 11.9978 4.25C12.2325 4.25 12.4233 4.44075 12.4233 4.67551V20.3266C12.4233 20.5614 12.2325 20.7521 11.9978 20.7521Z" fill="currentColor"/>
                                                                            <path d="M21.3883 17.6219C21.3541 17.6219 21.3198 17.617 21.2856 17.6072C21.0704 17.5534 20.7378 17.4898 20.2781 17.4116C20.0482 17.3724 19.8917 17.1523 19.9308 16.9225C19.965 16.717 20.1362 16.5654 20.3416 16.5654C20.3661 16.5654 20.3906 16.5654 20.4199 16.5703C20.9041 16.6486 21.266 16.7219 21.5008 16.7806C21.6133 16.81 21.7013 16.8785 21.76 16.9763C21.8187 17.0741 21.8334 17.1866 21.8089 17.2942C21.7551 17.4898 21.584 17.6219 21.3883 17.6219Z" fill="currentColor"/>
                                                                            <path d="M18.2574 17.1136C18.233 17.1136 18.2183 17.1136 18.2036 17.1087C16.2375 16.8397 14.0659 16.5805 14.0219 16.5756H14.0316C13.9191 16.5609 13.8213 16.5071 13.748 16.4191C13.6746 16.3311 13.6452 16.2186 13.6599 16.1061C13.6844 15.8909 13.8653 15.7344 14.0805 15.7344C14.0952 15.7344 14.1148 15.7344 14.1295 15.7393C14.149 15.7442 16.3157 15.9985 18.3112 16.2724C18.5411 16.3066 18.7074 16.5169 18.6732 16.7517C18.6487 16.9571 18.4678 17.1136 18.2574 17.1136Z" fill="currentColor"/>
                                                                            <path d="M21.3883 14.492C21.3541 14.492 21.3198 14.4871 21.2856 14.4773C21.0704 14.4235 20.7378 14.3599 20.2732 14.2817C20.1607 14.2621 20.0629 14.2034 19.9993 14.1105C19.9357 14.0176 19.9064 13.9051 19.9259 13.7975C19.9602 13.5969 20.1362 13.4404 20.3416 13.4404C20.3661 13.4404 20.3906 13.4404 20.415 13.4453C20.8992 13.5285 21.2611 13.5969 21.491 13.6556C21.716 13.7143 21.8578 13.9442 21.7992 14.1692C21.7551 14.3599 21.5839 14.492 21.3883 14.492Z" fill="currentColor"/>
                                                                            <path d="M18.2581 13.9837C18.2337 13.9837 18.219 13.9837 18.2043 13.9789C16.3115 13.7196 14.0959 13.4506 14.0274 13.4457H14.0372C13.8073 13.4164 13.641 13.2061 13.6655 12.9762C13.6899 12.761 13.8709 12.6045 14.0861 12.6045C14.1008 12.6045 14.1203 12.6045 14.135 12.6094C14.1546 12.6143 16.3213 12.8686 18.3168 13.1425C18.5467 13.1767 18.713 13.387 18.6787 13.6218C18.6494 13.8223 18.4684 13.9837 18.2581 13.9837Z" fill="currentColor"/>
                                                                            <path d="M21.3883 11.3621C21.3541 11.3621 21.3198 11.3572 21.2856 11.3474C21.0704 11.2936 20.7427 11.2301 20.2732 11.1518C20.0433 11.1127 19.8868 10.8926 19.9259 10.6627C19.9602 10.4573 20.1313 10.3057 20.3368 10.3057C20.3612 10.3057 20.3857 10.3057 20.4101 10.3106C20.8748 10.3888 21.2465 10.4573 21.4861 10.5209C21.7111 10.5796 21.8529 10.8094 21.7943 11.0344C21.7551 11.2301 21.5839 11.3621 21.3883 11.3621Z" fill="currentColor"/>
                                                                            <path d="M18.2581 10.8529C18.2336 10.8529 18.219 10.8529 18.2043 10.848C16.3115 10.5888 14.0959 10.3198 14.0274 10.3149H14.0372C13.9247 10.3002 13.8269 10.2464 13.7535 10.1584C13.685 10.0703 13.6508 9.95785 13.6655 9.84535C13.6899 9.63015 13.8709 9.46875 14.0812 9.46875C14.1008 9.46875 14.1154 9.46875 14.135 9.47364C14.1595 9.47853 16.3213 9.73286 18.3168 10.0068C18.5467 10.041 18.7129 10.2513 18.6787 10.4861C18.6494 10.6915 18.4684 10.8529 18.2581 10.8529Z" fill="currentColor"/>
                                                                            <path d="M21.3883 8.23125C21.3541 8.23125 21.3198 8.22636 21.2856 8.21658C21.0704 8.16278 20.7427 8.0992 20.2732 8.02094C20.0433 7.98181 19.8868 7.76172 19.9259 7.53185C19.9602 7.32642 20.1313 7.1748 20.3368 7.1748C20.3612 7.1748 20.3857 7.1748 20.4101 7.1797C20.8748 7.25795 21.2465 7.32643 21.491 7.39001C21.716 7.4487 21.8578 7.67858 21.7991 7.90356C21.7551 8.0992 21.5839 8.23125 21.3883 8.23125Z" fill="currentColor"/>
                                                                            <path d="M18.2581 7.72301C18.2336 7.72301 18.219 7.72301 18.2043 7.71812C16.3115 7.4589 14.0959 7.1899 14.0274 7.185H14.0372C13.9247 7.17033 13.8269 7.11653 13.7535 7.02849C13.685 6.94046 13.6508 6.82796 13.6655 6.71547C13.6899 6.50027 13.8709 6.33887 14.0812 6.33887C14.1008 6.33887 14.1154 6.33887 14.135 6.34376C14.1595 6.34865 16.3213 6.60298 18.3168 6.87687C18.5467 6.91111 18.7129 7.12142 18.6787 7.35619C18.6494 7.56161 18.4684 7.72301 18.2581 7.72301Z" fill="currentColor"/>
                                                                            <path d="M8.34875 17.104C8.17757 17.104 8.02595 17.0012 7.95747 16.8447L5.5071 10.9951C5.41906 10.7799 5.52177 10.5305 5.73697 10.4376C5.79077 10.418 5.84457 10.4033 5.89838 10.4033C6.06956 10.4033 6.22118 10.506 6.28965 10.6625L8.74003 16.5121C8.82807 16.7273 8.72536 16.9768 8.51015 17.0697C8.46124 17.0893 8.40255 17.104 8.34875 17.104Z" fill="currentColor"/>
                                                                        </svg>
                                                                        <div>Меню на неделю</div>
                                                                    </div>
                                                                    <div className="tm-nutrition-navigation-item" data-uk-toggle="target: #tm-modal-rules;">
                                                                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                            <path d="M17.875 1.83335H15.499C15.3093 1.30075 14.8051 0.916695 14.2083 0.916695H12.5822C12.2586 0.3575 11.6582 0 11 0C10.3418 0 9.7414 0.3575 9.41785 0.916652H7.7917C7.19495 0.916652 6.69079 1.30075 6.50104 1.8333H4.125C3.3669 1.8333 2.75 2.45021 2.75 3.2083V20.625C2.75 21.3831 3.3669 22 4.125 22H17.875C18.6331 22 19.25 21.3831 19.25 20.625V3.20835C19.25 2.45025 18.6331 1.83335 17.875 1.83335ZM7.33335 2.29165C7.33335 2.03865 7.5387 1.8333 7.7917 1.8333H9.70935C9.90275 1.8333 10.076 1.71046 10.1411 1.52805C10.2713 1.1623 10.6168 0.916652 11 0.916652C11.3832 0.916652 11.7288 1.1623 11.8589 1.52805C11.924 1.7114 12.0972 1.8333 12.2907 1.8333H14.2083C14.4613 1.8333 14.6667 2.03865 14.6667 2.29165V2.75H7.33335V2.29165ZM18.3333 20.625C18.3333 20.878 18.128 21.0833 17.875 21.0833H4.125C3.872 21.0833 3.66665 20.878 3.66665 20.625V3.20835C3.66665 2.95535 3.872 2.75 4.125 2.75H6.41665V3.20835C6.41665 3.46135 6.622 3.6667 6.875 3.6667H15.125C15.378 3.6667 15.5833 3.46135 15.5833 3.20835V2.75H17.875C18.128 2.75 18.3333 2.95535 18.3333 3.20835V20.625Z" fill="currentColor"/>
                                                                            <path d="M16.9583 10.083H8.70835C8.45535 10.083 8.25 10.2884 8.25 10.5414C8.25 10.7944 8.45535 10.9997 8.70835 10.9997H16.9583C17.2113 10.9997 17.4167 10.7943 17.4167 10.5413C17.4167 10.2883 17.2113 10.083 16.9583 10.083Z" fill="currentColor"/>
                                                                            <path d="M16.9583 6.41699H8.70835C8.45535 6.41699 8.25 6.62234 8.25 6.87534C8.25 7.12834 8.45535 7.33369 8.70835 7.33369H16.9583C17.2113 7.33369 17.4167 7.12834 17.4167 6.87534C17.4167 6.62234 17.2113 6.41699 16.9583 6.41699Z" fill="currentColor"/>
                                                                            <path d="M16.9583 13.75H8.70835C8.45535 13.75 8.25 13.9553 8.25 14.2083C8.25 14.4613 8.45535 14.6667 8.70835 14.6667H16.9583C17.2113 14.6667 17.4167 14.4613 17.4167 14.2083C17.4167 13.9553 17.2113 13.75 16.9583 13.75Z" fill="currentColor"/>
                                                                            <path d="M12.375 17.417H8.70835C8.45535 17.417 8.25 17.6223 8.25 17.8753C8.25 18.1283 8.45535 18.3337 8.70835 18.3337H12.375C12.628 18.3337 12.8333 18.1283 12.8333 17.8753C12.8333 17.6223 12.628 17.417 12.375 17.417Z" fill="currentColor"/>
                                                                            <path d="M5.95801 16.5C5.19991 16.5 4.58301 17.1169 4.58301 17.875C4.58301 18.6331 5.19991 19.25 5.95801 19.25C6.7161 19.25 7.33301 18.6331 7.33301 17.875C7.33301 17.1169 6.71606 16.5 5.95801 16.5ZM5.95801 18.3333C5.70501 18.3333 5.49966 18.128 5.49966 17.875C5.49966 17.622 5.70501 17.4167 5.95801 17.4167C6.21101 17.4167 6.41635 17.622 6.41635 17.875C6.41631 18.128 6.21101 18.3333 5.95801 18.3333Z" fill="currentColor"/>
                                                                            <path d="M5.95801 12.833C5.19991 12.833 4.58301 13.4499 4.58301 14.208C4.58301 14.9661 5.19991 15.583 5.95801 15.583C6.7161 15.583 7.33301 14.9661 7.33301 14.208C7.33301 13.4499 6.71606 12.833 5.95801 12.833ZM5.95801 14.6663C5.70501 14.6663 5.49966 14.461 5.49966 14.208C5.49966 13.955 5.70501 13.7497 5.95801 13.7497C6.21101 13.7497 6.41635 13.955 6.41635 14.208C6.41635 14.461 6.21101 14.6663 5.95801 14.6663Z" fill="currentColor"/>
                                                                            <path d="M5.95801 9.16699C5.19991 9.16699 4.58301 9.78389 4.58301 10.542C4.58301 11.3001 5.19991 11.917 5.95801 11.917C6.7161 11.917 7.33301 11.3001 7.33301 10.542C7.33301 9.78394 6.71606 9.16699 5.95801 9.16699ZM5.95801 11.0003C5.70501 11.0003 5.49966 10.795 5.49966 10.542C5.49966 10.289 5.70501 10.0836 5.95801 10.0836C6.21101 10.0836 6.41635 10.289 6.41635 10.542C6.41635 10.795 6.21101 11.0003 5.95801 11.0003Z" fill="currentColor"/>
                                                                            <path d="M5.95801 5.5C5.19991 5.5 4.58301 6.1169 4.58301 6.875C4.58301 7.6331 5.19991 8.25 5.95801 8.25C6.7161 8.25 7.33301 7.6331 7.33301 6.875C7.33301 6.1169 6.71606 5.5 5.95801 5.5ZM5.95801 7.33335C5.70501 7.33335 5.49966 7.128 5.49966 6.875C5.49966 6.622 5.70501 6.41665 5.95801 6.41665C6.21101 6.41665 6.41635 6.622 6.41635 6.875C6.41635 7.128 6.21101 7.33335 5.95801 7.33335Z" fill="currentColor"/>
                                                                        </svg>
                                                                        <div>Правила питания</div>
                                                                    </div>
                                                                    <div className="tm-nutrition-navigation-item" data-uk-toggle="target: #tm-modal-products;">
                                                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                            <path d="M9.27932 9.32146C9.07715 9.10016 8.78929 8.97055 8.48962 8.96591C7.88685 8.95818 7.3882 9.43874 7.37798 10.041C7.3747 10.2352 7.52943 10.3952 7.72354 10.3985C7.7256 10.3985 7.72757 10.3985 7.72964 10.3985C7.92103 10.3985 8.07777 10.245 8.08101 10.0529C8.08462 9.83778 8.26143 9.66519 8.4786 9.66894C8.58702 9.67063 8.68701 9.71563 8.76018 9.79569C8.89115 9.93908 9.11357 9.94911 9.25686 9.81814C9.40021 9.68722 9.41028 9.4648 9.27932 9.32146Z" fill="currentColor"/>
                                                                            <path d="M11.1495 10.4681C11.0418 10.2148 10.832 10.0148 10.5739 9.91954C10.0548 9.72806 9.4761 9.99417 9.28377 10.5127C9.21622 10.6947 9.30908 10.897 9.4911 10.9646C9.53141 10.9795 9.5727 10.9866 9.6133 10.9866C9.75613 10.9866 9.89038 10.8989 9.94297 10.7572C10.0007 10.6015 10.1748 10.5218 10.3304 10.5792C10.4086 10.6081 10.4697 10.6664 10.5024 10.7432C10.5784 10.9219 10.7849 11.0052 10.9635 10.9292C11.1423 10.8532 11.2255 10.6468 11.1495 10.4681Z" fill="currentColor"/>
                                                                            <path d="M13.4157 7.35371C13.2782 7.21651 13.0556 7.21679 12.9185 7.35422L12.5871 7.68628C12.4499 7.82372 12.4502 8.04633 12.5876 8.18344C12.6562 8.25192 12.746 8.28614 12.8359 8.28614C12.926 8.28614 13.0161 8.25173 13.0848 8.18292L13.4162 7.85086C13.5533 7.71343 13.5531 7.49082 13.4157 7.35371Z" fill="currentColor"/>
                                                                            <path d="M11.2283 11.8926H10.7598C10.5656 11.8926 10.4082 12.05 10.4082 12.2441C10.4082 12.4383 10.5656 12.5957 10.7598 12.5957H11.2283C11.4225 12.5957 11.5799 12.4383 11.5799 12.2441C11.5799 12.05 11.4225 11.8926 11.2283 11.8926Z" fill="currentColor"/>
                                                                            <path d="M14.8211 11.8926H14.3525C14.1583 11.8926 14.001 12.05 14.001 12.2441C14.001 12.4383 14.1584 12.5957 14.3525 12.5957H14.8211C15.0153 12.5957 15.1727 12.4383 15.1727 12.2441C15.1727 12.05 15.0153 11.8926 14.8211 11.8926Z" fill="currentColor"/>
                                                                            <path d="M23.9887 18.232L23.8972 17.7378C23.8388 17.4221 23.5631 17.1929 23.2416 17.1929C23.2012 17.1929 23.1605 17.1966 23.1205 17.204L21.2567 17.5464L22.1008 16.9821C22.322 16.8343 22.4338 16.5698 22.3855 16.3075C22.3721 16.2356 22.347 16.1666 22.3106 16.1021L22.0552 15.6498C21.9677 15.4944 21.8184 15.379 21.6462 15.3332C21.5618 15.3107 21.4736 15.3057 21.3875 15.3169C21.4815 14.7982 21.53 14.2684 21.53 13.7291C21.53 13.4898 21.3861 13.2839 21.1805 13.1924C21.4491 12.5536 21.4674 11.8223 21.2019 11.1525C21.1804 11.0981 21.1485 11.0495 21.1071 11.008C21.066 10.967 21.018 10.9352 20.9634 10.9133C20.6453 10.7866 20.3109 10.7224 19.9697 10.7224C19.926 10.7224 19.8826 10.7235 19.8392 10.7256C19.7905 9.74438 18.9784 8.96105 17.987 8.96105C17.8565 8.96105 17.7292 8.97493 17.6062 9.0008C17.6916 8.48987 17.6413 7.95536 17.4424 7.45351C17.421 7.39834 17.3889 7.34884 17.3452 7.3045C17.3032 7.2625 17.254 7.23011 17.1993 7.20841C16.8566 7.07191 16.4964 7.00272 16.1287 7.00272C15.5749 7.00272 15.045 7.15844 14.5876 7.44794C14.4205 6.96386 14.1449 6.50941 13.7599 6.12349C13.6471 6.01052 13.4971 5.94827 13.3375 5.94827C13.1779 5.94827 13.0279 6.01052 12.915 6.12358L11.2128 7.82964C10.8978 7.54867 10.4833 7.38072 10.0334 7.38072C9.93132 7.38072 9.82824 7.38967 9.72704 7.4073C9.36034 7.47114 9.02288 7.65062 8.76418 7.9135C8.43245 7.75342 8.05243 7.69881 7.68723 7.76237C7.60689 7.77634 7.52894 7.79603 7.45328 7.82003V6.50538C7.45328 5.60004 6.72564 4.86218 5.82555 4.84662V4.10103C6.10108 4.05336 6.31146 3.81322 6.31146 3.52428V1.83496C6.31146 1.5119 6.04863 1.24902 5.72552 1.24902H2.86658C2.54347 1.24902 2.28065 1.5119 2.28065 1.83496V3.52428C2.28065 3.81322 2.49102 4.05336 2.76655 4.10103V4.84652C1.86646 4.86204 1.13887 5.5999 1.13887 6.50528V16.766C0.436967 17.3999 0 18.2844 0 19.2624C0 21.1865 1.68866 22.7518 3.76437 22.7518L17.8356 22.7477C18.3159 22.7475 18.7675 22.5364 19.0748 22.1686C19.374 21.8106 19.5012 21.3456 19.4279 20.8869L22.2384 21.392C22.2773 21.399 22.3171 21.4026 22.3567 21.4026C22.4968 21.4026 22.6311 21.3595 22.7448 21.2783C22.891 21.1738 22.99 21.0121 23.0164 20.8348L23.0925 20.324C23.1035 20.2509 23.1022 20.1772 23.0889 20.1049C23.0405 19.8437 22.8416 19.6365 22.5822 19.5771L21.5916 19.3498L23.4535 19.0078C23.6291 18.9755 23.7814 18.877 23.8825 18.7302C23.9834 18.5838 24.021 18.4069 23.9887 18.232ZM19.9697 11.4255C20.1813 11.4255 20.3894 11.459 20.5894 11.525C20.7682 12.0694 20.7013 12.6566 20.4213 13.1417H19.4743L19.7765 12.8388C19.9136 12.7013 19.9134 12.4787 19.7759 12.3416C19.6384 12.2044 19.4158 12.2046 19.2787 12.3421L19.1188 12.5024C19.0439 12.2556 18.913 12.0346 18.741 11.8534C19.0899 11.5763 19.5182 11.4255 19.9697 11.4255ZM17.987 9.66408C18.622 9.66408 19.1385 10.1821 19.1385 10.8189C19.1385 10.8308 19.1379 10.8424 19.1376 10.8541C18.767 10.9747 18.4254 11.176 18.1341 11.4494C18.0877 11.4318 18.0407 11.4155 17.9924 11.4022C17.8896 10.8466 17.5152 10.4013 17.0206 10.1933C17.2259 9.8753 17.582 9.66408 17.987 9.66408ZM16.1287 7.70575C16.3675 7.70575 16.6021 7.74437 16.8282 7.82078C17.01 8.36115 16.9729 8.9416 16.7413 9.44438C16.5509 9.61777 16.3965 9.83011 16.2909 10.0688C16.2282 10.0725 16.1654 10.0794 16.1034 10.0902C15.8279 10.1381 15.571 10.2577 15.356 10.431C15.2827 10.2969 15.193 10.1732 15.0901 10.0619L15.8963 9.25383C16.0335 9.1164 16.0332 8.89379 15.8957 8.75668C15.7583 8.61952 15.5357 8.61976 15.3985 8.75724L14.5174 9.64041C14.3497 9.56115 14.1685 9.50602 13.978 9.48024C14.0603 9.06071 14.2639 8.66541 14.5788 8.34976C14.9931 7.93445 15.5435 7.70575 16.1287 7.70575ZM13.4348 13.1417H13.1301C13.0787 13.0111 12.9518 12.9185 12.803 12.9185C12.6542 12.9185 12.5273 13.0111 12.476 13.1417H12.1175C12.2007 13.0061 12.1839 12.8265 12.0664 12.7092C11.9289 12.5721 11.7063 12.5723 11.5692 12.7097L11.2378 13.0418C11.208 13.0716 11.1852 13.1056 11.1683 13.1417H10.4528C10.1848 12.7304 10.0213 12.2451 10.0019 11.7229H15.5794C15.56 12.2451 15.3965 12.7304 15.1285 13.1417H14.3839C14.3671 13.1056 14.3441 13.0716 14.3144 13.0417L13.9831 12.7097C13.8459 12.5723 13.6234 12.5719 13.4859 12.7091C13.3683 12.8264 13.3515 13.0061 13.4348 13.1417ZM12.6172 11.0197C12.7497 10.5286 13.1976 10.1663 13.7286 10.1663C14.2595 10.1663 14.7075 10.5287 14.84 11.0197H12.6172ZM13.3361 6.69691C13.6705 7.05831 13.8916 7.4874 14 7.93843C13.8205 8.13348 13.6714 8.34901 13.5538 8.57837C13.5004 8.54565 13.4378 8.52648 13.3707 8.52648H12.9022C12.708 8.52648 12.5506 8.68388 12.5506 8.87804C12.5506 9.07219 12.708 9.2296 12.9022 9.2296H13.3131C13.29 9.32668 13.2721 9.42493 13.2591 9.52393C13.1195 9.56058 12.9861 9.6128 12.8614 9.67927C12.627 9.27488 12.239 8.97352 11.7793 8.85263C11.7791 8.85165 11.7789 8.85066 11.7787 8.84968C11.7512 8.69059 11.7031 8.53965 11.6375 8.39935L13.3361 6.69691ZM6.98088 9.86921C6.96025 9.81155 6.94464 9.75239 6.93438 9.69305C6.83355 9.11176 7.22542 8.55638 7.80775 8.45499C7.86915 8.44431 7.93155 8.43887 7.99314 8.43887C8.22475 8.43887 8.44609 8.51274 8.63317 8.65248C8.71056 8.71032 8.80843 8.73371 8.90368 8.71721C8.99893 8.70066 9.08317 8.64568 9.1366 8.5651C9.30165 8.31615 9.55416 8.15096 9.8476 8.09987C9.90915 8.08914 9.97168 8.08375 10.0334 8.08375C10.5543 8.08375 10.997 8.4564 11.0859 8.96991C11.0962 9.02874 11.1014 9.09005 11.1015 9.15216C11.1018 9.33413 11.241 9.48582 11.4223 9.50175C11.8154 9.5363 12.15 9.78366 12.3051 10.1321C12.0974 10.3814 11.9535 10.6857 11.8988 11.0197H9.89387C9.64459 11.0197 9.4307 11.1736 9.34149 11.3914C8.9004 11.091 8.38056 10.9291 7.83578 10.9291C7.49448 10.9291 7.16013 10.9934 6.84175 11.1202C6.78775 11.1417 6.73947 11.1735 6.69832 11.2147C6.6566 11.2564 6.62458 11.3053 6.60358 11.3589C6.52268 11.563 6.46872 11.7727 6.43957 11.9838C6.31357 11.8404 6.22479 11.662 6.1901 11.4619C6.10741 10.9849 6.35711 10.5099 6.79713 10.3069C6.9625 10.2306 7.04224 10.0406 6.98088 9.86921ZM8.0289 13.0455L8.12481 13.1417H7.28045C7.09089 12.7019 7.06211 12.2013 7.216 11.7318C7.41634 11.6657 7.62433 11.6322 7.83578 11.6322C8.36551 11.6322 8.86384 11.8393 9.23888 12.2151C9.28876 12.2652 9.33521 12.3176 9.37885 12.3717C9.43843 12.6414 9.52998 12.8991 9.64791 13.1416H9.11809L8.52667 12.5489C8.38947 12.4115 8.16686 12.4111 8.02951 12.5483C7.89203 12.6855 7.89175 12.9081 8.0289 13.0455ZM6.53172 13.1417H5.27843C5.33431 12.8011 5.53915 12.5108 5.82349 12.3397C5.99182 12.5652 6.21152 12.7475 6.46464 12.871C6.48255 12.9622 6.50454 13.0527 6.53172 13.1417ZM2.98377 1.95215H5.60834V3.40709H2.98377V1.95215ZM5.12243 4.11021V4.84582H3.46972V4.11021H5.12243ZM1.84204 7.93103H4.12498C4.31919 7.93103 4.47654 7.77362 4.47654 7.57947C4.47654 7.38531 4.31919 7.2279 4.12498 7.2279H1.84204V6.50528C1.84204 5.97794 2.26973 5.54894 2.79543 5.54894H5.79673C6.32247 5.54894 6.75016 5.97794 6.75016 6.50528V7.2279H6.09372C5.89952 7.2279 5.74216 7.38531 5.74216 7.57947C5.74216 7.77362 5.89952 7.93103 6.09372 7.93103H6.75016V8.24307C6.34736 8.63799 6.13816 9.21713 6.24147 9.81286C6.24166 9.81403 6.2419 9.81525 6.24208 9.81647C5.67809 10.2034 5.37757 10.8914 5.49724 11.582C5.50423 11.6223 5.51299 11.6619 5.52256 11.7012C5.34692 11.798 5.18918 11.9231 5.05399 12.0694H1.84204V7.93103ZM1.84199 12.7725H4.64576C4.60845 12.891 4.58211 13.0143 4.56926 13.1417H4.51001C4.18644 13.1417 3.92314 13.4052 3.92314 13.729C3.92314 14.2873 3.97503 14.8353 4.07558 15.3714C3.97456 15.3633 3.87097 15.3589 3.76559 15.3589C3.34044 15.3589 2.93535 15.4264 2.62508 15.5489C2.15048 15.7363 2.01927 16.0024 1.99063 16.1866C1.94034 16.2116 1.89093 16.238 1.84199 16.2651V12.7725ZM6.29374 17.0913C6.42035 17.1926 6.49774 17.2787 6.5426 17.3408C6.53838 17.3409 6.53397 17.3409 6.52952 17.3409C6.33054 17.3409 5.97302 17.2607 5.56648 17.0357C5.41512 16.9518 5.27567 16.8571 5.16317 16.7618C5.03201 16.6506 4.83968 16.6507 4.70862 16.7618C4.59612 16.8572 4.45672 16.9519 4.3055 17.0356C3.89886 17.2607 3.54134 17.3409 3.34241 17.3409C3.33786 17.3409 3.3335 17.3409 3.32924 17.3408C3.37405 17.2787 3.45144 17.1926 3.57809 17.0912C3.68877 17.0026 3.73541 16.8562 3.69636 16.7199C3.65727 16.5836 3.54017 16.4841 3.39931 16.4676C3.05624 16.4274 2.8393 16.34 2.73772 16.2765C2.86499 16.1972 3.18674 16.0621 3.76573 16.0621C4.24526 16.0621 4.59575 16.1629 4.76384 16.2573C4.87076 16.3173 5.00112 16.3173 5.10804 16.2574C5.27623 16.1629 5.62676 16.0621 6.10629 16.0621C6.68533 16.0621 7.00703 16.1973 7.13425 16.2765C7.03272 16.3401 6.81574 16.4274 6.47257 16.4676C6.33171 16.4842 6.21457 16.5836 6.17552 16.72C6.13633 16.8563 6.18297 17.0028 6.29374 17.0913ZM5.59048 21.3703L5.60257 21.4355C5.64438 21.6613 5.73255 21.8685 5.85574 22.0487H3.76437C2.07641 22.0487 0.703122 20.7988 0.703122 19.2624C0.703122 18.2125 1.34474 17.2968 2.28955 16.8219C2.39807 16.9029 2.53335 16.9728 2.69385 17.0291C2.63019 17.1378 2.58585 17.2547 2.5754 17.3766C2.56152 17.5387 2.61111 17.6927 2.71518 17.8101C2.85266 17.9654 3.06369 18.0441 3.34241 18.0441C3.71384 18.0441 4.2012 17.897 4.64604 17.6508C4.74846 17.5941 4.84531 17.5342 4.93596 17.4717C5.02657 17.5342 5.12342 17.594 5.22588 17.6508C5.67073 17.897 6.15808 18.044 6.52952 18.0441H6.52957C6.80819 18.0441 7.01922 17.9654 7.15666 17.8102C7.26077 17.6927 7.31041 17.5388 7.29649 17.3766C7.28603 17.2547 7.24169 17.1378 7.17803 17.0291C7.33853 16.9727 7.47386 16.9029 7.58237 16.8219C8.33167 17.1985 8.88999 17.8525 9.08907 18.6307L6.6026 19.5753C5.87477 19.8519 5.4491 20.6067 5.59048 21.3703ZM18.5351 21.7178C18.3618 21.9254 18.1067 22.0445 17.8353 22.0446L17.4663 22.0447L17.2357 20.7999C17.2003 20.609 17.017 20.4828 16.826 20.5183C16.6351 20.5536 16.509 20.737 16.5443 20.928L16.7512 22.0449L15.5416 22.0454L15.3857 21.2037C15.3503 21.0128 15.167 20.8867 14.976 20.922C14.7851 20.9573 14.659 21.1408 14.6943 21.3317L14.8265 22.0457L12.0128 22.0468L11.8011 20.9036C11.7656 20.7127 11.5823 20.5866 11.3913 20.622C11.2004 20.6573 11.0743 20.8408 11.1097 21.0317L11.2978 22.047L7.18947 22.0486C7.18938 22.0486 7.18928 22.0486 7.18919 22.0486C6.74988 22.0486 6.37338 21.7369 6.29379 21.3073L6.28169 21.2421C6.20224 20.8129 6.44214 20.3884 6.85216 20.2326L8.23389 19.7077L8.33682 20.2632C8.36818 20.4325 8.51593 20.5508 8.68206 20.5508C8.70334 20.5508 8.7249 20.5488 8.74656 20.5448C8.93743 20.5095 9.06353 20.326 9.02813 20.1351L8.9019 19.4539L10.9529 18.6747C11.1344 18.6058 11.2257 18.4027 11.1567 18.2212C11.0878 18.0397 10.8845 17.9485 10.7033 18.0174L9.74883 18.38C9.48109 17.432 8.79324 16.6402 7.88111 16.1865C7.85247 16.0024 7.72126 15.7363 7.2467 15.5489C6.93644 15.4264 6.53135 15.3589 6.10619 15.3589C5.8136 15.3589 5.53418 15.3912 5.28753 15.45V15.2377C5.28753 15.0435 5.13017 14.8861 4.93596 14.8861C4.85389 14.8861 4.77861 14.9144 4.71875 14.9616C4.66329 14.5949 4.63226 14.2224 4.62711 13.8447H16.0781C16.2723 13.8447 16.4296 13.6873 16.4296 13.4931C16.4296 13.299 16.2723 13.1416 16.0781 13.1416H15.9342C16.1581 12.6805 16.2845 12.1636 16.2845 11.6173C16.2845 11.3071 16.0472 11.0516 15.7448 11.0226C15.8765 10.8984 16.0408 10.8147 16.224 10.7828C16.2777 10.7734 16.3321 10.7687 16.3859 10.7687C16.8398 10.7687 17.2255 11.0934 17.303 11.5407C17.3119 11.5925 17.3165 11.6459 17.3166 11.6996C17.3168 11.8816 17.456 12.0334 17.6374 12.0494C18.0575 12.0862 18.4013 12.4022 18.4733 12.8177C18.4924 12.9282 18.49 13.0372 18.4709 13.1416H18.0937C17.8995 13.1416 17.7421 13.299 17.7421 13.4931C17.7421 13.6873 17.8995 13.8447 18.0937 13.8447H20.8261C20.8174 14.4896 20.7343 15.1196 20.5794 15.7308L18.6741 16.8555C18.5576 16.4499 18.2868 16.1059 17.9136 15.897C17.495 15.6628 16.9976 15.6262 16.5491 15.7966L12.6251 17.2873C12.4436 17.3562 12.3524 17.5593 12.4213 17.7408C12.4903 17.9223 12.6935 18.0135 12.8748 17.9446L13.3917 17.7483L13.5522 18.6148C13.5836 18.7841 13.7313 18.9025 13.8975 18.9025C13.9187 18.9025 13.9403 18.9005 13.9619 18.8965C14.1528 18.8612 14.279 18.6777 14.2436 18.4868L14.0598 17.4945L16.7987 16.454C17.0524 16.3576 17.3336 16.3783 17.5702 16.5107C17.8063 16.6429 17.9699 16.8707 18.0191 17.1356L18.7303 20.9753C18.7793 21.2401 18.7082 21.5108 18.5351 21.7178ZM19.7895 18.966C19.6255 18.9962 19.5053 19.1373 19.5016 19.3041C19.4979 19.4708 19.6119 19.6172 19.7744 19.6544L22.3919 20.2548L22.3265 20.6935L19.2921 20.1482L18.8178 17.5872L21.4608 16.0271L21.681 16.4169L19.4517 17.9071C19.3131 17.9998 19.2586 18.1771 19.3213 18.3316C19.384 18.4861 19.5467 18.5753 19.7106 18.5452L23.2125 17.9019L23.2905 18.3228L19.7895 18.966Z" fill="currentColor"/>
                                                                        </svg>
                                                                        <div>Список продуктов</div>
                                                                    </div>
                                                                </div>
                                                            </ScrollContainer>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        }
                                        {
                                            current.step === 2 && (
                                                isLoadedRecipes ? (
                                                    <div className="uk-grid-collapse" data-uk-grid>
                                                        <div className="uk-width-3-5@s">
                                                            <div className="tm-nutrition-list-recipes">
                                                                <div className="uk-child-width-1-2@s" data-uk-grid>
                                                                    {
                                                                        nutrition.recipes.map((recipeItem, key) => (
                                                                            <div key={key}>
                                                                                <div className="tm-nutrition-list-recipes-item" onClick={() => this.changeNutritionRecipeItem(recipeItem)}>
                                                                                    <div className="uk-grid-small uk-flex uk-flex-middle" data-uk-grid>
                                                                                        <div className="uk-width-auto">
                                                                                            <div className="tm-picture">
                                                                                                <img src={recipeItem.picture} alt="" />
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="uk-width-expand">
                                                                                            <div className="tm-name">
                                                                                                {recipeItem.name}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="uk-width-expand@s uk-visible@m">
                                                            <img src={require("../../assets/images/image-art-4.png").default} alt="" />
                                                        </div>
                                                    </div>
                                                ) : <div data-uk-spinner />
                                            )
                                        }
                                        {
                                            current.step === 3 && (
                                                <div className="tm-recipe-item">
                                                    <h2 className="uk-h2 uk-width-4-5@s uk-text-bolder uk-margin-medium-bottom">{current.recipe.name}</h2>
                                                    <div className="uk-child-width-1-2@s" data-uk-grid>
                                                        <div>
                                                            <p dangerouslySetInnerHTML={{__html: current.recipe.text}} style={{fontSize: '12px'}}/>
                                                        </div>
                                                        <div>
                                                            <img src={current.recipe.picture} alt="" />
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        }
                                    </>
                                ) : <div className="tm-spinner" data-uk-spinner="target: .tm-spinner;" />
                            }
                        </div>
                        <div>
                            <div id="tm-modal-menu" className="uk-modal-full" data-uk-modal="stack: true;">
                                <div className="uk-modal-dialog">
                                    <button className="uk-modal-close-full uk-close-large" type="button" data-uk-close />
                                    <div className="uk-padding-large">
                                        <h1>Меню на неделю</h1>
                                        <p dangerouslySetInnerHTML={{__html: current.menu}} />
                                    </div>
                                </div>
                            </div>
                            <div id="tm-modal-rules" className="uk-modal-full" data-uk-modal="stack: true;">
                                <div className="uk-modal-dialog" style={{minHeight: '100vh'}}>
                                    <button className="uk-modal-close-full uk-close-large" type="button" data-uk-close />
                                    <div className="uk-padding-large">
                                        <h1>Правила питания</h1>
                                        <p dangerouslySetInnerHTML={{__html: current.rules}} />
                                    </div>
                                </div>
                            </div>
                            <div id="tm-modal-products" className="uk-modal-full" data-uk-modal="stack: true;">
                                <div className="uk-modal-dialog">
                                    <button className="uk-modal-close-full uk-close-large" type="button" data-uk-close />
                                    <div className="uk-padding-large">
                                        <h1>Список продуктов</h1>
                                        <p dangerouslySetInnerHTML={{__html: current.products}} />
                                    </div>
                                </div>
                            </div>
                            <div id="tm-modal-change-course" className="uk-flex-top" data-uk-modal="stack: true;">
                                <div className="uk-modal-dialog uk-margin-auto-vertical uk-width-1-3@s">
                                    <button className="uk-modal-close-full uk-close-large" type="button" data-uk-close />
                                    <div className="uk-padding-large uk-text-center">
                                        <h3 className="uk-h3 uk-text-bolder">Выбрать курс</h3>
                                        <div data-uk-grid>
                                            <div className="uk-width-1-2">
                                                <select className="uk-select" onChange={(e) => this.changeSeason(e)}>
                                                    <option value="">Выберите курс</option>
                                                    {
                                                        seasons.map((seasonItem, key) => (
                                                            <option key={key} value={seasonItem.id}>{seasonItem.season_date}</option>
                                                        ))
                                                    }
                                                </select>
                                            </div>
                                            <div className="uk-width-1-2">
                                                <select className="uk-select" onChange={(e) => this.changeWeek(e)}>
                                                    <option value="">Выберите неделю</option>
                                                    {
                                                        season.weeks.map((weekItem, key) => (
                                                            <option key={key} value={weekItem.week}>{weekItem.text}</option>
                                                        ))
                                                    }
                                                </select>
                                            </div>
                                        </div>
                                        <div className="uk-margin-medium-top">
                                            <div className="uk-button uk-button-primary uk-modal-close">Ок</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                }
            </>
        );
    }
}

const mapStateToProps = state => state;
export default connect(mapStateToProps)(Nutrition);
