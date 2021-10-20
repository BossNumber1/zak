import React from 'react';
import { Link } from 'react-router-dom';
import store from "../../../utils/store";
import { connect } from "react-redux";

class ArticleOne extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoaded: false,
            articleDetail: {},
            ratingQuestions: [],
            ratings: []
        };
    }

    componentDidMount() {
        const accessToken = localStorage.getItem("accessToken");
        const articleId = window.location.pathname.split('/')[2];

        fetch( `https://api-academy.zubareva.online/api/learn/detail?id=${articleId}`, {
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
                    isLoaded: true,
                    articleDetail: result.item,
                });
            },(error) => {
                console.log(error)
            }
        );

        fetch( `https://api-academy.zubareva.online/api/rating/get?type=learn`, {
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
                    ratingQuestions: result.list,
                });
            },(error) => {
                console.log(error)
            }
        );

        store.dispatch({
            type: "CHANGE_PAGE",
            payload: {
                body: {
                    class: "tm-page-articles tm-page-article-item"
                },
                header: {
                    navigation: true,
                    title: "Материалы"
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

    componentWillMount() {
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            this.props.history.push('/signin');
        }
    }

    changeRatings = (value, questionId) => {
        if (value === 0) {
            this.setState({
                ratings: {
                    ...this.state.ratings,
                    [questionId]: {
                        star1: false,
                        star2: false,
                        star3: false,
                        star4: false,
                        star5: false
                    }
                }
            })
        }

        if (value === 1) {
            this.setState({
                ratings: {
                    ...this.state.ratings,
                    [questionId]: {
                        star1: true,
                        star2: false,
                        star3: false,
                        star4: false,
                        star5: false
                    }
                }
            })
        }

        if (value === 2) {
            this.setState({
                ratings: {
                    ...this.state.ratings,
                    [questionId]: {
                        star1: true,
                        star2: true,
                        star3: false,
                        star4: false,
                        star5: false
                    }
                }
            })
        }

        if (value === 3) {
            this.setState({
                ratings: {
                    ...this.state.ratings,
                    [questionId]: {
                        star1: true,
                        star2: true,
                        star3: true,
                        star4: false,
                        star5: false
                    }
                }
            })
        }

        if (value === 4) {
            this.setState({
                ratings: {
                    ...this.state.ratings,
                    [questionId]: {
                        star1: true,
                        star2: true,
                        star3: true,
                        star4: true,
                        star5: false
                    }
                }
            })
        }

        if (value === 5) {
            this.setState({
                ratings: {
                    ...this.state.ratings,
                    [questionId]: {
                        star1: true,
                        star2: true,
                        star3: true,
                        star4: true,
                        star5: true
                    }
                }
            })
        }
    };

    actionSaveRating = () => {
        const accessToken = localStorage.getItem("accessToken");
        const articleId = window.location.pathname.split('/')[2];

        let currentRating;

        if (this.state.ratings.star1) {
            currentRating = 1;
        }

        if (this.state.ratings.star2) {
            currentRating = 2;
        }

        if (this.state.ratings.star3) {
            currentRating = 3;
        }

        if (this.state.ratings.star4) {
            currentRating = 4;
        }

        if (this.state.ratings.star5) {
            currentRating = 5;
        }

        fetch( `https://api-academy.zubareva.online/api/rating/set`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : accessToken
            },
            body: JSON.stringify({
                type: 'learn',
                object_id: articleId,
                answers: this.state.ratingQuestions.map((ratingQuestion) => {
                    let answer;

                    if (this.state.ratings[ratingQuestion.id].star1) {
                        answer = {
                            question: ratingQuestion.id,
                            balls: 1
                        }
                    }

                    if (this.state.ratings[ratingQuestion.id].star2) {
                        answer = {
                            question: ratingQuestion.id,
                            balls: 2
                        }
                    }

                    if (this.state.ratings[ratingQuestion.id].star3) {
                        answer = {
                            question: ratingQuestion.id,
                            balls: 3
                        }
                    }

                    if (this.state.ratings[ratingQuestion.id].star4) {
                        answer = {
                            question: ratingQuestion.id,
                            balls: 4
                        }
                    }

                    if (this.state.ratings[ratingQuestion.id].star5) {
                        answer = {
                            question: ratingQuestion.id,
                            balls: 5
                        }
                    }

                    return answer;
                })
            })
        })
        .then(res => res.json())
        .then(
            (result) => {
                this.setState({
                    articleDetail: {
                        ...this.state.articleDetail,
                        rating: currentRating
                    },
                });
            },(error) => {
                console.log(error)
            }
        );
    };

    render() {
        const { isLoaded, articleDetail, ratingQuestions, ratings } = this.state;

        return (
            <div className="uk-container uk-section">
                {
                    isLoaded && (
                        <div className="tm-article">
                            <div className="uk-child-width-1-2@s uk-visible@m" data-uk-grid>
                                <div>
                                    <div className="uk-flex uk-flex-middle uk-margin-bottom" data-uk-grid>
                                        <div className="uk-width-auto">
                                            <div className="tm-date">{articleDetail.date}</div>
                                        </div>
                                        {
                                            articleDetail.rating === 0 && (
                                                <div className="uk-width-expand">
                                                    <div className="uk-align-right uk-margin-remove">
                                                        <div className="tm-button-rate" data-uk-toggle="target: #tm-modal-rate;">
                                                            <svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M7 0L8.5716 4.83688H13.6574L9.5429 7.82624L11.1145 12.6631L7 9.67376L2.8855 12.6631L4.4571 7.82624L0.342604 4.83688H5.4284L7 0Z" fill="#FFA54A"/>
                                                            </svg>
                                                            <span>Оценить</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        }
                                    </div>
                                    <h4 className="uk-h4 uk-margin-remove-top uk-margin-small-bottom" style={{fontWeight: 700}} dangerouslySetInnerHTML={{__html: articleDetail.name}} />
                                    {
                                        (articleDetail.picture && !articleDetail.video_url) && (
                                            <p dangerouslySetInnerHTML={{__html: articleDetail.text}} />
                                        )
                                    }
                                    <div className="uk-margin-medium-top">
                                        <div className="tm-author">
                                            <span>{articleDetail.user.name} {articleDetail.user.last_name}</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    {
                                        (articleDetail.picture && !articleDetail.video_url) && (
                                            <img src={articleDetail.picture} alt="" />
                                        )
                                    }
                                    {
                                        articleDetail.video_url && (
                                            <p dangerouslySetInnerHTML={{__html: articleDetail.text}} />
                                        )
                                    }
                                </div>
                            </div>
                            <div className="uk-hidden@m">
                                <Link to="/articles" className="tm-button-back">
                                    <svg width="14" height="24" viewBox="0 0 14 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M10.5528 0.983986L0.798858 10.9203C0.249339 11.4792 0.249339 12.4124 0.798858 12.9736L10.5528 22.9076C11.151 23.5171 12.0954 23.5171 12.6936 22.9076C13.3264 22.2626 13.3264 21.1882 12.6936 20.542L4.52434 12.2207C4.37614 12.0703 4.37614 11.8213 4.52434 11.6709L12.6936 3.34955C13.3264 2.7045 13.3264 1.63018 12.6936 0.983986C12.3939 0.680974 12.0088 0.52832 11.6237 0.52832C11.2376 0.52832 10.8525 0.680974 10.5528 0.983986Z" fill="currentColor"/>
                                    </svg>
                                </Link>
                                {
                                    (articleDetail.picture && !articleDetail.video_url) && (
                                        <img src={articleDetail.picture} alt="" />
                                    )
                                }
                                {
                                    articleDetail.video_url && (
                                        <p dangerouslySetInnerHTML={{__html: articleDetail.text}} />
                                    )
                                }
                                <div className="uk-margin-top uk-padding-small uk-padding-remove-top">
                                    <div className="tm-date">{articleDetail.date}</div>
                                    <h4 className="uk-h4 uk-margin-remove-top uk-margin-small-bottom" style={{fontWeight: 700}}>{articleDetail.name}</h4>
                                    {
                                        (articleDetail.picture && !articleDetail.video_url) && (
                                            <p dangerouslySetInnerHTML={{__html: articleDetail.text}} />
                                        )
                                    }
                                    <div className="uk-margin-top">
                                        <div className="tm-author">
                                            <span>{articleDetail.user.name} {articleDetail.user.last_name}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
                <div id="tm-modal-rate" className="uk-flex-top" data-uk-modal="stack: true;">
                    <div className="uk-modal-dialog uk-margin-auto-vertical uk-width-1-3@s">
                        <button className="uk-modal-close-full uk-close-large" type="button" data-uk-close />
                        <div className="uk-padding-large uk-text-center">
                            <h3 className="uk-h3 uk-text-bolder">Оцените материал</h3>
                            {
                                ratingQuestions.map((ratingQuestion, key) => (
                                    <div key={key}>
                                        <div className="uk-text-center uk-margin-small-bottom" style={{color: 'rgba(37, 23, 22, 0.6)'}}>
                                            {ratingQuestion.question}
                                        </div>
                                        <div className="tm-rating-change">
                                            <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg" className={(typeof ratings[ratingQuestion.id] !== 'undefined' && ratings[ratingQuestion.id].star5) ? 'uk-active' : ''} onClick={() => this.changeRatings(5, ratingQuestion.id)}>
                                                <path d="M8 1.61803L9.32058 5.68237L9.43284 6.02786H9.79611H14.0696L10.6123 8.53976L10.3184 8.75329L10.4306 9.09878L11.7512 13.1631L8.29389 10.6512L8 10.4377L7.70611 10.6512L4.24877 13.1631L5.56936 9.09878L5.68162 8.75329L5.38772 8.53976L1.93039 6.02786H6.20389H6.56716L6.67942 5.68237L8 1.61803Z" stroke="currentColor" />
                                            </svg>
                                            <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg" className={(typeof ratings[ratingQuestion.id] !== 'undefined' && ratings[ratingQuestion.id].star4) ? 'uk-active' : ''} onClick={() => this.changeRatings(4, ratingQuestion.id)}>
                                                <path d="M8 1.61803L9.32058 5.68237L9.43284 6.02786H9.79611H14.0696L10.6123 8.53976L10.3184 8.75329L10.4306 9.09878L11.7512 13.1631L8.29389 10.6512L8 10.4377L7.70611 10.6512L4.24877 13.1631L5.56936 9.09878L5.68162 8.75329L5.38772 8.53976L1.93039 6.02786H6.20389H6.56716L6.67942 5.68237L8 1.61803Z" stroke="currentColor" />
                                            </svg>
                                            <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg" className={(typeof ratings[ratingQuestion.id] !== 'undefined' && ratings[ratingQuestion.id].star3) ? 'uk-active' : ''} onClick={() => this.changeRatings(3, ratingQuestion.id)}>
                                                <path d="M8 1.61803L9.32058 5.68237L9.43284 6.02786H9.79611H14.0696L10.6123 8.53976L10.3184 8.75329L10.4306 9.09878L11.7512 13.1631L8.29389 10.6512L8 10.4377L7.70611 10.6512L4.24877 13.1631L5.56936 9.09878L5.68162 8.75329L5.38772 8.53976L1.93039 6.02786H6.20389H6.56716L6.67942 5.68237L8 1.61803Z" stroke="currentColor" />
                                            </svg>
                                            <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg" className={(typeof ratings[ratingQuestion.id] !== 'undefined' && ratings[ratingQuestion.id].star2) ? 'uk-active' : ''} onClick={() => this.changeRatings(2, ratingQuestion.id)}>
                                                <path d="M8 1.61803L9.32058 5.68237L9.43284 6.02786H9.79611H14.0696L10.6123 8.53976L10.3184 8.75329L10.4306 9.09878L11.7512 13.1631L8.29389 10.6512L8 10.4377L7.70611 10.6512L4.24877 13.1631L5.56936 9.09878L5.68162 8.75329L5.38772 8.53976L1.93039 6.02786H6.20389H6.56716L6.67942 5.68237L8 1.61803Z" stroke="currentColor" />
                                            </svg>
                                            <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg" className={(typeof ratings[ratingQuestion.id] !== 'undefined' && ratings[ratingQuestion.id].star1) ? 'uk-active' : ''} onClick={() => this.changeRatings(1, ratingQuestion.id)}>
                                                <path d="M8 1.61803L9.32058 5.68237L9.43284 6.02786H9.79611H14.0696L10.6123 8.53976L10.3184 8.75329L10.4306 9.09878L11.7512 13.1631L8.29389 10.6512L8 10.4377L7.70611 10.6512L4.24877 13.1631L5.56936 9.09878L5.68162 8.75329L5.38772 8.53976L1.93039 6.02786H6.20389H6.56716L6.67942 5.68237L8 1.61803Z" stroke="currentColor" />
                                            </svg>
                                        </div>
                                    </div>
                                ))
                            }
                            <div className="uk-margin-medium-top">
                                <div className="uk-button uk-button-default uk-modal-close uk-margin-small-right" style={{minWidth: 'auto'}} onClick={() => this.changeRatings(0)}>Отменить</div>
                                <div className="uk-button uk-button-primary uk-modal-close uk-margin-small-left" style={{minWidth: 'auto'}} onClick={this.actionSaveRating}>Подтвердить</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => state;
export default connect(mapStateToProps)(ArticleOne);
