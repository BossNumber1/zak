import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import TextareaAutosize from 'react-textarea-autosize';
import store from "../../utils/store";
import UIkit from "uikit";

class News extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showCommentContainer: false,
            isLoaded: false,
            news: [],
            newsDetail: {
                comments: []
            },
            createComment: {
                news_id: null,
                answer_id: null,
                text: null
            }
        };

        this.onScroll = this.onScroll.bind(this);
        this.changeField = this.changeField.bind(this);
        this.actionGetNewsItem = this.actionGetNewsItem.bind(this);
        this.actionGetComments = this.actionGetComments.bind(this);

        this.selectComment = this.selectComment.bind(this);
        this.actionCreateComment = this.actionCreateComment.bind(this);

        this.closeNewsDetail = this.closeNewsDetail.bind(this);
    }

    componentDidUpdate() {
        const urlParams = new URLSearchParams(this.props.location.search);
        const commentId = urlParams.get('commentId');

        const element = document.getElementById(`tm-comment-${commentId}`);

        if (element !== null) {
            element.scrollIntoView();
            this.props.history.replace();
        }
    }


    async componentDidMount() {
		let modalTrainingDone = document.getElementById('tm-modal-workouts-training-done');
		let modalTrainingCircle = document.getElementById('tm-modal-workouts-training-circle');

		if (modalTrainingDone) {
			modalTrainingDone.parentNode.removeChild(modalTrainingDone);
		}

		if (modalTrainingCircle) {
			modalTrainingCircle.parentNode.removeChild(modalTrainingCircle);
		}

        const accessToken = localStorage.getItem("accessToken");
        const newsId = window.location.pathname.split('/')[2];

       await fetch( "https://api-academy.zubareva.online/api/news/list?&page=1", {
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
                    news: result.list
                })
            },(error) => {
                console.log(error)
            }
        );

        if (newsId) {
            this.actionGetNewsItem(newsId);
        }
        else{
            if (document.body.clientWidth > 700) {
                this.props.history.push(`/news/${this.state.news[0].id}`);
                this.actionGetNewsItem(this.state.news[0].id);
            }
        }

        store.dispatch({
            type: "CHANGE_PAGE",
            payload: {
                body: {
                    class: "tm-page-news"
                },
                header: {
                    navigation: true,
                    title: "Новости"
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

       window.addEventListener("scroll", this.onScroll);
    }

    componentWillUnmount = () => {
        window.removeEventListener("scroll", this.onScroll);

		const accessToken = localStorage.getItem("accessToken");

		if (!accessToken) {
			this.props.history.push('/signin');
		}
    };

    onScroll = () => {
        if (this.state.newsDetail.name) {
            const $this = this;
            let elementTarget = document.getElementById("tm-comments");

            if (window.scrollY >= (elementTarget.offsetTop - window.innerHeight)) {
                $this.setState({
                    showCommentContainer: true,
                });
            }
            else{
                $this.setState({
                    showCommentContainer: false,

                });
            }
        }
    };

    changeField = (e) => {
        this.setState({
            createComment: {
                ...this.state.createComment,
                [e.target.name]: e.target.value
            }
        })
    };

    async actionGetNewsItem(newsId) {
        const accessToken = localStorage.getItem("accessToken");

        await fetch( `https://api-academy.zubareva.online/api/news/detail?id=${newsId}`, {
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
                    newsDetail: {
                        ...result.item,
                        comments: []
                    },
                    createComment: {
                        ...this.state.createComment,
                        news_id: newsId,
                    }
                });
            },(error) => {
                console.log(error)
            }
        );

        this.actionGetComments(accessToken, newsId);

        store.dispatch({
            type: "CHANGE_PAGE",
            payload: {
                body: {
                    class: "tm-page-news tm-page-news-detail"
                },
                header: {
                    navigation: true,
                    title: "Новости"
                }
            }
        });
    };

    async actionGetComments(accessToken, newsId) {
        await fetch( `https://api-academy.zubareva.online/api/news/commentlist?id=${newsId}`, {
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
                    newsDetail: {
                        ...this.state.newsDetail,
                        comments: result.list
                    }
                });
            },(error) => {
                console.log(error)
            }
        );
    };

    selectComment(answerId, userData) {
        this.setState({
            createComment: {
                ...this.state.createComment,
                answer_id: answerId,
                text: userData.name + ' ' + userData.last_name + ', '
            }
        });

        this.text.focus();
    };

    async actionCreateComment() {
        const accessToken = localStorage.getItem("accessToken");

        if (this.state.createComment.text === null) {
            this.text.focus();

            return false;
        }

        await fetch( 'https://api-academy.zubareva.online/api/news/commentadd', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : accessToken
            },
            body: JSON.stringify(this.state.createComment)
        })
        .then(res => res.json())
        .then(
            (result) => {
                this.actionGetComments(accessToken, this.state.createComment.news_id);

                this.setState({
                    createComment: {
                        ...this.state.createComment,
                        answer_id: null,
                        text: null
                    }
                });

                this.text.value = '';
            },(error) => {
                console.log(error)
            }
        );
    };

    closeNewsDetail = () => {
        this.props.history.push('/news');

        this.setState({
            newsDetail: {}
        });

        store.dispatch({
            type: "CHANGE_PAGE",
            payload: {
                body: {
                    class: "tm-page-news"
                },
                header: {
                    navigation: true,
                    title: "Новости"
                }
            }
        });
    };

    render() {
        const { isLoaded, news, newsDetail, createComment } = this.state;

       return (
            <div className="uk-container uk-container-large uk-section">
                <div className="uk-hidden@m">
                    <h2 className="uk-h2" style={{fontWeight: 700}}>Новости</h2>
                </div>
                {
                    isLoaded && (
                        <div data-uk-grid>
                            <div className="uk-width-2-5@s">
                                <div className="tm-news-list">
                                    {
                                        news.map((newsItem, key) => (
                                            <Link key={key} to={`/news/${newsItem.id}`} className="tm-news-list-item uk-clearfix" onClick={() => this.actionGetNewsItem(newsItem.id)}>
                                                <img src={newsItem.picture} alt="" />
                                                <div>
                                                    <h5 className="uk-h5 uk-margin-remove" style={{fontWeight: 800}}>{newsItem.name}</h5>
                                                    <span className="uk-margin-right">{newsItem.date}</span>
                                                    <span className="uk-margin-right">{newsItem.comments} комментарий</span>
                                                    {
                                                        newsItem.user.name && (
                                                            <div className="uk-margin-small-top">
                                                                {newsItem.user.name} {newsItem.user.last_name}
                                                            </div>
                                                        )
                                                    }
                                                </div>
                                            </Link>
                                        ))
                                    }
                                </div>
                            </div>
                            <div className="uk-width-3-5@s">
                                {
                                    newsDetail.name && (
                                        <div className="tm-news-detail">
                                            <div className="tm-button tm-button-hide-news-detail" onClick={this.closeNewsDetail}>
                                                <svg width="23" height="14" viewBox="0 0 23 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path fillRule="evenodd" clipRule="evenodd" d="M0.559107 2.61984L10.3956 12.4744C10.9489 13.0296 11.882 13.0391 12.4489 12.4953L22.4816 2.84297C23.0971 2.251 23.1067 1.3067 22.5034 0.702337C21.8648 0.0629939 20.7905 0.0520602 20.1379 0.678261L11.7339 8.76236C11.582 8.90902 11.333 8.90649 11.1841 8.75677L2.94633 0.503286C2.30776 -0.136056 1.2335 -0.14699 0.580894 0.479211C0.274848 0.77575 0.118283 1.15927 0.114364 1.54435C0.110433 1.93051 0.25916 2.31713 0.559107 2.61984Z" fill="#DD9D9D"/>
                                                </svg>
                                            </div>
                                            {
                                                newsDetail.video_url ? (
                                                    <>
                                                        <p className="tm-detail-video" dangerouslySetInnerHTML={{__html: newsDetail.text}} />
                                                        <h4 className="uk-h4 uk-margin-top uk-margin-remove-bottom" style={{fontWeight: 800}}>{newsDetail.name}</h4>
                                                        <span className="uk-margin-right">{newsDetail.date}</span>
                                                        <span className="uk-margin-right">{Object.values(newsDetail.comments).length} комментарий</span>
                                                        {
                                                            newsDetail.user && (
                                                                <span className="uk-display-block">
                                                                    {newsDetail.user.name} {newsDetail.user.last_name}
                                                                </span>
                                                            )
                                                        }
                                                    </>
                                                ) : (
                                                    <>
                                                        <h4 className="uk-h4 uk-margin-top uk-margin-remove-bottom" style={{fontWeight: 800}}>{newsDetail.name}</h4>
                                                        <span className="uk-margin-right">{newsDetail.date}</span>
                                                        <span className="uk-margin-right">{Object.values(newsDetail.comments).length} комментарий</span>
                                                        {
                                                            newsDetail.user && (
                                                                <span className="uk-display-block">
                                                                    {newsDetail.user.name} {newsDetail.user.last_name}
                                                                </span>
                                                            )
                                                        }
                                                        <p dangerouslySetInnerHTML={{__html: newsDetail.text}} />
                                                    </>
                                                )
                                            }
                                            <div className="uk-margin-medium-top">
                                                <div id="tm-comments" className="tm-comments">
                                                    <h6 className="uk-h4" style={{fontWeight: 700}}>Комментарии</h6>
                                                    <div className="tm-comments-list">
                                                        {
                                                            newsDetail.comments.length > 0 ? (
                                                                newsDetail.comments.map((comment, key) => (
                                                                    <div key={key} id={`tm-comment-${comment.id}`} className="tm-comment">
                                                                        <div className="uk-grid-small" data-uk-grid>
                                                                            <div className="uk-margin-auto">
                                                                                {
                                                                                    comment.user.photo ? (
                                                                                        <div className="tm-avatar">
                                                                                            <img src={comment.user.photo} alt="" />
                                                                                        </div>
                                                                                    ) : (
                                                                                        <div className="tm-avatar tm-avatar-none" />
                                                                                    )
                                                                                }
                                                                            </div>
                                                                            <div className="uk-width-expand">
                                                                                <div className="tm-comment-author">
                                                                                    {comment.user.name} {comment.user.last_name}
                                                                                </div>
                                                                                <div className="tm-comment-text">
                                                                                    {comment.text}
                                                                                </div>
                                                                                <span className="tm-comment-date">
                                                                                    {comment.date}
                                                                                </span>
                                                                                <a className="tm-button-answer" onClick={() => this.selectComment(comment.id, comment.user)}>Ответить</a>
                                                                            </div>
                                                                        </div>
                                                                        {
                                                                            comment.answers.length > 0 && (
                                                                                comment.answers.map((commentAnswer, key) => (
                                                                                    <div key={key} className="tm-comment">
                                                                                        <div className="uk-grid-small" data-uk-grid>
                                                                                            <div className="uk-margin-auto">
                                                                                                {
                                                                                                    commentAnswer.user.photo ? (
                                                                                                        <div className="tm-avatar">
                                                                                                            <img src={commentAnswer.user.photo} alt="" />
                                                                                                        </div>
                                                                                                    ) : (
                                                                                                        <div className="tm-avatar tm-avatar-none" />
                                                                                                    )
                                                                                                }
                                                                                            </div>
                                                                                            <div className="uk-width-expand">
                                                                                                <div className="tm-comment-author">
                                                                                                    {commentAnswer.user.name} {commentAnswer.user.last_name}
                                                                                                </div>
                                                                                                <div className="tm-comment-text">
                                                                                                    {commentAnswer.text}
                                                                                                </div>
                                                                                                <div className="tm-comment-date">
                                                                                                    {commentAnswer.date}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                ))
                                                                            )
                                                                        }
                                                                    </div>
                                                                ))
                                                            ) : 'Комментариев нет'
                                                        }
                                                    </div>
                                                </div>
                                                {
                                                    !newsDetail.no_comments && (
                                                        <div id="tm-comment-create" className="tm-comment-create" style={{position: this.state.showCommentContainer ? 'fixed' : 'static'}}>
                                                            <div className="uk-grid-small uk-flex uk-flex-middle" data-uk-grid>
                                                                <div className="uk-width-expand">
                                                                    <TextareaAutosize
                                                                        className="uk-textarea"
                                                                        style={{resize: 'none'}}
                                                                        placeholder="Написать комментарий"
                                                                        name="text"
                                                                        ref={input => this.text = input}
                                                                        value={createComment.text}
                                                                        onChange={this.changeField}
                                                                    />
                                                                </div>
                                                                <div className="uk-width-auto">
                                                                    <div className="tm-button-comment-create" onClick={this.actionCreateComment}>
                                                                        <svg width="23" height="22" viewBox="0 0 23 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                            <path d="M22.7586 11.5595C22.7586 11.5532 22.7651 11.5532 22.7651 11.547C22.8106 11.4782 22.8497 11.4032 22.8758 11.3282C22.8823 11.3094 22.8888 11.2907 22.8953 11.2657C22.9214 11.1844 22.9344 11.0969 22.9344 11.0031C22.9344 10.9093 22.9148 10.8218 22.8953 10.7405C22.8888 10.7218 22.8823 10.703 22.8758 10.678C22.8497 10.5967 22.8106 10.5217 22.7651 10.4529C22.7651 10.4529 22.7651 10.4467 22.7586 10.4467C22.7065 10.3717 22.6478 10.3092 22.5762 10.2529C22.5632 10.2404 22.5437 10.2279 22.5306 10.2154C22.459 10.1591 22.3809 10.1091 22.2962 10.0779L-0.541782 0.881706C-0.952046 0.719164 -1.42092 0.81919 -1.71396 1.13177C-2.01352 1.44435 -2.07213 1.90697 -1.85723 2.27582L3.02685 11.0031L-1.86374 19.7241C-2.07213 20.0992 -2.01352 20.5556 -1.72047 20.8682C-1.70745 20.8807 -1.69443 20.8932 -1.68791 20.9057C-1.38836 21.1932 -0.939021 21.2808 -0.548295 21.1182L22.2897 11.9221C22.3743 11.8908 22.4525 11.8408 22.5241 11.7845C22.5437 11.772 22.5567 11.7595 22.5762 11.7408C22.6478 11.6908 22.713 11.6283 22.7586 11.5595ZM1.36627 3.82622L16.7153 10.0028H4.83071L1.36627 3.82622ZM1.36627 18.18L4.83071 12.0034H16.7088L1.36627 18.18Z" fill="currentColor"/>
                                                                        </svg>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                            </div>
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    )
                }
            </div>
        );
    }
}

export default News;
