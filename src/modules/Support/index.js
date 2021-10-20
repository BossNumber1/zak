import React from 'react';
import store from "../../utils/store";
import {connect} from "react-redux";
import UIkit from "uikit";
import parseJson from "../Chat";

class Support extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            specialists: []
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

        store.dispatch({
            type: "CHANGE_PAGE",
            payload: {
                body: {
                    class: "tm-page-support"
                },
                header: {
                    navigation: true,
                    title: "Специалисты"
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
        this.actionGetSpecialists();

        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            this.props.history.push('/signin');
        }
    };

    actionCreateChat = (specialistId) => {
        const accessToken = localStorage.getItem("accessToken");

        fetch( 'https://api-academy.zubareva.online/api/chat/call', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : accessToken
            },
            body: JSON.stringify({
                command: "create_chat",
                params: {
                    token: accessToken,
                    user_id: this.props.profile.id,
                    user_ids: [specialistId],
                }
            })
        })
        .then(res => res.json())
        .then(
            (result) => {
                store.dispatch({
                    type: "TOGGLE_CHAT",
                    payload: {
                        isOpen: true,
                        current: {
                            step: 2,
                            id: result.answer.id,
                            specialist: {
                                id: specialistId
                            }
                        }
                    }
                });
            },(error) => {
                console.log(error)
            }
        );
    };

    actionGetSpecialists = () => {
        const accessToken = localStorage.getItem("accessToken");

        fetch( 'https://api-academy.zubareva.online/api/specialists/list', {
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
                    specialists: result.list
                })
            },(error) => {
                console.log(error)
            }
        );
    };


    render() {
        const { specialists } = this.state;

        return (
            <div className="tm-container-support">
                <div className="uk-container uk-container-large uk-section">
                    <div className="uk-hidden@m">
                        <h2 className="uk-h2" style={{fontWeight: 700}}>Специалисты</h2>
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
                            <div className="tm-support-list">
                                {
                                    specialists.map((specialistItem) => (
                                        <div className="tm-support-list-item uk-width-1-3@s" onClick={() => (this.actionCreateChat(specialistItem.id))}>
                                            <div className="uk-flex uk-flex-middle" data-uk-grid>
                                                <div className="uk-width-auto">
                                                    <div className="tm-picture">
                                                        <img src={specialistItem.photo} alt="" />
                                                    </div>
                                                </div>
                                                <div className="uk-width-expand">
                                                    <h4 className="uk-h4 uk-text-bolder uk-margin-remove">{specialistItem.name} {specialistItem.last_name}</h4>
                                                    <div className="tm-position">{specialistItem.position}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        )
                    }
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => state;
export default connect(mapStateToProps)(Support);
