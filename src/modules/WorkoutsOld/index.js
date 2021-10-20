import React from 'react';
import store from "../../utils/store";
import { connect } from "react-redux";
import ScrollContainer from 'react-indiana-drag-scroll'

import UIkit from "uikit";

class Workouts extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoaded: false,
            current: {
                type: 1,
                step: 1,
                day: {},
                week: 1,
                trainingIndex: null,
                training: {}
            },
            workouts: {
                week: {}
            },
            workoutsBySeason: {
                week: {},
                days: [{
                    stretch: [],
                    trainings: []
                }, {
                    stretch: [],
                    trainings: []
                },{
                    stretch: [],
                    trainings: []
                }, {
                    stretch: [],
                    trainings: []
                }]
            },
            trainingResults: {
                repeat: 0,
                seconds: 0
            },
            archive: [],
            seasons: [],
            season: {
                weeks: []
            }
        };

        this.changeWorkoutDay = this.changeWorkoutDay.bind(this);
        this.changeWorkoutTraining = this.changeWorkoutTraining.bind(this);
        this.goToWeek = this.goToWeek.bind(this);
        this.changeWorkoutsType = this.changeWorkoutsType.bind(this);

        this.startTraining = this.startTraining.bind(this);

        this.actionGetWorkouts = this.actionGetWorkouts.bind(this);
        this.actionTrainingStop = this.actionTrainingStop.bind(this);
        this.actionTrainingSkip = this.actionTrainingSkip.bind(this);
        this.actionTrainingDone = this.actionTrainingDone.bind(this);

        this.changeField = this.changeField.bind(this);

        this.actionGetTrainingArchive = this.actionGetTrainingArchive.bind(this);
    }

    componentDidMount() {
        const accessToken = localStorage.getItem("accessToken");

        store.dispatch({
            type: "CHANGE_PAGE",
            payload: {
                body: {
                    class: "tm-page-workouts tm-page-workout-step-1"
                },
                header: {
                    navigation: true,
                    title: "Тренировки"
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

    async componentWillMount() {
        await this.actionGetWorkouts();

        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            this.props.history.push('/signin');
        }
    }

    async componentDidUpdate(prevProps) {
        if (this.props.seasonState.id != prevProps.seasonState.id) {
            await this.actionGetWorkouts();
        }
    }

    changeField = (e) => {
        this.setState({
            trainingResults: {
                repeat: e.target.name === 'repeat' ? e.target.value : 0,
                seconds: e.target.name === 'seconds' ? e.target.value : 0
            }
        })
    };

    async actionGetWorkouts() {
        const accessToken = localStorage.getItem("accessToken");

        if (this.props.seasonState.id === 1 || localStorage.getItem('seasonStateIt')) {
            await fetch( "https://api-academy.zubareva.online/api/trainings/list", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization' : accessToken
                },
            })
            .then(res => res.json())
            .then(
                (result) => {
                    let currentDay = result.days.filter((day) => day.current_day);

                    if (currentDay.length === 1) {
                        currentDay = currentDay[0]
                    }
                    else{
                        currentDay = {id: null};
                    }

                    this.setState({
                        isLoaded: true,
                        current: {
                            ...this.state.current,
                            day: currentDay,
                            trainingIndex: currentDay.id > 0 ? currentDay.current_tranings_index : 0,
                            training: currentDay.id > 0 ? currentDay.trainings[currentDay.current_tranings_index] : []
                        },
                        workouts: result
                    })
                },(error) => {
                    console.log(error)
                }
            );
        }
    };

    actionGetWorkoutsBySeasonId(seasonId, weekId) {
        const accessToken = localStorage.getItem("accessToken");

        if (this.props.seasonState.id === 0) {
            fetch( `https://api-academy.zubareva.online/api/trainings/list_t?season_id=${seasonId}&week=${weekId}`, {
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
                        workoutsBySeason: result
                    })
                },(error) => {
                    console.log(error)
                }
            );
        }
    };

    changeWorkoutDay = (day) => {
        this.setState({
            current: {
                ...this.state.current,
                step: 2,
                day: day
            }
        });

        store.dispatch({
            type: "CHANGE_PAGE",
            payload: {
                body: {
                    class: "tm-page-workouts tm-page-workout-day"
                },
                header: {
                    navigation: true,
                    title: ''
                }
            }
        });
    };

    changeWorkoutTraining = (training) => {
        this.setState({
            current: {
                ...this.state.current,
                step: 3,
                training: training
            }
        });

        store.dispatch({
            type: "CHANGE_PAGE",
            payload: {
                body: {
                    class: "tm-page-workouts tm-page-workout-training"
                },
                header: {
                    navigation: true,
                    title: ''
                }
            }
        });
    };

    goToWeek = () => {
        let currentDay = this.state.workouts.days.length > 0 ? this.state.workouts.days.filter((day) => day.current_day) : [];
        currentDay = currentDay.length > 0 ? currentDay[0] : [];

        this.setState({
            current: {
                ...this.state.current,
                day: currentDay,
                step: 1
            }
        });

        store.dispatch({
            type: "CHANGE_PAGE",
            payload: {
                body: {
                    class: "tm-page-workouts tm-page-workout-step-1"
                },
                header: {
                    navigation: true,
                    title: "Тренировки"
                }
            }
        });
    };

    async changeWorkoutsType(type) {
        if (type === 2) {
            await this.actionGetTrainingArchive();
        }

        await this.setState({
            current: {
                ...this.state.current,
                type: type
            }
        });

        store.dispatch({
            type: "CHANGE_PAGE",
            payload: {
                body: {
                    class: type === 1 ? "tm-page-workouts tm-page-workout-step-1" : "tm-page-workouts tm-page-workout-archive"
                },
                header: {
                    navigation: true,
                    title: 'Тренировки'
                }
            }
        });
    };

    startTraining = () => {
        this.setState({
            current: {
                ...this.state.current,
                step: 3
            }
        });

        store.dispatch({
            type: "CHANGE_PAGE",
            payload: {
                body: {
                    class: "tm-page-workouts tm-page-workout-training"
                },
                header: {
                    navigation: true,
                    title: ''
                }
            }
        });
    };

    actionGetTrainingArchive = () => {
        const accessToken = localStorage.getItem("accessToken");

        fetch( "https://api-academy.zubareva.online/api/trainings/archive", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : accessToken
            }
        })
        .then(res => res.json())
        .then(
            (result) => {
                this.setState({
                    archive: result.list.length > 0 ? result.list : this.state.archive
                })
            },(error) => {
                console.log(error)
            }
        );
    };

    async actionTrainingStop() {
        const accessToken = localStorage.getItem("accessToken");

        await fetch( "https://api-academy.zubareva.online/api/trainings/finish", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : accessToken
            }
        })
        .then(res => res.json())
        .then(
            (result) => {
                this.setState({
                    current: {
                        ...this.state.current,
                        step: 1,
                        trainingIndex: 0,
                        training: []
                    }
                });

                UIkit.modal('#tm-modal-workouts-training-stop').hide();
                this.actionGetWorkouts();

            },(error) => {
                console.log(error)
            }
        );

        store.dispatch({
            type: "CHANGE_PAGE",
            payload: {
                body: {
                    class: "tm-page-workouts tm-page-workout-step-1"
                },
                header: {
                    navigation: true,
                    title: "Тренировки"
                }
            }
        });

        this.actionGetWorkouts();
    };

    actionTrainingSkip = () => {
        const accessToken = localStorage.getItem("accessToken");

        fetch( "https://api-academy.zubareva.online/api/trainings/skip", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : accessToken
            },
            body: JSON.stringify({
                id: this.state.current.training.id
            })
        })
        .then(res => res.json())
        .then(
            (result) => {
                const trainingIndex = parseInt(this.state.current.trainingIndex);
                const totalTrainings = parseInt(this.state.current.day.trainings.length - 1);
                const totalCircles = parseInt(this.state.current.day.circles);
                const currentCircle = parseInt(this.state.current.day.current_circle);

                if (currentCircle < totalCircles) {
                    if (trainingIndex === totalTrainings) {
                        UIkit.modal('#tm-modal-workouts-training-circle').show();
                        this.actionGetWorkouts();
                    }
                }

                this.refResult.value = '';

                this.setState({
                    current: {
                        ...this.state.current,
                        trainingIndex: trainingIndex + 1 > totalTrainings ? 0 : trainingIndex + 1,
                        training: trainingIndex + 1 > totalTrainings ? this.state.current.day.trainings[0] : this.state.current.day.trainings[trainingIndex + 1]
                    },
                    trainingResults: {
                        repeat: 0,
                        seconds: 0
                    }
                });

                if (currentCircle === totalCircles) {
                    if (trainingIndex === totalTrainings) {
                        this.setState({
                            current: {
                                ...this.state.current,
                                step: 1
                            }
                        });

                        store.dispatch({
                            type: "CHANGE_PAGE",
                            payload: {
                                body: {
                                    class: "tm-page-workouts tm-page-workout-step-1"
                                },
                                header: {
                                    navigation: true,
                                    title: "Тренировки"
                                }
                            }
                        });

                        this.actionGetWorkouts();
                    }
                }

                UIkit.modal('#tm-modal-workouts-training-done').hide();
                localStorage.setItem('currentCircle', this.state.current.day.current_circle);
            },(error) => {
                console.log(error)
            }
        );

        window.scrollTo(0, 0);
    };

    async actionTrainingDone() {
        const accessToken = localStorage.getItem("accessToken");

        UIkit.modal('#tm-modal-workouts-training-done').hide();

        await fetch( "https://api-academy.zubareva.online/api/trainings/done", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : accessToken
            },
            body: JSON.stringify({
                id: this.state.current.training.id,
                repeat: this.state.trainingResults.repeat,
                seconds: this.state.trainingResults.seconds
            })
        })
        .then(res => res.json())
        .then(
            (result) => {
                const trainingIndex = parseInt(this.state.current.trainingIndex);
                const totalTrainings = parseInt(this.state.current.day.trainings.length - 1);
                const totalCircles = parseInt(this.state.current.day.circles);
                const currentCircle = parseInt(this.state.current.day.current_circle);

                if (currentCircle < totalCircles) {
                    if (trainingIndex === totalTrainings) {
                        UIkit.modal('#tm-modal-workouts-training-circle').show();
                        this.actionGetWorkouts();
                    }
                }

                this.refResult.value = '';

                this.setState({
                    current: {
                        ...this.state.current,
                        trainingIndex: trainingIndex + 1 > totalTrainings ? 0 : trainingIndex + 1,
                        training: trainingIndex + 1 > totalTrainings ? this.state.current.day.trainings[0] : this.state.current.day.trainings[trainingIndex + 1]
                    },
                    trainingResults: {
                        repeat: 0,
                        seconds: 0
                    }
                });

                if (currentCircle === totalCircles) {
                    if (trainingIndex === totalTrainings) {
                        this.setState({
                            current: {
                                ...this.state.current,
                                step: 1
                            }
                        });

                        store.dispatch({
                            type: "CHANGE_PAGE",
                            payload: {
                                body: {
                                    class: "tm-page-workouts tm-page-workout-step-1"
                                },
                                header: {
                                    navigation: true,
                                    title: "Тренировки"
                                }
                            }
                        });

                        this.actionGetWorkouts();
                    }
                }

                localStorage.setItem('currentCircle', this.state.current.day.current_circle);
            },(error) => {
                console.log(error)
            }
        );

        window.scrollTo(0, 0);
    };

    async changeSeason(e) {
        if (e.target.value > 0) {
            //this.actionGetWorkoutsBySeasonId(e.target.value, this.state.current.week);

            await this.setState({
                current: {
                    ...this.state.current,
                    seasonId: parseInt(e.target.value)
                },
                season: this.state.seasons.filter((seasonItem) => seasonItem.id === parseInt(e.target.value))[0]
            });
        }
        else{
            await this.setState({
                current: {
                    ...this.state.current,
                    seasonId: this.state.seasons[0].id,
                    week: 1
                },
                season: this.state.seasons[0]
            });
        }
    };

    async changeWeek(e) {
        if (e.target.value > 0) {
            this.actionGetWorkoutsBySeasonId(this.state.current.seasonId, e.target.value);

            await this.setState({
                current: {
                    ...this.state.current,
                    week: parseInt(e.target.value)
                }
            });
        }
        else{
            await this.setState({
                current: {
                    ...this.state.current,
                    seasonId: this.state.seasons[0].id,
                    week: 1
                },
                season: this.state.seasons[0]
            });
        }
    };

    render() {
        const { isLoaded, current, workouts, archive, season, seasons } = this.state;

        return (
            <>
                <div className="uk-container uk-container-large uk-section">
                    {
                        (seasons.length > 0 && this.props.seasonState.id === 0) && (
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
                                    <h2 className="uk-h2 uk-margin-remove" style={{fontWeight: 700}}>Тренировки</h2>
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
                        (this.props.seasonState.id === 0 && this.props.seasonState.has === 1 && this.state.workoutsBySeason.days[0].trainings.length === 0) && (
                            <div className="tm-wrapper-plug">
                                <h3 className="uk-3">Ожидайте начала сезона</h3>
                                <div>{this.props.seasonState.date}</div>
                            </div>
                        )
                    }
                    {
                        (this.props.seasonState.id === 0 && this.props.seasonState.has === 0 && this.state.workoutsBySeason.days[0].trainings.length === 0) && (
                            <div className="tm-wrapper-plug">
                                <h3 className="uk-3">Мы не обнаружили у вас сезона</h3>
                                <a href="https://off-slender.zubareva.online" target="_blank" className="uk-button uk-button-primary" rel="noreferrer">Купить</a>
                                <a href="https://wa.me/79182611437?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5%2C%20%D1%83%20%D0%BC%D0%B5%D0%BD%D1%8F%20%D0%B2%D0%BE%D0%BF%D1%80%D0%BE%D1%81%20%D0%BF%D0%BE%20%D0%BC%D0%B0%D1%80%D0%B0%D1%84%D0%BE%D0%BD%D1%83%2C%20" target="_blank" className="uk-button uk-button-default uk-margin-left" rel="noreferrer">Техническая поддержка</a>
                            </div>
                        )
                    }
                    {
                        (this.props.seasonState.id === 0 && this.state.workoutsBySeason.days[0].trainings.length > 0) && (
                            <>
                                <ScrollContainer className="scroll-container">
                                    <ul data-uk-tab="connect: .tm-switcher-archive-season;" style={{width: "500px"}}>
                                        {
                                            this.state.workoutsBySeason.days.map((dayItem, key) => (
                                                <li key={key}><a href="#">{dayItem.name}</a></li>
                                            ))
                                        }
                                    </ul>
                                </ScrollContainer>
                                <div className="uk-width-2-3@s">
                                    <ul className="uk-switcher tm-switcher-archive-season">
                                        {
                                            this.state.workoutsBySeason.days.length > 0 && (
                                                this.state.workoutsBySeason.days.map((dayItem, key) => (
                                                    <li key={key} className={`${key === 0 ? 'uk-active' : ''}`}>
                                                        <div className="uk-margin">
                                                            <h3 className="uk-h3 uk-text-bolder">Разминка</h3>
                                                            <div className="uk-margin-small" dangerouslySetInnerHTML={{__html: dayItem.stretch.description}} />
                                                            <div dangerouslySetInnerHTML={{__html: dayItem.stretch.video}} />
                                                        </div>
                                                        {
                                                            dayItem.trainings.map((trainingItem, key) => (
                                                                <div key={key} className="uk-margin">
                                                                    <h3 className="uk-h3 uk-text-bolder">{trainingItem.name}</h3>
                                                                    <div className="uk-margin-small" dangerouslySetInnerHTML={{__html: trainingItem.description}} />
                                                                    <div dangerouslySetInnerHTML={{__html: trainingItem.video}} />
                                                                </div>
                                                            ))
                                                        }
                                                    </li>
                                                ))
                                            )
                                        }
                                    </ul>
                                </div>
                            </>
                        )
                    }
                    {
                        (this.props.seasonState.id === 1) && (
                            <>
                            {
                                isLoaded && (
                                    <div>
                                        <div className="tm-workouts-header-buttons">
                                            <div className={`uk-button ${current.type === 1 ? 'uk-button-primary' : 'uk-button-default'} uk-flex-inline uk-flex-middle uk-margin-right`} onClick={() => this.changeWorkoutsType(1)}>
                                                <svg width="30" height="20" viewBox="0 0 30 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M28.0645 8.00006V3.5002C28.0647 3.14785 27.9748 2.8017 27.8038 2.49685C27.6328 2.192 27.3868 1.93928 27.0909 1.7643C26.7949 1.58932 26.4594 1.49831 26.1184 1.50048C25.7774 1.50266 25.4431 1.59795 25.1492 1.77669C25.094 1.2688 24.8527 0.802015 24.4748 0.472191C24.097 0.142367 23.6113 -0.0254713 23.1175 0.00313837C22.6236 0.0317481 22.1591 0.254634 21.8193 0.626033C21.4795 0.997432 21.2902 1.48916 21.2903 2.00025V8.00006H8.70968V2.00025C8.70907 1.48963 8.51948 0.9986 8.17976 0.627788C7.84004 0.256977 7.37593 0.0344758 6.88255 0.00589059C6.38917 -0.0226946 5.90389 0.144801 5.52618 0.474047C5.14848 0.803292 4.90695 1.26935 4.85111 1.77669C4.55724 1.59787 4.22284 1.50252 3.8818 1.5003C3.54077 1.49808 3.20523 1.58908 2.90921 1.76407C2.61318 1.93906 2.3672 2.19181 2.1962 2.49671C2.02519 2.80161 1.93525 3.1478 1.93548 3.5002V8.00006C1.42216 8.00006 0.929864 8.21077 0.56689 8.58583C0.203916 8.96089 0 9.46958 0 10C0 10.5304 0.203916 11.0391 0.56689 11.4142C0.929864 11.7892 1.42216 11.9999 1.93548 11.9999V16.4998C1.93525 16.8522 2.02519 17.1984 2.1962 17.5033C2.3672 17.8082 2.61318 18.0609 2.90921 18.2359C3.20523 18.4109 3.54077 18.5019 3.8818 18.4997C4.22284 18.4975 4.55724 18.4021 4.85111 18.2233C4.90695 18.7306 5.14848 19.1967 5.52618 19.526C5.90389 19.8552 6.38917 20.0227 6.88255 19.9941C7.37593 19.9655 7.84004 19.743 8.17976 19.3722C8.51948 19.0014 8.70907 18.5104 8.70968 17.9998V11.9999H21.2903V17.9998C21.2902 18.5108 21.4795 19.0026 21.8193 19.374C22.1591 19.7454 22.6236 19.9683 23.1175 19.9969C23.6113 20.0255 24.097 19.8576 24.4748 19.5278C24.8527 19.198 25.094 18.7312 25.1492 18.2233C25.4431 18.4021 25.7774 18.4973 26.1184 18.4995C26.4594 18.5017 26.7949 18.4107 27.0909 18.2357C27.3868 18.0607 27.6328 17.808 27.8038 17.5031C27.9748 17.1983 28.0647 16.8521 28.0645 16.4998V11.9999C28.5778 11.9999 29.0701 11.7892 29.4331 11.4142C29.7961 11.0391 30 10.5304 30 10C30 9.46958 29.7961 8.96089 29.4331 8.58583C29.0701 8.21077 28.5778 8.00006 28.0645 8.00006ZM1.93548 11C1.67882 11 1.43267 10.8946 1.25119 10.7071C1.0697 10.5196 0.967742 10.2652 0.967742 10C0.967742 9.73479 1.0697 9.48045 1.25119 9.29292C1.43267 9.10538 1.67882 9.00003 1.93548 9.00003V11ZM3.87097 17.4998C3.6144 17.4995 3.36843 17.394 3.18701 17.2065C3.00559 17.0191 2.90353 16.7649 2.90323 16.4998V3.5002C2.90323 3.23499 3.00518 2.98065 3.18667 2.79312C3.36816 2.60558 3.61431 2.50023 3.87097 2.50023C4.12763 2.50023 4.37378 2.60558 4.55526 2.79312C4.73675 2.98065 4.83871 3.23499 4.83871 3.5002V16.4998C4.83841 16.7649 4.73635 17.0191 4.55493 17.2065C4.37351 17.394 4.12754 17.4995 3.87097 17.4998ZM7.74194 17.9998C7.74194 18.265 7.63998 18.5193 7.45849 18.7068C7.277 18.8944 7.03085 18.9997 6.77419 18.9997C6.51753 18.9997 6.27138 18.8944 6.0899 18.7068C5.90841 18.5193 5.80645 18.265 5.80645 17.9998V2.00025C5.80645 1.73504 5.90841 1.48069 6.0899 1.29316C6.27138 1.10563 6.51753 1.00028 6.77419 1.00028C7.03085 1.00028 7.277 1.10563 7.45849 1.29316C7.63998 1.48069 7.74194 1.73504 7.74194 2.00025V17.9998ZM8.70968 11V9.00003H21.2903V11H8.70968ZM24.1935 17.9998C24.1935 18.265 24.0916 18.5193 23.9101 18.7068C23.7286 18.8944 23.4825 18.9997 23.2258 18.9997C22.9691 18.9997 22.723 18.8944 22.5415 18.7068C22.36 18.5193 22.2581 18.265 22.2581 17.9998V2.00025C22.2581 1.73504 22.36 1.48069 22.5415 1.29316C22.723 1.10563 22.9691 1.00028 23.2258 1.00028C23.4825 1.00028 23.7286 1.10563 23.9101 1.29316C24.0916 1.48069 24.1935 1.73504 24.1935 2.00025V17.9998ZM27.0968 16.4998C27.0968 16.765 26.9948 17.0194 26.8133 17.2069C26.6318 17.3944 26.3857 17.4998 26.129 17.4998C25.8724 17.4998 25.6262 17.3944 25.4447 17.2069C25.2632 17.0194 25.1613 16.765 25.1613 16.4998V3.5002C25.1613 3.23499 25.2632 2.98065 25.4447 2.79312C25.6262 2.60558 25.8724 2.50023 26.129 2.50023C26.3857 2.50023 26.6318 2.60558 26.8133 2.79312C26.9948 2.98065 27.0968 3.23499 27.0968 3.5002V16.4998ZM28.0645 11V9.00003C28.3212 9.00003 28.5673 9.10538 28.7488 9.29292C28.9303 9.48045 29.0323 9.73479 29.0323 10C29.0323 10.2652 28.9303 10.5196 28.7488 10.7071C28.5673 10.8946 28.3212 11 28.0645 11Z" fill="#251716"/>
                                                </svg>
                                                <span className="uk-margin-small-left">Упражнения</span>
                                            </div>
                                            <div className={`uk-button ${current.type === 2 ? 'uk-button-primary' : 'uk-button-default'} uk-flex-inline uk-flex-middle`} onClick={() => this.changeWorkoutsType(2)}>
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M4.4625 22C3.10625 22 2 20.8938 2 19.5375V4.4625C2 3.10625 3.10625 2 4.4625 2H7.6125C8.5375 2 9.4 2.53125 9.81875 3.3625L10.8125 5.35H19.5312C20.8937 5.35 21.9937 6.45625 21.9937 7.8125V19.5312C21.9937 20.8937 20.8875 21.9937 19.5312 21.9937H4.4625V22ZM3.58125 19.5375C3.58125 20.025 3.975 20.4188 4.4625 20.4188H19.5312C20.0187 20.4188 20.4125 20.025 20.4125 19.5375V7.8125C20.4125 7.325 20.0187 6.93125 19.5312 6.93125H10.325C10.025 6.93125 9.75 6.7625 9.61875 6.49375L8.40625 4.06875C8.25625 3.775 7.94375 3.58125 7.61875 3.58125H4.4625C3.975 3.58125 3.58125 3.975 3.58125 4.4625V9.1125H17.8625C18.3 9.1125 18.6562 9.46875 18.6562 9.90625C18.6562 10.3438 18.3 10.7 17.8625 10.7H3.58125V19.5375Z" fill="#251716"/>
                                                </svg>
                                                <span className="uk-margin-small-left">Архив</span>
                                            </div>
                                        </div>
                                        {
                                            current.type === 1 && (
                                                <>
                                                    {
                                                        current.step === 1 && (
                                                            <>
                                                                <div className="uk-hidden@m tm-title">
                                                                    <h2 className="uk-h2" style={{fontWeight: 700}}>Тренировки</h2>
                                                                </div>
                                                                <div className="tm-workouts-header">
                                                                    <div className="uk-grid-small uk-flex uk-flex-middle" data-uk-grid>
                                                                        <div>
                                                                            <div className="uk-flex">
                                                                                <h1 className="uk-h1 uk-text-bolder uk-margin-small-right">{workouts.week.name}</h1>
                                                                                <span style={{cursor: 'pointer'}} data-uk-toggle="target: #tm-modal-workouts-description;">
                                                                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                    <g clipPath="url(#clip0)">
                                                                                        <path d="M10.8326 0C10.7493 0 10.6608 0.000406901 10.6075 0.00427246C10.6071 0.00427246 10.6063 0.00427246 10.6059 0.00427246C10.5426 0.0016276 10.4775 0 10.4159 0C5.13167 0 0.832553 4.29871 0.832553 9.58333C0.832553 11.2067 1.24556 12.7901 2.02335 14.198L0.175611 17.5887C0.165032 17.608 0.155469 17.628 0.146314 17.6479C-0.138313 18.2847 -0.00281507 19.0151 0.490552 19.5089C0.812208 19.8305 1.23518 20.0004 1.6667 20C1.8968 20 2.12975 19.9522 2.35131 19.8529C2.37125 19.8442 2.39098 19.8342 2.41052 19.8238L5.80142 17.9759C7.2093 18.7535 8.79296 19.1667 10.4159 19.1667C15.7001 19.1667 19.9992 14.868 19.9992 9.58333C19.9992 9.51213 19.9976 9.44051 19.9947 9.3691C19.9976 9.30176 19.9992 9.23299 19.9992 9.16667C19.9992 4.11214 15.8873 0 10.8326 0V0ZM10.4159 17.5C8.93802 17.5 7.49841 17.09 6.25268 16.3133C6.24434 16.308 6.23518 16.3055 6.22643 16.3005C6.19917 16.2846 6.17089 16.2718 6.14261 16.2592C6.12003 16.2492 6.09765 16.2396 6.07466 16.2317C6.0476 16.2229 6.02054 16.2162 5.99267 16.2101C5.96724 16.2042 5.94221 16.1983 5.91678 16.1955C5.88932 16.192 5.86185 16.1912 5.83418 16.1904C5.80834 16.1896 5.78311 16.1888 5.75728 16.1904C5.72961 16.192 5.70295 16.1967 5.67549 16.2014C5.64884 16.2059 5.623 16.2101 5.59675 16.217C5.57254 16.2238 5.54894 16.2325 5.52514 16.2413C5.49584 16.252 5.46756 16.2634 5.4401 16.2771C5.43135 16.2817 5.42179 16.2838 5.41344 16.2885L1.67138 18.3278L3.71097 14.5858C3.71585 14.5762 3.7185 14.5662 3.72297 14.5567C3.736 14.5304 3.74678 14.5034 3.75715 14.4759C3.76631 14.4509 3.77546 14.4267 3.78218 14.4012C3.78889 14.3754 3.79337 14.3496 3.79805 14.3233C3.80252 14.2963 3.8072 14.2696 3.80883 14.2421C3.81046 14.2159 3.80964 14.1892 3.80883 14.1626C3.80802 14.1359 3.80761 14.1097 3.80435 14.0835C3.8009 14.0562 3.79459 14.0299 3.78889 14.0033C3.78299 13.9771 3.77668 13.9512 3.76834 13.9258C3.76061 13.9014 3.75003 13.878 3.73966 13.8538C3.72765 13.8263 3.71504 13.7996 3.70019 13.7738C3.6951 13.7646 3.69225 13.7551 3.68635 13.7463C2.90917 12.5012 2.49922 11.0612 2.49922 9.58333C2.49922 5.2179 6.05045 1.66667 10.4159 1.66667C10.4604 1.66626 10.5085 1.66626 10.5534 1.66911C10.5713 1.67053 10.6102 1.67094 10.6285 1.67094C10.6372 1.67094 10.6456 1.66829 10.6543 1.66829C10.6627 1.66789 10.6706 1.67013 10.6789 1.66911C10.7288 1.66585 10.7813 1.66667 10.8326 1.66667C14.9681 1.66667 18.3326 5.03133 18.3326 9.16667C18.3326 9.21671 18.333 9.27002 18.3301 9.32007C18.3293 9.33675 18.3321 9.35262 18.3321 9.3691C18.3321 9.38578 18.3293 9.40206 18.3301 9.41915C18.333 9.47327 18.3326 9.5284 18.3326 9.58333C18.3326 13.9488 14.7813 17.5 10.4159 17.5Z" fill="#2A2046"/>
                                                                                        <path d="M12.0833 13.7503H11.25V7.50033C11.25 7.04032 10.8767 6.66699 10.4167 6.66699H9.16666C8.70665 6.66699 8.33332 7.04032 8.33332 7.50033C8.33332 7.96033 8.70665 8.33366 9.16666 8.33366H9.58332V13.7503H8.74999C8.28999 13.7503 7.91666 14.1237 7.91666 14.5837C7.91666 15.0437 8.28999 15.417 8.74999 15.417H12.0833C12.5433 15.417 12.9167 15.0437 12.9167 14.5837C12.9167 14.1237 12.5433 13.7503 12.0833 13.7503Z" fill="#2A2046"/>
                                                                                        <path d="M10.4167 5.41699C11.1059 5.41699 11.6667 4.85628 11.6667 4.16699C11.6667 3.47791 11.1059 2.91699 10.4167 2.91699C9.72757 2.91699 9.16666 3.47791 9.16666 4.16699C9.16666 4.85628 9.72757 5.41699 10.4167 5.41699Z" fill="#2A2046"/>
                                                                                    </g>
                                                                                    <defs>
                                                                                        <clipPath id="clip0">
                                                                                            <rect width="20" height="20" fill="white"/>
                                                                                        </clipPath>
                                                                                    </defs>
                                                                                </svg>
                                                                            </span>
                                                                            </div>
                                                                        </div>
                                                                        {
                                                                            current.day.current_day && (
                                                                                <div>
                                                                                    <div className="uk-button uk-button-primary" onClick={this.startTraining}>Начать тренировку</div>
                                                                                </div>
                                                                            )
                                                                        }
                                                                    </div>
                                                                </div>
                                                                <div className="uk-margin-top" data-uk-grid>
                                                                    <div className="uk-width-2-3@s">
                                                                        <div className="tm-workouts-list">
                                                                            <div className="uk-grid-small" data-uk-grid>
                                                                                <div className="uk-width-1-2@s">
                                                                                    {
                                                                                        workouts.days.map((workoutItem, key) => (
                                                                                            (workoutItem.current_day || workoutItem.done) && (
                                                                                            <div className="uk-grid-small uk-child-width" data-uk-grid key={key}>
                                                                                                <div>
                                                                                                    <div className="tm-workouts-list-item" onClick={() => this.changeWorkoutDay(workoutItem)}>
                                                                                                        <div className="uk-grid-small uk-flex uk-flex-middle" data-uk-grid>
                                                                                                            <div className="uk-width-expand">
                                                                                                                <div className="tm-name">{workoutItem.name}</div>
                                                                                                            </div>
                                                                                                            <div className="uk-width-auto">
                                                                                                                {
                                                                                                                    (workoutItem.done) && (
                                                                                                                        <div className="tm-button-workout-details">
                                                                                                                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                                                                <path d="M16 4C9.383 4 4 9.383 4 16C4 22.617 9.383 28 16 28C22.617 28 28 22.617 28 16C28 9.383 22.617 4 16 4ZM16 26C10.486 26 6 21.514 6 16C6 10.486 10.486 6 16 6C21.514 6 26 10.486 26 16C26 21.514 21.514 26 16 26Z" fill="#251716" fillOpacity="0.6"/>
                                                                                                                                <path d="M19.7315 12.36L15.4325 17.5184L13.2065 15.2929C12.8165 14.9024 12.1825 14.9024 11.7925 15.2929C11.402 15.6834 11.402 16.3164 11.7925 16.7069L14.7925 19.7069C14.981 19.8949 15.2355 19.9999 15.5 19.9999C15.515 19.9999 15.5305 19.9999 15.5455 19.9989C15.826 19.9864 16.0885 19.8559 16.2685 19.6399L21.2685 13.64C21.622 13.2155 21.5645 12.5855 21.1405 12.2315C20.716 11.8785 20.085 11.9355 19.7315 12.36Z" fill="#251716" fillOpacity="0.6"/>
                                                                                                                            </svg>
                                                                                                                            <div>Готово</div>
                                                                                                                        </div>
                                                                                                                    )
                                                                                                                }
                                                                                                                {
                                                                                                                    (workoutItem.current_day && !workoutItem.done) && (
                                                                                                                        <div className="tm-button-workout-details">
                                                                                                                            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                                                                <path d="M13 0C5.83157 0 0 5.83157 0 13C0 20.1684 5.83157 26 13 26C20.1684 26 26 20.1684 26 13C26 5.83157 20.1684 0 13 0ZM17.0159 13.7659L11.5992 19.1826C11.388 19.3938 11.1107 19.5 10.8333 19.5C10.556 19.5 10.2786 19.3938 10.0674 19.1826C9.64382 18.759 9.64382 18.0743 10.0674 17.6508L14.7182 13L10.0674 8.34925C9.64387 7.92568 9.64387 7.241 10.0674 6.81743C10.491 6.39387 11.1757 6.39387 11.5992 6.81743L17.0159 12.2341C17.4395 12.6577 17.4395 13.3423 17.0159 13.7659Z" fill="currentColor"/>
                                                                                                                            </svg>
                                                                                                                            <div>Начать</div>
                                                                                                                        </div>
                                                                                                                    )
                                                                                                                }
                                                                                                                {
                                                                                                                    (!workoutItem.current_day && !workoutItem.done) && (
                                                                                                                        <div className="tm-button-workout-details">
                                                                                                                            <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                                                                <path d="M1 1L7 7L1 13" stroke="currentColor" stroke-opacity="0.6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                                                                                                            </svg>
                                                                                                                        </div>
                                                                                                                    )
                                                                                                                }
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>)
                                                                                        ))
                                                                                    }
                                                                                </div>
                                                                                <div className="uk-width-1-2@s">
                                                                                    {
                                                                                        workouts.days.map((workoutItem, key) => (
                                                                                            (!workoutItem.current_day && !workoutItem.done) && (
                                                                                                <div className="uk-grid-small uk-child-width" data-uk-grid key={key}>
                                                                                                    <div>
                                                                                                    <div className="tm-workouts-list-item" onClick={() => this.changeWorkoutDay(workoutItem)}>
                                                                                                        <div className="uk-grid-small uk-flex uk-flex-middle" data-uk-grid>
                                                                                                            <div className="uk-width-expand">
                                                                                                                <div className="tm-name">{workoutItem.name}</div>
                                                                                                            </div>
                                                                                                            <div className="uk-width-auto">
                                                                                                                {
                                                                                                                    (workoutItem.done) && (
                                                                                                                        <div className="tm-button-workout-details">
                                                                                                                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                                                                <path d="M16 4C9.383 4 4 9.383 4 16C4 22.617 9.383 28 16 28C22.617 28 28 22.617 28 16C28 9.383 22.617 4 16 4ZM16 26C10.486 26 6 21.514 6 16C6 10.486 10.486 6 16 6C21.514 6 26 10.486 26 16C26 21.514 21.514 26 16 26Z" fill="#251716" fillOpacity="0.6"/>
                                                                                                                                <path d="M19.7315 12.36L15.4325 17.5184L13.2065 15.2929C12.8165 14.9024 12.1825 14.9024 11.7925 15.2929C11.402 15.6834 11.402 16.3164 11.7925 16.7069L14.7925 19.7069C14.981 19.8949 15.2355 19.9999 15.5 19.9999C15.515 19.9999 15.5305 19.9999 15.5455 19.9989C15.826 19.9864 16.0885 19.8559 16.2685 19.6399L21.2685 13.64C21.622 13.2155 21.5645 12.5855 21.1405 12.2315C20.716 11.8785 20.085 11.9355 19.7315 12.36Z" fill="#251716" fillOpacity="0.6"/>
                                                                                                                            </svg>
                                                                                                                            <div>Готово</div>
                                                                                                                        </div>
                                                                                                                    )
                                                                                                                }
                                                                                                                {
                                                                                                                    (workoutItem.current_day && !workoutItem.done) && (
                                                                                                                        <div className="tm-button-workout-details">
                                                                                                                            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                                                                <path d="M13 0C5.83157 0 0 5.83157 0 13C0 20.1684 5.83157 26 13 26C20.1684 26 26 20.1684 26 13C26 5.83157 20.1684 0 13 0ZM17.0159 13.7659L11.5992 19.1826C11.388 19.3938 11.1107 19.5 10.8333 19.5C10.556 19.5 10.2786 19.3938 10.0674 19.1826C9.64382 18.759 9.64382 18.0743 10.0674 17.6508L14.7182 13L10.0674 8.34925C9.64387 7.92568 9.64387 7.241 10.0674 6.81743C10.491 6.39387 11.1757 6.39387 11.5992 6.81743L17.0159 12.2341C17.4395 12.6577 17.4395 13.3423 17.0159 13.7659Z" fill="currentColor"/>
                                                                                                                            </svg>
                                                                                                                            <div>Начать</div>
                                                                                                                        </div>
                                                                                                                    )
                                                                                                                }
                                                                                                                {
                                                                                                                    !workoutItem.current_day && (
                                                                                                                        <div className="tm-button-workout-details">
                                                                                                                            <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                                                                <path d="M1 1L7 7L1 13" stroke="currentColor" stroke-opacity="0.6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                                                                                                            </svg>
                                                                                                                        </div>
                                                                                                                    )
                                                                                                                }
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    </div>
                                                                                            </div>)
                                                                                        ))
                                                                                    }
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        )
                                                    }
                                                    {
                                                        current.step === 2 && (
                                                            <>
                                                                <div className="tm-workouts-header">
                                                                    <div className="uk-grid-small uk-flex uk-flex-middle" data-uk-grid>
                                                                        <div>
                                                                            <h1 className="uk-h1 uk-text-bolder">{current.day.name}</h1>
                                                                        </div>
                                                                        {
                                                                            current.day.current_day && (
                                                                                <div>
                                                                                    <div className="uk-button uk-button-primary" onClick={this.startTraining}>Начать тренировку</div>
                                                                                </div>
                                                                            )
                                                                        }
                                                                    </div>
                                                                    <div className="tm-button-workout-back" onClick={this.goToWeek}>← Вернуться к неделе</div>
                                                                </div>
                                                                <div className="uk-margin-medium-top tm-workouts-day-details">
                                                                    <div data-uk-grid>
                                                                        <div className="uk-width-2-5@s">
                                                                            <div dangerouslySetInnerHTML={{__html: current.day.description}} />
                                                                        </div>
                                                                        <div className="uk-width-3-5@s">
                                                                            <iframe
                                                                                width="100%"
                                                                                height="375"
                                                                                src={current.day.video}
                                                                                frameBorder="0"
                                                                                allow="autoplay; encrypted-media"
                                                                                allowFullScreen
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div data-uk-grid>
                                                                        <div className="uk-width-2-5@s">
                                                                            <h3 className="uk-h3 uk-text-bolder">Разминка</h3>
                                                                            <div dangerouslySetInnerHTML={{__html: current.day.stretch.description}} />
                                                                        </div>
                                                                        <div className="uk-width-3-5@s">
                                                                            <div dangerouslySetInnerHTML={{__html: current.day.stretch.video}} />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        )
                                                    }
                                                    {
                                                        current.step === 3 && (
                                                            <>
                                                                <div className="tm-workouts-header">
                                                                    <div className="uk-grid-small uk-flex uk-flex-middle" data-uk-grid>
                                                                        <div>
                                                                            <h1 className="uk-h1 uk-text-bolder">{current.training.name}</h1>
                                                                        </div>
                                                                    </div>
                                                                    <div className="tm-button-workout-back" onClick={this.goToWeek}>← Вернуться к неделе</div>
                                                                </div>
                                                                <div className="uk-margin-medium-top tm-workouts-day-details">
                                                                    <div data-uk-grid>
                                                                        <div className="uk-width-2-5@s">
                                                                            <div dangerouslySetInnerHTML={{__html: current.training.description}} />
                                                                            <div className="uk-margin-medium-top">
                                                                                <div className="tm-workouts-training-buttons">
                                                                                    <div className="tm-button-training-stop" data-uk-toggle="#tm-modal-workouts-training-stop">
                                                                                        <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                            <circle cx="28" cy="28" r="28" fill="#DD9D9D"/>
                                                                                            <path d="M48.039 17.3405L37.6595 6.96098C37.0398 6.34126 36.2159 6 35.3392 6H20.6608C19.7841 6 18.9602 6.34126 18.3405 6.96098L7.96098 17.3405C7.34126 17.9602 7 18.7844 7 19.6608V34.3392C7 35.2156 7.34126 36.0398 7.96098 36.6595L18.3405 47.039C18.9602 47.6587 19.7841 48 20.6604 48H35.3392C36.2156 48 37.0398 47.6587 37.6595 47.039L40.3989 44.2993C40.7193 43.9792 40.7193 43.4598 40.3989 43.1393C40.0788 42.8189 39.5594 42.8189 39.2389 43.1393L36.4992 45.8787C36.1897 46.1889 35.7776 46.3594 35.3392 46.3594H20.6608C20.2224 46.3594 19.8103 46.1886 19.5005 45.8787L9.12128 35.4995C8.81142 35.1897 8.64062 34.7776 8.64062 34.3392V19.6608C8.64062 19.2224 8.81142 18.8103 9.12096 18.5005L19.5005 8.12128C19.8103 7.81142 20.2224 7.64062 20.6604 7.64062H35.3392C35.7776 7.64062 36.1897 7.81142 36.4992 8.12128L46.8787 18.5005C47.1886 18.8103 47.3594 19.2224 47.3594 19.6608V34.3396C47.3594 34.7776 47.1886 35.1897 46.8787 35.4995L44.4594 37.9188C44.139 38.2392 44.139 38.7587 44.4594 39.0791C44.7796 39.3992 45.2993 39.3992 45.6194 39.0791L48.039 36.6595C48.6587 36.0398 49 35.2159 49 34.3396V19.6608C49 18.7844 48.6587 17.9602 48.039 17.3405Z" fill="#251716"/>
                                                                                            <path d="M24.2176 9.28125H21.0004C20.7829 9.28125 20.5742 9.36777 20.4204 9.52158L10.5216 19.4204C10.3678 19.5742 10.2812 19.7829 10.2812 20.0004V33.9996C10.2812 34.2171 10.3678 34.4258 10.5216 34.5796L20.4204 44.4784C20.5742 44.6322 20.7829 44.7188 21.0004 44.7188H34.9996C35.2171 44.7188 35.4258 44.6322 35.5796 44.4784L45.4784 34.5796C45.6322 34.4258 45.7188 34.2171 45.7188 33.9996V20.0004C45.7188 19.7829 45.6322 19.5742 45.4784 19.4204L35.5796 9.52158C35.4258 9.36777 35.2171 9.28125 34.9996 9.28125H31.6328C31.1797 9.28125 30.8125 9.64847 30.8125 10.1016C30.8125 10.5547 31.1797 10.9219 31.6328 10.9219H34.6599L44.0781 20.3401V33.6599L34.6599 43.0781H21.3401L11.9219 33.6599V20.3401L21.3401 10.9219H24.2176C24.6704 10.9219 25.0379 10.5547 25.0379 10.1016C25.0379 9.64847 24.6704 9.28125 24.2176 9.28125Z" fill="#251716"/>
                                                                                            <path d="M17.4802 23.665H19.4989C19.952 23.665 20.3192 23.2978 20.3192 22.8447C20.3192 22.3916 19.952 22.0244 19.4989 22.0244H17.4802C15.9145 22.0244 14.6411 23.2981 14.6411 24.8638V24.917C14.6411 26.4826 15.9145 27.756 17.4802 27.756C18.1412 27.756 18.6786 28.2937 18.6786 28.9548V29.1358C18.6786 29.7969 18.1409 30.3342 17.4802 30.3342H15.4614C15.0083 30.3342 14.6411 30.7018 14.6411 31.1546C14.6411 31.6076 15.0083 31.9749 15.4614 31.9749H17.4802C19.0458 31.9749 20.3192 30.7015 20.3192 29.1358V28.9548C20.3192 27.3891 19.0458 26.1154 17.4802 26.1154C16.8191 26.1154 16.2817 25.5777 16.2817 24.917V24.8638C16.2817 24.2027 16.8194 23.665 17.4802 23.665Z" fill="#251716"/>
                                                                                            <path d="M37.6492 31.1549V27.9896H38.7044C40.3488 27.9896 41.687 26.6518 41.687 25.007C41.687 23.3625 40.3488 22.0244 38.7044 22.0244H36.8289C36.3758 22.0244 36.0085 22.3916 36.0085 22.8447V31.1549C36.0085 31.608 36.3758 31.9752 36.8289 31.9752C37.282 31.9752 37.6492 31.608 37.6492 31.1549ZM37.6492 23.665H38.7044C39.4446 23.665 40.0463 24.2671 40.0463 25.007C40.0463 25.7469 39.4446 26.349 38.7044 26.349H37.6492V23.665Z" fill="#251716"/>
                                                                                            <path d="M24.1357 31.9752C24.5888 31.9752 24.956 31.608 24.956 31.1549V23.665H26.1547C26.6078 23.665 26.9751 23.2978 26.9751 22.8447C26.9751 22.3916 26.6078 22.0244 26.1547 22.0244H22.1169C21.6638 22.0244 21.2966 22.3916 21.2966 22.8447C21.2966 23.2978 21.6638 23.665 22.1169 23.665H23.3154V31.1549C23.3154 31.608 23.6826 31.9752 24.1357 31.9752Z" fill="#251716"/>
                                                                                            <path d="M28.5735 29.1358C28.5735 30.7015 29.8472 31.9752 31.4125 31.9752C32.9782 31.9752 34.2519 30.7015 34.2519 29.1358V24.8638C34.2519 23.2981 32.9782 22.0244 31.4125 22.0244C29.8472 22.0244 28.5735 23.2981 28.5735 24.8638V29.1358ZM30.2141 24.8638C30.2141 24.2027 30.7518 23.665 31.4125 23.665C32.0736 23.665 32.6113 24.2027 32.6113 24.8638V29.1358C32.6113 29.7969 32.0736 30.3346 31.4125 30.3346C30.7518 30.3346 30.2141 29.7969 30.2141 29.1358V24.8638Z" fill="#251716"/>
                                                                                            <path d="M28.7531 9.78835C28.6234 9.47176 28.2965 9.26508 27.9546 9.28335C27.6214 9.30097 27.3272 9.52271 27.2192 9.83834C27.1077 10.1645 27.2199 10.5394 27.4932 10.75C27.7633 10.9579 28.1382 10.9762 28.4285 10.7977C28.7656 10.5907 28.905 10.153 28.7531 9.78835Z" fill="black"/>
                                                                                            <path d="M43.3751 40.8424C43.2409 40.52 42.9079 40.3127 42.559 40.338C42.219 40.3627 41.9236 40.604 41.8294 40.9315C41.7348 41.2599 41.8614 41.6249 42.1405 41.8229C42.4167 42.0193 42.7907 42.0254 43.0733 41.8383C43.3966 41.6239 43.5216 41.1993 43.3751 40.8424Z" fill="#251716"/>
                                                                                        </svg>
                                                                                    </div>
                                                                                    <div className="uk-margin-top">
                                                                                        <div className="uk-button uk-button-default uk-margin-right" onClick={this.actionTrainingSkip}>
                                                                                            Пропустить
                                                                                        </div>
                                                                                        <div className="uk-button uk-button-primary" data-uk-toggle="target: #tm-modal-workouts-training-done;">
                                                                                            Выполнено
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="uk-width-3-5@s">
                                                                            <div dangerouslySetInnerHTML={{__html: current.training.video}} />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        )
                                                    }
                                                </>
                                            )
                                        }
                                        {
                                            current.type === 2 && (
                                                <div className="uk-width-2-3@s uk-margin-top">
                                                    <ul data-uk-tab="connect: .tm-switcher-archive-week;" style={{width: "500px"}}>
                                                        {
                                                            archive.map((archiveItem, index) => (
                                                                <li className={index === archive.length - 1 ? 'uk-active' : ''} key={index}><a href="#">{archiveItem.name}</a></li>
                                                            ))
                                                        }
                                                    </ul>
                                                    <div className="tm-workouts-archive-days">
                                                        <ScrollContainer className="scroll-container">
                                                            <ul data-uk-tab="connect: .tm-switcher-archive-day;" style={{width: "500px"}}>
                                                                {
                                                                    workouts.days.map((dayItem, key) => (
                                                                        <li key={key}><a href="#">{dayItem.name}</a></li>
                                                                    ))
                                                                }
                                                            </ul>
                                                        </ScrollContainer>
                                                        <div className="uk-margin-medium-top">
                                                            <ul className="uk-switcher tm-switcher-archive-week">
                                                                {
                                                                    archive.map((archiveItem, index) => (
                                                                        <li key={index} className={`${index + 1 === archive.length ? 'uk-active' : ''} tm-archive-trainings-list`}>
                                                                            <ul className="uk-switcher tm-switcher-archive-day">
                                                                                {
                                                                                    archiveItem.days.map((dayItem, index) => (
                                                                                        <li className={index === 0 ? 'uk-active' : ''} key={index}>
                                                                                            <div className="uk-text-small uk-margin-small-bottom">
                                                                                                Оценка за день: {dayItem.score}
                                                                                            </div>
                                                                                            <div className="uk-grid-small uk-child-width-1-2@s" data-uk-grid>
                                                                                                {
                                                                                                    dayItem.trainings.map((trainingItem, index) => (
                                                                                                        <div key={index}>
                                                                                                            <div className="tm-archive-trainings-list-item">
                                                                                                                <div className="uk-grid-small" data-uk-grid>
                                                                                                                    <div className="uk-width-expand">
                                                                                                                        <div className="tm-name">{trainingItem.name}</div>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                                <div>
                                                                                                                    {
                                                                                                                        trainingItem.results.map((resultItem, index) => (
                                                                                                                            <div key={index}>
                                                                                                                                <span style={{color: 'rgba(37, 23, 22, 0.6)'}}>Надо: </span>
                                                                                                                                <span>
                                                                                                                                    {
                                                                                                                                        trainingItem.repeat > 0 ? trainingItem.repeat : trainingItem.seconds
                                                                                                                                    }
                                                                                                                                </span>
                                                                                                                                <span className="uk-margin-left" style={{color: 'rgba(37, 23, 22, 0.6)'}}>Вы сделали: </span>
                                                                                                                                <span>
                                                                                                                                    {
                                                                                                                                        trainingItem.repeat > 0 ? resultItem.repeat : resultItem.seconds
                                                                                                                                    }
                                                                                                                                </span>
                                                                                                                                <span className="uk-margin-left" style={{color: 'rgba(37, 23, 22, 0.6)'}}>Оценка: </span>
                                                                                                                                <span>
                                                                                                                                    {resultItem.score}
                                                                                                                                </span>
                                                                                                                            </div>
                                                                                                                        ))
                                                                                                                    }
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    ))
                                                                                                }
                                                                                            </div>
                                                                                        </li>
                                                                                    ))
                                                                                }
                                                                            </ul>
                                                                        </li>
                                                                    ))
                                                                }
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        }
                                    </div>
                                )
                            }
                            </>
                        )
                    }
                </div>
                <div>
                    <div id="tm-modal-workouts-training-circle" className="uk-flex-top" data-uk-modal="stack: true;">
                        <div className="uk-modal-dialog uk-margin-auto-vertical uk-width-1-3@s">
                            <button className="uk-modal-close-full uk-close-large" type="button" data-uk-close />
                            <div className="uk-padding uk-text-center">
                                <h5 className="uk-h5 uk-text-bolder uk-margin-remove">Вы выполнили упражнение</h5>
                                <div>Передохните немного перед началам нового круга</div>
                                <div className="uk-margin-medium-top">
                                    <div className="uk-button uk-button-primary uk-modal-close">Продолжить</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="tm-modal-workouts-training-done" className="uk-flex-top" data-uk-modal="stack: true;">
                        <div className="uk-modal-dialog uk-margin-auto-vertical uk-width-1-3@s">
                            <button className="uk-modal-close-full uk-close-large" type="button" data-uk-close />
                            <div className="uk-padding uk-text-center">
                                <h5 className="uk-h5 uk-text-bolder uk-margin-remove">Вы выполнили упражнение</h5>
                                <div>{current.training.name}</div>
                                <div className="uk-margin-medium" data-uk-grid>
                                    <div className="uk-width-expand uk-text-left">
                                        {
                                            current.training.repeat > 0 && (
                                                'Укажите количество сделанных вами повторений'
                                            )
                                        }
                                        {
                                            current.training.seconds > 0 && (
                                                'Укажите количество затраченных секунд'
                                            )
                                        }
                                    </div>
                                    <div className="uk-width-auto">
                                        <input type="text" className="uk-input" name={current.training.repeat ? 'repeat' : 'seconds'} style={{width: '100px'}} ref={input => this.refResult = input} onChange={this.changeField} />
                                    </div>
                                </div>
                                <div className="uk-button uk-button-primary" onClick={this.actionTrainingDone}>ОК</div>
                            </div>
                        </div>
                    </div>
                    <div id="tm-modal-workouts-training-stop" className="uk-flex-top" data-uk-modal="stack: true;">
                        <div className="uk-modal-dialog uk-margin-auto-vertical uk-width-1-3@s">
                            <button className="uk-modal-close-full uk-close-large" type="button" data-uk-close />
                            <div className="uk-padding uk-text-center">
                                <h5 className="uk-h5 uk-text-bolder uk-margin-remove">Вы действительно хотите<br /> прекратить тренировку?</h5>

                                <div className="uk-margin-medium-top">
                                    <div className="uk-button uk-button-default uk-margin-small-right" style={{minWidth: 50}} onClick={() => (UIkit.modal('#tm-modal-workouts-training-stop').hide())}>Нет</div>
                                    <div className="uk-button uk-button-primary uk-margin-small-left" style={{minWidth: 50}} onClick={this.actionTrainingStop}>Да</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="tm-modal-workouts-description" className="uk-modal-full" data-uk-modal="stack: true;">
                        <div className="uk-modal-dialog" style={{minHeight: '100vh'}}>
                            <button className="uk-modal-close-full uk-close-large" type="button" data-uk-close />
                            <div className="uk-padding-large">
                                <h1>Описание тренировки</h1>
                                <p dangerouslySetInnerHTML={{__html: workouts.week.description}} />
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
        );
    }
}

const mapStateToProps = state => state;
export default connect(mapStateToProps)(Workouts);
