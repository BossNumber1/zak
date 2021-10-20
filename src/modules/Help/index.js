import React from 'react';
import store from '../../utils/store';
import {connect} from "react-redux";
import ScrollContainer from 'react-indiana-drag-scroll'

import UIkit from 'uikit';

class Help extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoaded: false,
            questionSections: [],
            seasons: [],
            season: [],
            current: []
        };
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

        const accessToken = localStorage.getItem("accessToken");

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
                this.setState({
                    seasons: result.list,
                    season: result.list[0]
                })
            },(error) => {
                console.log(error)
            }
        );

        if (this.props.seasonState.id === 1) {
            this.actionGetHelp();
        }

        store.dispatch({
            type: "CHANGE_PAGE",
            payload: {
                body: {
                    class: "tm-page-help"
                },
                header: {
                    navigation: true,
                    title: "Помощь"
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

    actionGetHelp = () => {
        const accessToken = localStorage.getItem("accessToken");

        fetch( `https://api-academy.zubareva.online/api/help/questions?season_id=${this.state.current.seasonId}`, {
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
                    questionSections: result.list
                });
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

            await this.actionGetHelp();
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

    render() {
        const { isLoaded, questionSections, seasons, season } = this.state;

        return (
            <div className="tm-container-help">
                <div className="uk-container uk-section">
                    <div className="uk-hidden@m uk-flex uk-flex-middle">
                        <h2 className="uk-h2 uk-margin-remove" style={{fontWeight: 700}}>Помощь</h2>
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
                    {
                        (this.props.seasonState.id === 0 && this.props.seasonState.has === 1 && questionSections.length === 0) && (
                            <div className="tm-wrapper-plug">
                                <h3 className="uk-3">Ожидайте начала сезона</h3>
                                <div>{this.props.seasonState.date}</div>
                            </div>
                        )
                    }
                    {
                        (this.props.seasonState.id === 0 && this.props.seasonState.has === 0 && questionSections.length === 0) && (
                            <div className="tm-wrapper-plug">
                                <h3 className="uk-3">Мы не обнаружили у вас сезона</h3>
                                <a href="https://off-slender.zubareva.online" target="_blank" className="uk-button uk-button-primary" rel="noreferrer">Купить</a>
                                <a href="https://wa.me/79182611437?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5%2C%20%D1%83%20%D0%BC%D0%B5%D0%BD%D1%8F%20%D0%B2%D0%BE%D0%BF%D1%80%D0%BE%D1%81%20%D0%BF%D0%BE%20%D0%BC%D0%B0%D1%80%D0%B0%D1%84%D0%BE%D0%BD%D1%83%2C%20" target="_blank" className="uk-button uk-button-default uk-margin-left" rel="noreferrer">Техническая поддержка</a>
                            </div>
                        )
                    }
                    {
                        seasons.length > 0 && (
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
                        )
                    }
                    {
                        isLoaded ? (
                            <div className="uk-margin-medium-top">
                                <ScrollContainer className="scroll-container">
                                    <ul data-uk-tab="connect: .uk-switcher;" style={{width: 571}}>
                                        {
                                            questionSections.map((item, key) => (
                                                <li key={key}><a href="#">{item.name}</a></li>
                                            ))
                                        }
                                    </ul>
                                </ScrollContainer>
                                <div className="uk-width-2-3@m">
                                    <ul className="uk-switcher uk-margin-medium-top">
                                        {
                                            questionSections.map((questionSection, key) => (
                                                <li key={key}>
                                                    <ul data-uk-accordion>
                                                        {
                                                            questionSection.questions.map((item, key) => (
                                                                <li key={key}>
                                                                    <a className="uk-accordion-title" href="#">{item.question}</a>
                                                                    <div className="uk-accordion-content">
                                                                        <p dangerouslySetInnerHTML={{__html: item.answer}} />
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
                        ) : ''
                    }
                </div>
                <div id="tm-modal-change-course" className="uk-flex-top" data-uk-modal="stack: true;">
                    <div className="uk-modal-dialog uk-margin-auto-vertical uk-width-1-3@s">
                        <button className="uk-modal-close-full uk-close-large" type="button" data-uk-close />
                        <div className="uk-padding-large uk-text-center">
                            <h3 className="uk-h3 uk-text-bolder">Выбрать курс</h3>
                            <div className="uk-text-center">
                                <select className="uk-select uk-width-1-2" onChange={(e) => this.changeSeason(e)}>
                                    <option value="">Выберите курс</option>
                                    {
                                        seasons.map((seasonItem, key) => (
                                            <option key={key} value={seasonItem.id}>{seasonItem.season_date}</option>
                                        ))
                                    }
                                </select>
                            </div>
                            <div className="uk-margin-medium-top">
                                <div className="uk-button uk-button-primary uk-modal-close">Ок</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => state;
export default connect(mapStateToProps)(Help);
