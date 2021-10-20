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

        console.log(workouts)
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

                        </div>
                    </div>
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
                                    <>
                                        <ScrollContainer className="scroll-container">
                                            <ul data-uk-tab="connect: .tm-switcher-archive-season;" style={{width: "500px"}}>
                                                {
                                                    this.state.workouts.days.map((dayItem, key) => (
                                                        <li key={key}><a href="#">{dayItem.name}</a></li>
                                                    ))
                                                }
                                            </ul>
                                        </ScrollContainer>
                                        <div className="uk-width-2-3@s">
                                            <ul className="uk-switcher tm-switcher-archive-season">
                                                {
                                                    this.state.workouts.days.length > 0 && (
                                                        this.state.workouts.days.map((dayItem, key) => (
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
                            </>
                        )
                    }
                </div>
                <div>
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
