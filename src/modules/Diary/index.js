import React from 'react';
import DatePicker from 'react-date-picker';
import store from "../../utils/store";
import {connect} from "react-redux";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import UIkit from "uikit";

const data = [
    {
        name: 'Page A',
        uv: 4000,
        pv: 2400,
        amt: 2400,
    },
    {
        name: 'Page B',
        uv: 3000,
        pv: 1398,
        amt: 2210,
    },
    {
        name: 'Page C',
        uv: 2000,
        pv: 9800,
        amt: 2290,
    },
    {
        name: 'Page D',
        uv: 2780,
        pv: 3908,
        amt: 2000,
    },
    {
        name: 'Page E',
        uv: 1890,
        pv: 4800,
        amt: 2181,
    },
    {
        name: 'Page F',
        uv: 2390,
        pv: 3800,
        amt: 2500,
    },
    {
        name: 'Page G',
        uv: 3490,
        pv: 4300,
        amt: 2100,
    },
];

const diaryDurations = [
    "6М", "3М", "1М", "1Н"
];

class Diary extends React.Component {
    constructor(props) {
        super(props);

        const currentDate = new Date();
        let currentDay = currentDate.getDate();
        let currentMonth = currentDate.getMonth() + 1;
        let currentYear = currentDate.getFullYear();

        if (currentDay < 10) {
            currentDay = '0' + currentDay;
        }

        if (currentMonth < 10) {
            currentMonth = '0' + currentMonth;
        }

        this.state = {
            isLoaded: false,
            todayDate: currentDate,
            current: {
                duration: 2
            },
            createDiary: {
                date: currentDay+'.'+currentMonth+'.'+currentYear,
                weight: null
            },
            diary: {
                days: []
            }
        }
    }

