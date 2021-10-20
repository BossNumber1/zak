import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from "react-redux";
import TextareaAutosize from 'react-textarea-autosize';
import parseJson from "parse-json";
import store from "../../utils/store";

import UIkit from "uikit";
import axios from "axios";

class Chat extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            websocket: null,
            isLoadedMessages: false,
            ratingQuestions: [],
            ratings: [],
            current: {
                step: 1,
                chat: {
                    previews: {
                        id: 0,
                        path: null
                    }
                },
                specialist: {}
            },
            specialists: [],
            messages: []
        };

        this.connectSocket = this.connectSocket.bind(this)
        this.toggleChat = this.toggleChat.bind(this);
        this.changeField = this.changeField.bind(this);
        this.actionGetSpecialists = this.actionGetSpecialists.bind(this);
        this.changeSpecialists = this.changeSpecialists.bind(this);
        this.backToSpecialists = this.backToSpecialists.bind(this);
        this.actionCreateChat = this.actionCreateChat.bind(this);
        this.actionCreateMessage = this.actionCreateMessage.bind(this);
        this.actionGetMessages = this.actionGetMessages.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
    }

    componentDidMount() {
        const accessToken = localStorage.getItem("accessToken");

        this.connectSocket();
        this.actionGetSpecialists();

        fetch( `https://api-academy.zubareva.online/api/rating/get?type=spec`, {
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
    }

    componentWillMount() {
        this.setState({
            current: {
                ...this.state.current,
                chat: {
                    ...this.state.current.chat,
                    id: this.props.chat.id
                }
            }
        })
    }

   async componentDidUpdate(prevProps, prevState, snapshot) {
       if (this.props.chat.current.id > 0 && this.props.chat.current.id !== prevState.current.chat.id) {
           await this.actionGetSpecialists();

           const specialist = this.state.specialists.filter((specialistItem) => specialistItem.users[0].id === this.props.chat.current.specialist.id);

           await this.setState({
               isLoadedMessages: true,
                current: {
                    ...this.state.current,
                    step: 2,
                    specialist: specialist[0],
                    chat: {
                        ...this.state.current.chat,
                        id: this.props.chat.current.id,
                    }
                }
            });
           console.log(this.props.chat.current.id);

           this.actionGetMessages(this.props.chat.current.id);
        }
    }

    timeout = 3000;

    onKeyDown = (e) => {
        if (e.which === 13) {
            //this.actionCreateMessage();
        }
    };

    connectSocket = () => {
        const accessToken = localStorage.getItem("accessToken");
        let $this = this;
        let connectInterval;
        let socket = new WebSocket("wss://api-academy.zubareva.online:8002");

        socket.onopen = function(e) {
            //console.log('Socket open.');

            $this.setState({
                websocket: socket
            });

            $this.timeout = 3000;

            clearTimeout(connectInterval);
        };

        socket.onclose = function(event) {
            if (event.wasClean) {
                //console.log(`[close] Соединение закрыто чисто, код=${event.code} причина=${event.reason}`);
            } else {
                //console.log(`[close] Соединение закрыто, код=${event.code} причина=${event.reason}`);
            }

            $this.timeout = $this.timeout + $this.timeout;
            connectInterval = setTimeout($this.check, Math.min(10000, $this.timeout));
        };

        socket.onmessage = function(e) {
            //console.log(e.data);
        };

        socket.onerror = function(error) {
            //console.log(`[error] ${error.message}`);
        };
    };

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

    check = () => {
        const { websocket } = this.state;

        if (!websocket || websocket.readyState === WebSocket.CLOSED) {
            this.connectSocket()
        }
    };

    changeField = (e) => {
        this.setState({
            current: {
                ...this.state.current,
                chat: {
                    ...this.state.current.chat,
                    message: e.target.value
                }
            }
        });
    };

    async actionGetSpecialists() {
        const accessToken = localStorage.getItem("accessToken");

        await fetch( 'https://api-academy.zubareva.online/api/chat/call', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : accessToken
            },
            body: JSON.stringify({
                command: "get_list",
                params: {
                    only_unread: 0,
                    page: 1,
                    limit: 10
                }

            })
        })
        .then(res => res.json())
        .then(
            (result) => {

                this.setState({
                    specialists: result.answer.list
                })
            },(error) => {
                console.log(error)
            }
        );
    };

    async changeSpecialists(specialistData) {
        const accessToken = localStorage.getItem("accessToken");

        await this.setState({
            isLoadedMessages: true,
            current: {
                ...this.state.current,
                step: 2,
                specialist: specialistData
            },
            messages: []
        });

        this.actionCreateChat();



        let ids = [];
        this.props.notifications.list.map((item, key) => {
            if (item.from.id === specialistData.users[0].id) {
                ids.push(item.id)

                console.log(item)
            }
        });

        await fetch( 'https://api-academy.zubareva.online/api/notifications/read', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : accessToken
            },
            body: JSON.stringify({
                ids: ids
            })
        })
        .then(res => res.json())
        .then(
            (result) => {

            },(error) => {
                console.log(error)
            }
        );

        await fetch( 'https://api-academy.zubareva.online/api/notifications/_get', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : accessToken
            }
        })
        .then(res => res.json())
        .then(
            (result) => {
                let unreadChats = [];
                let unreadChatsTotalMessage = 0;

                if (result.list.length > 0) {
                    result.list.map((item) => {
                        if (item.from.id > 0) {
                            if (unreadChats[item.from.id] > 0) {
                                unreadChats[item.from.id] = unreadChats[item.from.id] + 1;
                            }
                            else {
                                unreadChats[item.from.id] = 1;
                            }
                        }
                    });

                    unreadChats.map((item) => {
                        unreadChatsTotalMessage = unreadChatsTotalMessage + item;
                    })
                }

                store.dispatch({
                    type: "NOTIFICATIONS",
                    payload: {
                        unreadCount: result.list.length,
                        unreadChatsTotalMessage: unreadChatsTotalMessage,
                        unreadChats: unreadChats,
                        list: result.list
                    }
                });
            },(error) => {
                console.log(error)
            }
        );
    };

    backToSpecialists = () => {
        this.setState({
            isLoadedMessages: false,
            current: {
                ...this.state.current,
                step: 1
            }
        })
    };

   actionCreateChat = () => {
       const accessToken = localStorage.getItem("accessToken");
       let $this = this;

       try {
           this.state.websocket.send(JSON.stringify({
               command: "create_chat",
               params: {
                   token: accessToken,
                   user_id: this.props.profile.id,
                   user_ids: [this.state.current.specialist.users[0].id],
               }
           }));

           this.state.websocket.onmessage = function(e) {
               let chatId = parseJson(e.data).id;

               $this.setState({
                   current: {
                       ...$this.state.current,
                       chat: {
                           ...$this.state.current.chat,
                           id: chatId
                       }
                   }
               });

               store.dispatch({
                   type: "TOGGLE_CHAT",
                   payload: {
                       isOpen: true,
                       current: {
                           step: 2,
                           id: chatId,
                           specialist: $this.state.current.specialist
                       }
                   }
               });
console.log(chatId);
               $this.actionGetMessages(chatId);
           }
       }
       catch (error) {
           console.log(error)
       }
   };

    async actionCreateMessage() {
       const accessToken = localStorage.getItem("accessToken");
       let $this = this;
       let date = new Date();

       this.state.websocket.send(JSON.stringify({
           command: "send_message",
           params: {
               token: accessToken,
               chat_id: this.state.current.chat.id,
               message: this.state.current.chat.message,
               file_id: this.state.current.chat.previews.id,
               answer_id: 0,
               user_id: this.props.profile.id
           }
       }));

       let messages = $this.state.messages;

       await $this.setState({
           messages: messages
       });

       this.state.websocket.onmessage = function(e) {
           let data = parseJson(e.data);
           let messages = $this.state.messages;

           if (data.status === 500) {
               UIkit.modal('#tm-modal-chat-limits').show();
           }
           else {
               messages.push({
                   ...data.params,
                   my: 1,
                   file: {
                       id: $this.state.current.chat.previews.id,
                       path: $this.state.current.chat.previews.path
                   },
                   time_text: date.getDate()+'.'+date.getMonth()+'.'+date.getFullYear()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds()
               });

               $this.setState({
                   messages: messages,
                   current: {
                       ...$this.state.current,
                       chat: {
                           ...$this.state.current.chat,
                           previews: []
                       }
                   }
               });

               $this.messagesEnd.scrollIntoView({ behavior: "smooth" });
           }
        };

       this.message.value = '';
   };

   actionGetMessages = (chatId) => {
       const accessToken = localStorage.getItem("accessToken");

       fetch( 'https://api-academy.zubareva.online/api/chat/call', {
           method: 'POST',
           headers: {
               'Content-Type': 'application/json',
               'Authorization' : accessToken
           },
           body: JSON.stringify({
               command: 'get_messages',
                params: {
                    token: accessToken,
                    chat_id: chatId
                }
            })
        })
        .then(res => res.json())
        .then(
            (result) => {
                this.setState({
                    messages: result.answer.list
                });

                this.messagesEnd.scrollIntoView({ behavior: "smooth" });
            },(error) => {
                console.log(error)
            }
        );
    };

   toggleChat = () => {
       document.getElementsByTagName('body')[0].style = 'overflow: hidden;';

       store.dispatch({
           type: "TOGGLE_CHAT",
           payload: {
               isOpen: false
           }
       });
   };

    actionUploadFile = (e) => {
        const accessToken = localStorage.getItem("accessToken");
        const formData = new FormData();

        formData.append('file', e.target.files[0]);

        axios({
            method: "POST",
            url: '/api/file/add',
            data: formData,
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'multipart/form-data;',
                'Authorization' : accessToken
            }
        })
        .then((response) => {
            this.actionGetFile(response.data.id)
        })
        .catch((error) => {
            console.log(error)
        });
    };

   async actionGetFile(fileId) {
        const accessToken = localStorage.getItem("accessToken");
        const fileIds = this.state.current.chat.file_id;
        let previews = this.state.current.chat.previews;

        await fetch( `https://api-academy.zubareva.online/api/file/get?id=${fileId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization' : accessToken
            }
        })
        .then(res => res.json())
        .then(
            (result) => {
                this.setState({
                    current: {
                        ...this.state.current,
                        chat: {
                            ...this.state.current.chat,
                            previews: result
                        }
                    }
                });
            },(error) => {
                console.log(error)
            }
        );
    };

    removePreview = (index) => {
        this.setState({
            current: {
                ...this.state.current,
                chat: {
                    ...this.state.current.chat,
                    previews: []
                }
            }
        })
    };

    actionSaveRating = () => {
        const accessToken = localStorage.getItem("accessToken");

        fetch( `https://api-academy.zubareva.online/api/rating/set`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : accessToken
            },
            body: JSON.stringify({
                type: 'spec',
                object_id: this.state.current.specialist.id,
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
                    ratings: []
                })
            },(error) => {
                console.log(error)
            }
        );
    };

    render() {
       const { isLoadedMessages, current, specialists, messages, ratingQuestions, ratings } = this.state;

       return (
            <div className={`tm-chat ${current.step === 2 ? 'tm-screen-messages' : ''} ${this.props.chat.isOpen ? 'tm-chat-open' : ''}`}>
                <div className="tm-chat-header">
                    {
                        current.step === 1 && (
                            <>
                                <h3 className="uk-h3 uk-text-bolder uk-margin-remove">Чаты</h3>
                                <div className="tm-button-close" onClick={this.toggleChat}>
                                    <svg width="24" height="24" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M11.2878 0.712476C11.0201 0.4448 10.5908 0.4448 10.3231 0.712476L5.99992 5.03571L1.67669 0.712476C1.40902 0.4448 0.979725 0.4448 0.712049 0.712476C0.444372 0.980153 0.444372 1.40945 0.712049 1.67712L5.03527 6.00036L0.712049 10.3236C0.444372 10.5913 0.444372 11.0206 0.712049 11.2882C0.843362 11.4195 1.02013 11.4903 1.19185 11.4903C1.36356 11.4903 1.54033 11.4246 1.67164 11.2882L5.99487 6.965L10.3181 11.2882C10.4494 11.4195 10.6262 11.4903 10.7979 11.4903C10.9747 11.4903 11.1464 11.4246 11.2777 11.2882C11.5454 11.0206 11.5454 10.5913 11.2777 10.3236L6.96457 6.00036L11.2878 1.67712C11.5555 1.40945 11.5555 0.980153 11.2878 0.712476Z" fill="#FFA53A"/>
                                    </svg>
                                </div>
                            </>
                        )
                    }
                    {
                        current.step === 2 && (
                            <div className="uk-flex uk-flex-middle">
                                <div className="tm-button-back" onClick={this.backToSpecialists}>
                                    <svg width="14" height="24" viewBox="0 0 14 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <mask id="mask0" mask-type="alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="14" height="24">
                                            <path fillRule="evenodd" clipRule="evenodd" d="M10.5528 0.983986L0.798858 10.9203C0.249339 11.4792 0.249339 12.4124 0.798858 12.9736L10.5528 22.9076C11.151 23.5171 12.0954 23.5171 12.6936 22.9076C13.3264 22.2626 13.3264 21.1882 12.6936 20.542L4.52434 12.2207C4.37614 12.0703 4.37614 11.8213 4.52434 11.6709L12.6936 3.34955C13.3264 2.7045 13.3264 1.63018 12.6936 0.983986C12.3939 0.680974 12.0088 0.52832 11.6237 0.52832C11.2376 0.52832 10.8525 0.680974 10.5528 0.983986Z" fill="white"/>
                                        </mask>
                                        <g mask="url(#mask0)">
                                            <path fillRule="evenodd" clipRule="evenodd" d="M10.5528 0.983986L0.798858 10.9203C0.249339 11.4792 0.249339 12.4124 0.798858 12.9736L10.5528 22.9076C11.151 23.5171 12.0954 23.5171 12.6936 22.9076C13.3264 22.2626 13.3264 21.1882 12.6936 20.542L4.52434 12.2207C4.37614 12.0703 4.37614 11.8213 4.52434 11.6709L12.6936 3.34955C13.3264 2.7045 13.3264 1.63018 12.6936 0.983986C12.3939 0.680974 12.0088 0.52832 11.6237 0.52832C11.2376 0.52832 10.8525 0.680974 10.5528 0.983986Z" fill="#FFA53A"/>
                                        </g>
                                    </svg>
                                </div>
                                <div className="uk-text-bolder uk-position-relative uk-margin-left" style={{top: 2}}>
                                    {current.specialist.name} {current.specialist.last_name}
                                </div>
                                <div className="tm-button-rate" data-uk-toggle="target: #tm-modal-rate-specialist;" style={{position: 'absolute', right: '20px'}}>
                                    <svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M7 0L8.5716 4.83688H13.6574L9.5429 7.82624L11.1145 12.6631L7 9.67376L2.8855 12.6631L4.4571 7.82624L0.342604 4.83688H5.4284L7 0Z" fill='#FFA53A'/>
                                    </svg>
                                    <span>Оценить</span>
                                </div>
                            </div>
                        )
                    }
                </div>
                <div id="tm-chat-body" className="tm-chat-body">
                    {
                        current.step === 1 && (
                            <div id="tm-messages-list" className="tm-specialists-list">
                                {
                                    specialists.length > 0 ? (
                                        <>
                                            {
                                                specialists.map((specialistItem, key) => (
                                                    <div className="tm-specialists-list-item" onClick={() => this.changeSpecialists(specialistItem)} key={key}>
                                                        {
                                                            (this.props.notifications.unreadChats[specialistItem.users[0].id] !== 'undefined' && this.props.notifications.unreadChats[specialistItem.users[0].id] > 0) && <div className="tm-badge">{this.props.notifications.unreadChats[specialistItem.users[0].id]}</div>
                                                        }
                                                        <div className="uk-grid-small" data-uk-grid>
                                                            <div className="uk-width-auto">
                                                                <div className="tm-picture">
                                                                    <img src={specialistItem.photo_path} alt="" />
                                                                </div>
                                                            </div>
                                                            <div className="uk-width-expand">
                                                                <div className="tm-name">
                                                                    {specialistItem.name} {specialistItem.last_name}
                                                                </div>
                                                                <div className="tm-position">
                                                                    {specialistItem.position}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            }
                                        </>
                                    ) : <div className="uk-text-center"><Link to="/support" className="uk-button uk-button-primary">Создать чат</Link></div>
                                }
                            </div>
                        )
                    }
                    {
                        current.step === 2 && (
                            <>
                                <div className="tm-messages-list">
                                    {
                                        isLoadedMessages ? (
                                            <>
                                                {
                                                    messages.length > 0 && (
                                                        messages.map((messageItem, key) => (
                                                            <div className="uk-clearfix" key={key}>
                                                                <div className={messageItem.my ? 'uk-align-right' : 'uk-align-left'}>
                                                                    <div className={`tm-messages-list-item ${messageItem.my ? 'tm-message-owner' : ''}`}>
                                                                        {
                                                                            !messageItem.my && (
                                                                                <div className="tm-name">{messageItem.owner_name}</div>
                                                                            )
                                                                        }
                                                                        <div className="tm-text">
                                                                            {
                                                                                messageItem.file.id && (
                                                                                    <img src={messageItem.file.path} alt="" style={{marginBottom: 5}} />
                                                                                )
                                                                            }
                                                                            {messageItem.message.split("\n").map((i,key) => {
                                                                                return <div key={key}>{i}</div>;
                                                                            })}
                                                                        </div>
                                                                        <div className="tm-date">{messageItem.time_text}</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )
                                                }
                                            </>
                                        ) : (
                                            <div data-uk-spinner />
                                        )
                                    }
                                    <div ref={(el) => { this.messagesEnd = el; }} />
                                </div>
                            </>
                        )
                    }
                </div>
                {
                    current.step === 2 && (
                        <div className="tm-chat-footer">
                            <div className="tm-message-create">
                                <div className="uk-grid-small uk-flex uk-flex-middle" data-uk-grid>
                                    <div className="uk-width-auto">
                                        <div className="tm-button-attachments" data-uk-form-custom>
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <g clipPath="url(#clip0)">
                                                    <path d="M11.8983 6.58727C11.8983 6.58727 12.5454 6.09525 12.0528 5.60322C11.5603 5.1112 11.0814 5.74614 11.0814 5.74614L6.13008 10.6985C6.13008 10.6985 4.97043 12.1952 4.08869 11.2902C3.208 10.3842 4.67985 9.24831 4.67985 9.24831L11.1721 2.75655C11.1721 2.75655 12.6872 1.08747 14.1116 2.5108C15.5339 3.93467 13.8601 5.45293 13.8601 5.45293L6.56515 12.7478C6.56515 12.7478 4.23107 15.4442 2.07049 13.2831C-0.0900868 11.122 2.63266 8.8143 2.63266 8.8143L8.17096 3.27442C8.17096 3.27442 8.79113 2.75655 8.32653 2.29037C7.85981 1.82471 7.34301 2.44594 7.34301 2.44594L0.98783 8.80111C0.98783 8.80111 -1.41112 11.4321 1.26786 14.1105C3.94683 16.7906 6.57939 14.3916 6.57939 14.3916L15.314 5.65596C15.314 5.65596 17.0617 3.72847 14.9781 1.64383C12.8945 -0.440812 10.9665 1.30685 10.9665 1.30685L3.45059 8.82168C3.45059 8.82168 1.52573 10.3874 3.27234 12.133C5.01894 13.8806 6.55619 11.9273 6.55619 11.9273L11.8983 6.58727Z" fill="#251716"/>
                                                </g>
                                                <defs>
                                                    <clipPath id="clip0">
                                                        <rect width="16" height="16" fill="white"/>
                                                    </clipPath>
                                                </defs>
                                            </svg>
                                            <input type="file" accept="image/*" onChange={this.actionUploadFile} />
                                        </div>
                                    </div>
                                    <div className="uk-width-expand">
                                        <TextareaAutosize className="uk-textarea" style={{resize: 'none'}} placeholder="Написать сообщение" name="message" ref={input => this.message = input} onChange={this.changeField} onKeyDown={this.onKeyDown} />
                                    </div>
                                    <div className="uk-width-auto">
                                        <div className="tm-button-create-message" onClick={this.actionCreateMessage}>
                                            <svg width="23" height="22" viewBox="0 0 23 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M22.7586 11.5595C22.7586 11.5532 22.7651 11.5532 22.7651 11.547C22.8106 11.4782 22.8497 11.4032 22.8758 11.3282C22.8823 11.3094 22.8888 11.2907 22.8953 11.2657C22.9214 11.1844 22.9344 11.0969 22.9344 11.0031C22.9344 10.9093 22.9148 10.8218 22.8953 10.7405C22.8888 10.7218 22.8823 10.703 22.8758 10.678C22.8497 10.5967 22.8106 10.5217 22.7651 10.4529C22.7651 10.4529 22.7651 10.4467 22.7586 10.4467C22.7065 10.3717 22.6478 10.3092 22.5762 10.2529C22.5632 10.2404 22.5437 10.2279 22.5306 10.2154C22.459 10.1591 22.3809 10.1091 22.2962 10.0779L-0.541782 0.881706C-0.952046 0.719164 -1.42092 0.81919 -1.71396 1.13177C-2.01352 1.44435 -2.07213 1.90697 -1.85723 2.27582L3.02685 11.0031L-1.86374 19.7241C-2.07213 20.0992 -2.01352 20.5556 -1.72047 20.8682C-1.70745 20.8807 -1.69443 20.8932 -1.68791 20.9057C-1.38836 21.1932 -0.939021 21.2808 -0.548295 21.1182L22.2897 11.9221C22.3743 11.8908 22.4525 11.8408 22.5241 11.7845C22.5437 11.772 22.5567 11.7595 22.5762 11.7408C22.6478 11.6908 22.713 11.6283 22.7586 11.5595ZM1.36627 3.82622L16.7153 10.0028H4.83071L1.36627 3.82622ZM1.36627 18.18L4.83071 12.0034H16.7088L1.36627 18.18Z" fill="#FFA35A"/>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="tm-message-attachments">
                                {
                                    current.chat.previews.id > 0 && (
                                        <div>
                                            <div className="tm-button-delete" onClick={this.removePreview}>
                                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M11.2877 0.712476C11.0201 0.4448 10.5908 0.4448 10.3231 0.712476L5.99986 5.03571L1.67663 0.712476C1.40896 0.4448 0.979664 0.4448 0.711988 0.712476C0.444311 0.980153 0.444311 1.40945 0.711988 1.67712L5.03521 6.00036L0.711988 10.3236C0.444311 10.5913 0.444311 11.0206 0.711988 11.2882C0.843301 11.4195 1.02007 11.4903 1.19179 11.4903C1.3635 11.4903 1.54027 11.4246 1.67158 11.2882L5.99481 6.965L10.318 11.2882C10.4493 11.4195 10.6261 11.4903 10.7978 11.4903C10.9746 11.4903 11.1463 11.4246 11.2776 11.2882C11.5453 11.0206 11.5453 10.5913 11.2776 10.3236L6.96451 6.00036L11.2877 1.67712C11.5554 1.40945 11.5554 0.980153 11.2877 0.712476Z" fill="#251716" fillOpacity="0.6"/>
                                                </svg>
                                            </div>
                                            <img src={current.chat.previews.path} alt="" />
                                        </div>
                                    )
                                }
                            </div>
                            <div id="tm-modal-chat-limits" className="uk-flex-top" data-uk-modal="stack: true;">
                                <div className="uk-modal-dialog uk-margin-auto-vertical uk-width-1-3@s">
                                    <button className="uk-modal-close-full uk-close-large" type="button" data-uk-close />
                                    <div className="uk-padding-large uk-text-center">
                                        <p>Превышен дневной лимит сообщений</p>
                                        <div className="uk-button uk-button-primary uk-modal-close">Закрыть</div>
                                    </div>
                                </div>
                            </div>
                            <div id="tm-modal-rate-specialist" className="uk-flex-top" data-uk-modal="stack: true;">
                                <div className="uk-modal-dialog uk-margin-auto-vertical uk-width-1-3@s">
                                    <button className="uk-modal-close-full uk-close-large" type="button" data-uk-close />
                                    <div className="uk-padding-large uk-text-center">
                                        <h3 className="uk-h3 uk-text-bolder">Оцените специалиста</h3>
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
                    )
                }
            </div>
        );
    }
}

const mapStateToProps = state => state;
export default connect(mapStateToProps)(Chat);
