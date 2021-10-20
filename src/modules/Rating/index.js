import React from 'react';
import store from "../../utils/store";
import {connect} from "react-redux";
import UIkit from "uikit";

class Rating extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            ratings: []
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

        store.dispatch({
            type: "CHANGE_PAGE",
            payload: {
                body: {
                    class: "tm-page-rating"
                },
                header: {
                    navigation: true,
                    title: "Рейтинг"
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

        fetch( `https://api-academy.zubareva.online/api/rating/topballs`, {
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
                    ratings: result.list
                })
            },(error) => {
                console.log(error)
            }
        );
    }

    render() {
        const { ratings } = this.state;

        return (
            <div className="tm-container-rating">
                <div className="uk-container uk-container-large uk-section">
                    <div className="uk-hidden@m">
                        <h2 className="uk-h2" style={{fontWeight: 700}}>Рейтинг</h2>
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
                        this.props.seasonState.id === 1 && (
                            <div className="uk-grid-column-large" data-uk-grid>
                        <div className="uk-width-3-5@s">
                            <table className="uk-table uk-table-small uk-table-hover">
                                <thead>
                                    <tr>
                                        <th>Место</th>
                                        <th>Баллы</th>
                                        <th>Фамилия</th>
                                        <th>Имя</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {
                                    ratings.length > 0 ? (
                                        ratings.map((ratingItem) => (
                                            <tr style={{background: ratingItem.me ? '#DD9D9D' : '', color: ratingItem.me ? '#FFF' : ''}}>
                                                <td>
                                                    <div className="uk-flex uk-flex-middle uk-text-center" style={{width: 24, height: 24, background: ratingItem.index === 1 ? '#FEDD6A' : ratingItem.index === 2 ? '#EEEEEE' : ratingItem.index === 3 ? '#FFC895' : '', borderRadius: 50, justifyContent: "center"}}>{ratingItem.index}</div>
                                                </td>
                                                <td>{ratingItem.balls}</td>
                                                <td>{ratingItem.last_name}</td>
                                                <td>{ratingItem.name}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan={4}>Ожидайте формирования рейтинга.</td></tr>
                                    )
                                }
                                </tbody>
                            </table>
                        </div>
                    </div>
                        )
                    }
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => state;
export default connect(mapStateToProps)(Rating);