    componentDidMount() {
        let modalTrainingDone = document.getElementById('tm-modal-workouts-training-done');
        let modalTrainingCircle = document.getElementById('tm-modal-workouts-training-circle');

        if (modalTrainingDone) {
            modalTrainingDone.parentNode.removeChild(modalTrainingDone);
        }

        if (modalTrainingCircle) {
            modalTrainingCircle.parentNode.removeChild(modalTrainingCircle);
        }

        this.actionGetDiary('month');

        store.dispatch({
            type: "CHANGE_PAGE",
            payload: {
                body: {
                    class: "tm-page-diary"
                },
                header: {
                    navigation: true,
                    title: "Дневник веса"
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
    }

    componentWillMount() {
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            this.props.history.push('/signin');
        }
    }

    changeField = (e) => {
        this.setState({
            createDiary: {
                ...this.state.createDiary,
                [e.target.name]: e.target.value
            }
        })
    };

    changeFieldDatepicker = (value) => {
        const currentDate = new Date(value);
        let currentDay = currentDate.getDate();
        let currentMonth = currentDate.getMonth() + 1;
        let currentYear = currentDate.getFullYear();

        if (currentDay < 10) {
            currentDay = '0' + currentDay;
        }

        if (currentMonth < 10) {
            currentMonth = '0' + currentMonth;
        }

        this.setState({
            todayDate: currentDate,
            createDiary: {
                ...this.state.createDiary,
                date: currentDay+'.'+currentMonth+'.'+currentYear
            }
        })
    };

    actionGetDiary = (filter) => {
        const accessToken = localStorage.getItem("accessToken");

        fetch( `https://api-academy.zubareva.online/api/diary_weight/get?filter=${filter}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : accessToken
            }
        })
        .then(res => res.json())
        .then(
            (result) => {
                const days = result.days;

                this.setState({
                    isLoaded: true,
                    diary: {
                        ...result,
                        days: result.days.map((diaryDay) => {
                            return({uv: diaryDay.weight, name: diaryDay.date.split('.')[0]})
                        }),
                    }
                })
            },(error) => {
                console.log(error)
            }
        );
    };

    actionCreateDiary = () => {
        const accessToken = localStorage.getItem("accessToken");

        fetch( "https://api-academy.zubareva.online/api/diary_weight/add", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : accessToken
            },
            body: JSON.stringify(this.state.createDiary)
        })
        .then(res => res.json())
        .then(
            (result) => {
                this.actionGetDiary('month');
            },(error) => {
                console.log(error)
            }
        );
    };

    async changeDiaryDuration(duration) {
        let durations = ['6months', '3months', 'month', 'week']

        await this.setState({
            current: {
                ...this.state.current,
                duration: duration
            }
        });

        this.actionGetDiary(durations[duration]);
    };

    render() {
        const { isLoaded, current, diary } = this.state;
        const convertYAxis = value => value;

        return (
            <div className="tm-container-rating">
                <div className="uk-container uk-section">
                    <div className="uk-hidden@m">
                        <h2 className="uk-h2" style={{fontWeight: 700}}>Дневник веса</h2>
                    </div>
                    {
                        (this.props.seasonState.id === 0 && this.props.seasonState.has === 1) && (
                            <div className="tm-wrapper-plug">
                                <h3 className="uk-3">Ожидайте начала сезона</h3>
                                <div>{this.props.seasonState.date}</div>
                            </div>
                        )
                    }
                    {
                        (this.props.seasonState.id === 0 && this.props.seasonState.has === 0) && (
                            <div className="tm-wrapper-plug">
                                <h3 className="uk-3">Мы не обнаружили у вас сезона</h3>
                                <a href="https://off-slender.zubareva.online" target="_blank" className="uk-button uk-button-primary">Купить</a>
                                <a href="https://wa.me/79182611437?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5%2C%20%D1%83%20%D0%BC%D0%B5%D0%BD%D1%8F%20%D0%B2%D0%BE%D0%BF%D1%80%D0%BE%D1%81%20%D0%BF%D0%BE%20%D0%BC%D0%B0%D1%80%D0%B0%D1%84%D0%BE%D0%BD%D1%83%2C%20" target="_blank" className="uk-button uk-button-default uk-margin-left">Техническая поддержка</a>
                            </div>
                        )
                    }
                    {
                        (this.props.seasonState.id === 1 && isLoaded) && (
                            <div>
                                <div className="uk-visible@m tm-diary-header-button">
                                    <div className="uk-button uk-button-primary" data-uk-toggle="target: #tm-modal-diary-add;">+Добавить вес</div>
                                </div>
                                <div className="uk-margin-medium-bottom uk-width-2-5@s">
                                    <div className="tm-diary-summary">
                                        <h5 className="uk-h5 uk-text-bolder uk-text-center">Данные от {diary.day.date}</h5>
                                        <div className="uk-grid-collapse uk-child-width-expand uk-text-center" data-uk-grid>
                                            <div>
                                                <div className="uk-text-small" style={{color: 'rgba(37, 23, 22, 0.6)'}}>Текущий вес</div>
                                                <div>{diary.day.weight} кг</div>
                                            </div>
                                            <div>
                                                <div className="uk-text-small" style={{color: 'rgba(37, 23, 22, 0.6)'}}>Изменение веса</div>
                                                <div>{diary.day.diff} кг</div>
                                            </div>
                                            <div>
                                                <div className="uk-text-small" style={{color: 'rgba(37, 23, 22, 0.6)'}}>ИМТ</div>
                                                <div>{diary.day.imt}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="uk-margin-medium-bottom uk-width-2-5@s">
                                    <div className="tm-diary-duration">
                                        {
                                            diaryDurations.map((value, index) => (
                                                <div className={index === current.duration ? 'uk-active' : ''} onClick={() => this.changeDiaryDuration(index)}>{value}</div>
                                            ))
                                        }
                                    </div>
                                </div>
                                {
                                    diary.days && (
                                        <div className="uk-margin-medium">
                                            <AreaChart width={545} height={250} data={diary.days}>
                                                <defs>
                                                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="50%" stopColor="#FAF6F2" stopOpacity={0.8}/>
                                                        <stop offset="100%" stopColor="#FAF6F2" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <XAxis dataKey="name" />
                                                <YAxis tickFormatter={convertYAxis}  />
                                                <Tooltip />
                                                <Area type="monotone" dataKey="uv" stroke="#DD9D9D" fillOpacity={1} fill="url(#colorUv)" dot />
                                            </AreaChart>
                                        </div>
                                    )
                                }
                                <div id="tm-modal-diary-add" className="uk-flex-top" data-uk-modal="stack: true;">
                                    <div className="uk-modal-dialog uk-margin-auto-vertical uk-width-1-3@s">
                                        <button className="uk-modal-close-full uk-close-large" type="button" data-uk-close />
                                        <div className="uk-padding">
                                            <h5 className="uk-h5 uk-text-bolder uk-text-center">Новое значение</h5>
                                            <div className="uk-child-width-1-2" data-uk-grid>
                                                <div>
                                                    <label className="uk-form-label">Дата</label>
                                                    <DatePicker
                                                        value={this.state.todayDate}
                                                        format={'dd.MM.yyyy'}
                                                        clearIcon={null}
                                                        onChange={this.changeFieldDatepicker}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="uk-form-label">Вес</label>
                                                    <input type="text" name="weight" className="uk-input" onChange={this.changeField} />
                                                </div>
                                            </div>
                                            <div className="uk-margin-medium-top uk-text-center">
                                                <div className="uk-button uk-button-default uk-margin-small-right uk-modal-close">Отменить</div>
                                                <div className="uk-button uk-button-primary uk-margin-small-left uk-modal-close" onClick={this.actionCreateDiary}>Подтвердить</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="uk-hidden@m uk-text-center">
                                    <div className="uk-button uk-button-primary" data-uk-toggle="target: #tm-modal-diary-add;">+Добавить вес</div>
                                </div>
                            </div>
                        )}
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => state;
export default connect(mapStateToProps)(Diary);
