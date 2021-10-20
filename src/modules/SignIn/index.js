import React from 'react';
import { connect } from "react-redux";
import store from "../../utils/store";

class SignIn extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            onError: {
                email: false,
                emailRestore: false,
                password: false
            },
            signIn: [],
            restorePassword: {
                email: null
            },
            restoreStatus: false
        };

        this.changeField = this.changeField.bind(this);
        this.actionSignIn = this.actionSignIn.bind(this);
        this.initProfile = this.initProfile.bind(this);
        this.changeFieldRestorePassword = this.changeFieldRestorePassword.bind(this);
    }

    componentDidMount() {
        const accessToken = localStorage.getItem("accessToken");
        const sid = localStorage.getItem("sid");

        store.dispatch({
            type: "CHANGE_PAGE_TO_SIGNIN",
            payload: {
                body: {
                    class: "tm-page-signin"
                },
                header: {
                    navigation: false,
                    title: null
                }
            }
        });

        store.dispatch({
            type: "TOGGLE_CHAT",
            payload: {
                isOpen: false
            }
        });
    }

    componentDidUpdate() {
        if (this.props.profile.id) {
            this.props.history.push('/news');
        }
    }

    componentWillMount() {
        const accessToken = localStorage.getItem("accessToken");

        if (accessToken) {
            this.props.history.push('/news');
        }
    }

    changeField = (e) => {
        this.setState({
            signIn: {
                ...this.state.signIn,
                [e.target.name]: e.target.value
            }
        })
    };

    changeFieldRestorePassword = (e) => {
        this.setState({
            restorePassword: {
                email: e.target.value
            }
        })
    };

    actionRestorePassword = () => {
        fetch( "https://api-academy.zubareva.online/api/auth/restore", {
            method: 'POST',
            body: JSON.stringify(this.state.restorePassword)
        })
        .then(res => res.json())
        .then(
            (result) => {
                if (result.message) {
                    this.setState({
                        onError: {
                            ...this.state.onError,
                            emailRestore: true
                        }
                    });
                }
                else {
                    this.setState({
                        restoreStatus: true
                    })
                }
            },(error) => {
                console.log(error)
            }
        );
    };

    actionSignIn = () => {
        fetch( "https://api-academy.zubareva.online/api/auth/login", {
            method: 'POST',
            body: JSON.stringify(this.state.signIn)
        })
        .then(res => res.json())
        .then(
            (result) => {
                if (!result.message) {
                    localStorage.setItem("sid", result.id);
                    localStorage.setItem("accessToken", result.access_token);

                    this.initProfile(result.id, result.access_token);
                }
                else{
                    if (result.message === 'bad_input') {
                        this.setState({
                            onError: {
                                email: true,
                                password: true
                            }
                        });
                    }

                    if (result.message === 'bad_password') {
                        this.setState({
                            onError: {
                                email: false,
                                password: true
                            }
                        });
                    }

                    if (result.message === 'user_not_exists') {
                        this.setState({
                            onError: {
                                email: true,
                                password: true
                            }
                        });
                    }
                }
            },(error) => {
                console.log(error)
            }
        );
    };

    async actionSeasonState() {
        const accessToken = localStorage.getItem("accessToken");

        await fetch( `https://api-academy.zubareva.online/api/profile/season_state`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : accessToken
            }
        })
        .then(res => res.json())
        .then(
            (result) => {
                store.dispatch({
                    type: "SEASON_STATE",
                    payload: {
                        id: this.state.profile.season.id,
                        has: result.has_season,
                        date: result.season.length > 0 ? result.season.date.split(' ')[0] : null
                    }
                });
            },(error) => {
                console.log(error)
            }
        );
    };

    initProfile = (sid, accessToken) => {
        fetch( `https://api-academy.zubareva.online/api/profile/get?id=${sid}`, {
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
                    profile: result
                });

                store.dispatch({
                    type: "AUTHORIZATION",
                    payload: result
                });

                if (result.season.id === 0) {
                    this.actionSeasonState();
                }
                else {
                    store.dispatch({
                        type: "SEASON_STATE",
                        payload: {
                            id: 1,
                            has: 1,
                            date: 1
                        }
                    });
                }

                if(result.age && result.weight && result.target) {
                    this.props.history.push('/news');
                }
                else{
                    this.props.history.push('/profile');
                }
            },(error) => {
                console.log(error)
            }
        );
    };

    render() {
        return (
            <div className="uk-container uk-section">
                <div className="tm-container-signin">
                    <div className="uk-grid-column-large" data-uk-grid>
                        <div className="uk-width-1-2@m uk-position-relative uk-position-z-index">
                            <div className="uk-grid-collapse" data-uk-grid>
                                <div className="uk-width-3-4@s uk-margin-auto">
                                    <div className="uk-text-center">
                                        <h2 className="uk-h2 uk-text-uppercase" style={{fontWeight: 800}}>
                                            Курс лечебного питания<br/>и нутрицевтической поддержки
                                        </h2>
                                        <div className="uk-text-small" style={{fontWeight: 300}}>
                                            Онлайн академия здоровья
                                        </div>
                                    </div>
                                    <div className="uk-margin-medium-top">
                                        <div className="uk-margin">
                                            <input
                                                type="text"
                                                className={`uk-input ${this.state.onError.email ? 'tm-input-error' : ''}`}
                                                placeholder="E-mail"
                                                name="email"
                                                ref={input => this.email = input}
                                                onChange={this.changeField}
                                            />
                                        </div>
                                        <div className="uk-margin">
                                            <input
                                                type="password"
                                                className={`uk-input ${this.state.onError.password ? 'tm-input-error' : ''}`}
                                                placeholder="Пароль"
                                                name="password"
                                                ref={input => this.password = input}
                                                onChange={this.changeField}
                                            />
                                        </div>
                                        <div className="uk-margin-medium-top uk-text-center">
                                            <div className="uk-button uk-button-primary" onClick={this.actionSignIn}>Войти</div>
                                        </div>
                                    </div>
                                    <div className="uk-margin-medium-top uk-flex uk-flex-center">
                                        <div className="tm-button tm-button-password-forgot">
                                            <div className="tm-icon tm-icon-key">
                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <g clipPath="url(#clip0)">
                                                        <path d="M0.496582 16.003H4.46533C4.72471 16.003 4.93408 15.7937 4.93408 15.5343V14.5937L6.22158 14.3374C6.40596 14.2999 6.55283 14.1562 6.59033 13.9687L6.85908 12.6187L8.20908 12.3499C8.39346 12.3124 8.54033 12.1687 8.57783 11.9812L8.88096 10.4624L9.28096 10.0624C11.1185 10.6562 13.1403 10.1812 14.5153 8.80616C16.5247 6.79678 16.5247 3.5249 14.5153 1.5124C12.506 -0.496973 9.23408 -0.496973 7.22158 1.5124C5.84971 2.88428 5.37158 4.90928 5.96533 6.74678L0.165332 12.5499C0.077832 12.6374 0.027832 12.7562 0.027832 12.8812V15.5343C0.027832 15.7905 0.237207 16.003 0.496582 16.003ZM1.62783 15.0655L7.45908 9.23428C7.54971 9.14366 7.59658 9.02178 7.59658 8.90303C7.59658 8.78428 7.54971 8.66241 7.45908 8.57178C7.27471 8.38741 6.97783 8.38741 6.79658 8.57178L0.965332 14.403V13.078L6.84346 7.19678C6.97471 7.06553 7.01533 6.86866 6.94971 6.69366C6.34033 5.13116 6.70596 3.35615 7.89033 2.17178C9.53408 0.528028 12.2122 0.528028 13.856 2.17178C15.5028 3.81866 15.4997 6.49366 13.856 8.13741C12.6716 9.32178 10.8966 9.69053 9.33408 9.07803C9.16221 9.00928 8.96221 9.05303 8.83096 9.18428L8.11846 9.89678C8.05283 9.96241 8.00908 10.0468 7.99033 10.1374L7.72158 11.4874L6.37158 11.7562C6.18721 11.7937 6.04033 11.9374 6.00283 12.1249L5.73408 13.4749L4.37471 13.7468C4.15596 13.7905 3.99658 13.9843 3.99658 14.2062V15.0624H1.62783V15.0655Z" fill="currentColor"/>
                                                        <path d="M13.194 4.8249C13.7409 4.27803 13.7409 3.38428 13.194 2.8374C12.6472 2.29053 11.7534 2.29053 11.2065 2.8374C10.6597 3.38428 10.6597 4.27803 11.2065 4.8249C11.7534 5.3749 12.6472 5.3749 13.194 4.8249ZM11.869 4.1624C11.6878 3.98115 11.6847 3.68115 11.869 3.4999C12.0534 3.31553 12.3503 3.31553 12.5315 3.4999C12.7159 3.68428 12.7159 3.98115 12.5315 4.1624C12.3503 4.34678 12.0534 4.34678 11.869 4.1624Z" fill="currentColor"/>
                                                    </g>
                                                    <defs>
                                                        <clipPath id="clip0">
                                                            <rect width="16" height="16" fill="white"/>
                                                        </clipPath>
                                                    </defs>
                                                </svg>
                                            </div>
                                            <span className="uk-margin-small-left" data-uk-toggle="#tm-modal-password-restore">Восстановление пароля</span>
                                        </div>
                                    </div>
                                    <div className="uk-text-center uk-margin-medium-top uk-hidden@s">
                                        <img src={require("../../assets/images/image-notebook.png").default} alt="" />
                                    </div>
                                    <div className="uk-margin-medium-top uk-text-center">
                                        <a className="tm-button-whatsapp" href="https://wa.me/79182611437?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5%2C%20%D1%83%20%D0%BC%D0%B5%D0%BD%D1%8F%20%D0%B2%D0%BE%D0%BF%D1%80%D0%BE%D1%81%20%D0%BF%D0%BE%20%D0%BC%D0%B0%D1%80%D0%B0%D1%84%D0%BE%D0%BD%D1%83%2C%20" target="_blank"><img src={require("../../assets/images/whatsapp.png").default} alt="" style={{height: 44}} /></a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="tm-modal-password-restore" className="uk-flex-top" data-uk-modal>
                        <div className="uk-modal-dialog uk-margin-auto-vertical uk-width-1-3@s">
                            <button className="uk-modal-close-full uk-close-large" type="button" data-uk-close />
                            <div className="uk-padding">
                                {
                                    !this.state.restoreStatus ? (
                                        <>
                                            <div>
                                                <label className="uk-form-label">E-mail</label>
                                                <input type="email" name="emailRestore" className={`uk-input ${this.state.onError.emailRestore ? 'tm-input-error' : ''}`} onChange={this.changeFieldRestorePassword} />
                                            </div>
                                            <div className="uk-margin-top uk-text-center">
                                                <div className="uk-button uk-button-primary" onClick={this.actionRestorePassword}>Продолжить</div>
                                            </div>
                                        </>
                                    ) : <div>Новый пароль отправлен на e-mail</div>
                                }

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => state;
export default connect(mapStateToProps)(SignIn);
