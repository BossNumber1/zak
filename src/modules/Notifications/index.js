import React from 'react';
import { Link } from "react-router-dom";
import store from "../../utils/store";
import { connect } from "react-redux";
import UIkit from "uikit";

class Notifications extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoaded: true
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

        store.dispatch({
            type: "CHANGE_PAGE",
            payload: {
                body: {
                    class: "tm-page-notification"
                },
                header: {
                    navigation: true,
                    title: "Уведомления"
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

    toggleChat = (notificationId, chatId, specialist) => {
        this.actionNotificationRead(notificationId);

        store.dispatch({
            type: "TOGGLE_CHAT",
            payload: {
                isOpen: true,
                current: {
                    step: 2,
                    id: chatId,
                    specialist: {
                        id: specialist.id
                    }
                }
            }
        });
    };

    toogleNews = (notificationId, newsId, commentId) => {
        this.actionNotificationRead(notificationId);
        this.props.history.push(`/news/${newsId}?commentId=${commentId}`);
        //this.props.history.push(`/news/${newsId}`);
    };

    actionNotificationRead = (notificationId) => {
        const accessToken = localStorage.getItem("accessToken");

        fetch( 'https://api-academy.zubareva.online/api/notifications/read', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : accessToken
            },
            body: JSON.stringify({
                ids: [notificationId]
            })
        })
        .then(res => res.json())
        .then(
            (result) => {

            },(error) => {
                console.log(error)
            }
        );
    };

    render() {
        const { isLoaded } = this.state;
        const notifications = this.props.notifications.list

        return (
            <div className="tm-container-notifications">
                <div className="uk-container uk-container-large uk-section">
                    <div className="uk-hidden@m">
                        <h2 className="uk-h2" style={{fontWeight: 700}}>Уведомления</h2>
                    </div>
                    {
                        isLoaded ? (
                            <div className="tm-notifications-list">
                                <div className="uk-child-width-1-2@s" data-uk-grid>
                                    {
                                        notifications.length > 0 && notifications.map((notification, key) => (
                                            <div key={key}>
                                                {
                                                    notification.news_id && (
                                                        <div onClick={() => this.toogleNews(notification.id, notification.news_id, notification.comment_id)} className="tm-notification-item">
                                                            <div className="uk-grid-column-small" data-uk-grid>
                                                                <div className="uk-width-auto">
                                                                    <div className="tm-notification-profile-avatar">
                                                                        <img src={notification.from.photo} alt="" />
                                                                    </div>
                                                                </div>
                                                                <div className="uk-width-expand">
                                                                    <h5 className="uk-h5 uk-margin-small-bottom" style={{fontWeight: 700}}>
                                                                        {notification.from.name} {notification.from.last_name}
                                                                    </h5>
                                                                    <div className="tm-notification-text">{notification.message}</div>
                                                                    <div className="uk-margin-top">{notification.date}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                                {
                                                    notification.chat_id && (
                                                        <div className="tm-notification-item" onClick={() => this.toggleChat(notification.id, notification.chat_id, notification.from)}>
                                                            <div className="uk-grid-column-small" data-uk-grid>
                                                                <div className="uk-width-auto">
                                                                    <div className="tm-notification-profile-avatar">
                                                                        <img src={notification.from.photo} alt="" />
                                                                    </div>
                                                                </div>
                                                                <div className="uk-width-expand">
                                                                    <h5 className="uk-h5 uk-margin-small-bottom" style={{fontWeight: 700}}>
                                                                        {notification.from.name} {notification.from.last_name}
                                                                    </h5>
                                                                    <div className="tm-notification-text">{notification.message}</div>
                                                                    <div className="uk-margin-top">{notification.date}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        ) : ('')
                    }
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => state;
export default connect(mapStateToProps)(Notifications);
