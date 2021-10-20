import React from 'react';
import { connect } from 'react-redux';
import { Link } from "react-router-dom";
import store from "../../store";

const navigationLinks = [
    {
        icon: 'icon-message',
        path: 'message'
    },
    {
        icon: 'icon-profile',
        path: 'profile'
    },
    {
        icon: 'icon-notification',
        path: 'notification'
    }
];

class Header extends React.Component {
    constructor(props) {
       super(props);

       this.toggleChat = this.toggleChat.bind(this);
    }

    toggleChat = () => {
        document.getElementsByTagName('body')[0].style = 'overflow: hidden;';

        store.dispatch({
            type: "TOGGLE_CHAT",
            payload: {
                isOpen: true
            }
        });
    };

    render() {
        let { page } = this.props;
        let showHelpItem = false;

        const currentPath = window.location.pathname.split('/');
        const storeState = store.getState();
        const { helpVideos } = storeState;

        if (helpVideos[currentPath[1]]) {
            showHelpItem = true;
        }

        return (
            <>
                <div className="tm-header">
                    <nav className="uk-navbar uk-container uk-container-large uk-navbar-transparent">
                        <div className="uk-navbar-left">
                            <ul className="uk-navbar-nav">
                                {
                                    page.header.navigation && (
                                        <li className="uk-navbar-item" data-uk-toggle="target: #offcanvas-usage">
                                            <div className="tm-icon tm-icon-toggle">
                                            <svg width="42" height="27" viewBox="0 0 42 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                                              <path d="M1 1H41" stroke="#251716" stroke-width="2" stroke-linecap="round"/>
                                              <path d="M1 13H41" stroke="#251716" stroke-width="2" stroke-linecap="round"/>
                                              <path d="M1 25H17" stroke="#251716" stroke-width="2" stroke-linecap="round"/>
                                            </svg>
                                            </div>
                                        </li>
                                    )
                                }
                                <li className="uk-navbar-item uk-visible@m">
                                    {
                                        page.header.title && (
                                            <h1 className="uk-h1 uk-margin-remove" style={{fontWeight: 700, fontSize: 54}}>{page.header.title}</h1>
                                        )
                                    }
                                </li>
                            </ul>
                        </div>
                        <div className="uk-navbar-right">
                            {
                                page.header.navigation && (
                                    <ul className="uk-navbar-nav">
                                        {
                                            showHelpItem && (
                                                <li className="uk-navbar-item">
                                                    <a href="#" style={{padding: 0}} data-uk-toggle="target: #tm-modal-help-video;">
                                                        <div className="tm-icon tm-icon-help">
                                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <g clip-path="url(#clip0)">
                                                                    <path d="M11.6244 18.28C11.1208 18.28 10.7127 17.8718 10.7127 17.3682C10.7127 16.8647 11.1208 16.4565 11.6244 16.4565C12.128 16.4565 12.5361 16.8647 12.5361 17.3682C12.5361 17.8718 12.128 18.28 11.6244 18.28ZM12.5361 14.1772V12.953C14.299 12.5265 15.5204 10.9271 15.4508 9.11843C15.3751 7.14898 13.7593 5.54759 11.7722 5.47316C10.7106 5.43292 9.70802 5.81328 8.95016 6.54318C8.20529 7.26063 7.7952 8.22328 7.7952 9.25395C7.7952 9.75753 8.20333 10.1657 8.70691 10.1657C9.2105 10.1657 9.61863 9.75753 9.61863 9.25395C9.61863 8.7233 9.83036 8.22702 10.215 7.85663C10.6128 7.4736 11.1411 7.27434 11.7038 7.29517C12.7439 7.33435 13.5894 8.16594 13.6288 9.18859C13.6653 10.1416 13.0075 10.9837 12.0642 11.1906C11.2685 11.3653 10.7127 12.053 10.7127 12.8632V14.1772C10.7127 14.6808 11.1208 15.0889 11.6244 15.0889C12.128 15.0889 12.5361 14.6808 12.5361 14.1772ZM17.7084 21.6581C18.1391 21.3973 18.2768 20.8367 18.0159 20.4061C17.7548 19.9754 17.1943 19.8377 16.7637 20.0986C15.2323 21.0262 13.4708 21.5166 11.67 21.5166C6.24064 21.5166 1.82344 17.0994 1.82344 11.67C1.82344 6.24064 6.24064 1.82344 11.67 1.82344C17.0994 1.82344 21.5166 6.24064 21.5166 11.67C21.5166 13.6115 20.9393 15.5012 19.847 17.1351C19.5671 17.5536 19.6796 18.1199 20.0981 18.3998C20.5167 18.6797 21.083 18.5672 21.3627 18.1485C22.6564 16.2138 23.34 13.9735 23.34 11.67C23.34 8.55288 22.1261 5.62221 19.9219 3.41805C17.7178 1.2139 14.7871 0 11.67 0C8.55288 0 5.62221 1.2139 3.41805 3.41805C1.2139 5.62221 0 8.55288 0 11.67C0 14.7871 1.2139 17.7178 3.41805 19.9219C5.62221 22.1261 8.55288 23.34 11.67 23.34C13.804 23.34 15.892 22.7584 17.7084 21.6581Z" fill="currentColor" fill-opacity="0.6"/>
                                                                </g>
                                                                <defs>
                                                                    <clipPath id="clip0">
                                                                        <rect width="23.34" height="23.34" fill="currentColor"/>
                                                                    </clipPath>
                                                                </defs>
                                                            </svg>
                                                        </div>
                                                    </a>
                                                </li>
                                            )
                                        }

                                        <li className="uk-navbar-item">
                                            <div style={{padding: 0}} onClick={this.toggleChat}>
                                                {
                                                    this.props.notifications.unreadChatsTotalMessage > 0 && <div className="tm-badge">{this.props.notifications.unreadChatsTotalMessage}</div>
                                                }
                                                <div className="tm-icon tm-icon-message">
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M11.9899 23.67C10.0923 23.67 8.20981 23.2032 6.53539 22.3101C4.98274 23.4112 3.46562 23.6446 2.45589 23.6446C2.13623 23.6446 1.82164 23.6192 1.52735 23.5736C1.01488 23.4924 0.619107 23.0966 0.542998 22.5841C0.461814 22.0717 0.720587 21.5744 1.18739 21.3461C2.04997 20.9199 2.62841 20.0624 2.96837 19.3926C1.14173 17.1702 0.213188 14.3592 0.345112 11.467C0.477036 8.54946 1.68465 5.8095 3.74469 3.74946C5.9468 1.54227 8.87957 0.32959 11.995 0.32959C15.1104 0.32959 18.0381 1.54227 20.2453 3.74946C22.4525 5.95665 23.6703 8.88942 23.6703 11.9998C23.6703 15.1152 22.4576 18.0429 20.2504 20.2501C19.1443 21.3562 17.8504 22.2137 16.4094 22.8023C14.9988 23.3808 13.5121 23.67 11.9899 23.67ZM6.46942 20.6509C6.60642 20.6509 6.73835 20.6865 6.85505 20.7575C8.41276 21.6708 10.1836 22.1528 11.9899 22.1528C14.7045 22.1528 17.2567 21.0975 19.1747 19.1744C21.0876 17.2615 22.143 14.7093 22.143 11.9947C22.143 9.28012 21.0876 6.73297 19.1696 4.815C17.2567 2.90211 14.7096 1.84671 11.995 1.84671C9.28042 1.84671 6.7282 2.90211 4.8153 4.815C1.0301 8.60528 0.842363 14.7093 4.38909 18.7177C4.49057 18.8345 4.55653 18.9816 4.57175 19.1389C4.61234 19.2962 4.59712 19.4636 4.53116 19.6209C4.20642 20.3668 3.63813 21.3765 2.75019 22.1173C3.58232 22.0717 4.72397 21.8027 5.88591 20.9046C5.90621 20.8894 5.92651 20.8742 5.9468 20.859C6.0838 20.7271 6.27154 20.6509 6.46942 20.6509Z" fill="currentColor" fillOpacity="0.6"/>
                                                    </svg>
                                                </div>
                                            </div>
                                        </li>
                                        <li className="uk-navbar-item">
                                            <Link to="/profile" style={{padding: 0}}>
                                                <div className="tm-icon tm-icon-profile">
                                                    <svg width="20" height="24" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M10.0085 24C6.09604 24 2.42067 22.0861 0.168022 18.885C-0.0521618 18.5632 -0.0182876 18.1228 0.269645 17.8518C1.62462 16.5476 3.38609 15.8024 5.26612 15.7685H5.41855V13.3296L5.38468 13.2788C4.47007 12.1948 3.97889 10.8229 3.97889 9.40014V6.04658C3.96195 2.70995 6.6719 0 10.0085 0C13.3452 0 16.0551 2.70995 16.0551 6.04658V9.41708C16.0551 10.8398 15.5639 12.2117 14.6493 13.2957L14.5985 13.3296V15.7516H14.7509C16.631 15.8024 18.3924 16.5476 19.7474 17.8349C20.0353 18.1059 20.0692 18.5462 19.849 18.868C17.5964 22.0861 13.921 24 10.0085 24ZM5.43549 17.3606C4.19907 17.3606 3.03041 17.7332 2.03111 18.4446L1.89561 18.5462L1.99724 18.6648C3.97889 21.036 6.90902 22.4079 9.99159 22.4079C13.0911 22.4079 16.0043 21.0529 17.9859 18.6648L18.0876 18.5462L17.9521 18.4446C16.9528 17.7332 15.7841 17.3606 14.5477 17.3606H13.7855C13.3452 17.3606 12.9895 17.0049 12.9895 16.5646V14.6676L12.7693 14.7862C11.9055 15.2265 10.9739 15.4637 9.99159 15.4637C9.00924 15.4637 8.06075 15.2435 7.21389 14.7862L6.99371 14.6676V16.5646C6.99371 17.0049 6.63803 17.3606 6.19766 17.3606H5.43549ZM10.0085 1.5921C7.55264 1.5921 5.57099 3.59068 5.57099 6.04658V9.41708C5.57099 10.5688 6.01135 11.6528 6.79046 12.4827C7.63732 13.3804 8.78905 13.8716 10.0085 13.8716C11.2449 13.8716 12.3797 13.3804 13.2266 12.4827C14.0226 11.6528 14.4461 10.5688 14.4461 9.41708V6.04658C14.4461 3.59068 12.4475 1.5921 10.0085 1.5921Z" fill="currentColor" fillOpacity="0.6"/>
                                                    </svg>
                                                </div>
                                            </Link>
                                        </li>
                                        <li className="uk-navbar-item">
                                            <Link to="/notifications" style={{padding: 0}}>
                                                {
                                                    this.props.notifications.unreadCount > 0 && <div className="tm-badge">{this.props.notifications.unreadCount}</div>
                                                }
                                                <div className="tm-icon tm-icon-bell">
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <g clipPath="url(#clip0)">
                                                            <path d="M11.8912 3.34326C7.54491 3.34326 4.00903 6.87914 4.00903 11.2255V19.5969H5.63981V11.2255C5.63981 7.77853 8.44397 4.97404 11.8912 4.97404C15.3385 4.97404 18.1427 7.77848 18.1427 11.2255V19.5969H19.7735V11.2255C19.7735 6.87914 16.2376 3.34326 11.8912 3.34326Z" fill="currentColor" fillOpacity="0.6"/>
                                                            <path d="M20.6977 18.7812H3.30245C2.85208 18.7812 2.48706 19.1463 2.48706 19.5966C2.48706 20.047 2.85208 20.412 3.30245 20.412H20.6977C21.1481 20.412 21.5131 20.047 21.5131 19.5966C21.5131 19.1463 21.148 18.7812 20.6977 18.7812Z" fill="currentColor" fillOpacity="0.6"/>
                                                            <path d="M11.8914 0C10.5126 0 9.39087 1.12172 9.39087 2.50055C9.39087 3.87937 10.5126 5.00109 11.8914 5.00109C13.2702 5.00109 14.392 3.87937 14.392 2.50055C14.392 1.12172 13.2702 0 11.8914 0ZM11.8914 3.37031C11.4199 3.37031 11.0217 2.97188 11.0217 2.50055C11.0217 2.02898 11.4199 1.63078 11.8914 1.63078C12.363 1.63078 12.7612 2.02898 12.7612 2.50055C12.7612 2.97211 12.363 3.37031 11.8914 3.37031Z" fill="currentColor" fillOpacity="0.6"/>
                                                            <path d="M13.3046 19.5967V21.0101C13.3046 21.7594 12.695 22.3691 11.9456 22.3691C11.1963 22.3691 10.5866 21.7594 10.5866 21.0101V19.5967H8.95581V21.0101C8.95581 22.6585 10.2971 23.9999 11.9456 23.9999C13.5941 23.9999 14.9355 22.6586 14.9355 21.0101V19.5967H13.3046Z" fill="currentColor" fillOpacity="0.6"/>
                                                        </g>
                                                        <defs>
                                                            <clipPath id="clip0">
                                                                <rect width="24" height="24" fill="currentColor" />
                                                            </clipPath>
                                                        </defs>
                                                    </svg>
                                                </div>
                                            </Link>
                                        </li>
                                    </ul>
                                )
                            }
                        </div>
                    </nav>
                </div>
                <div id="tm-modal-help-video" className="uk-flex-top" data-uk-modal="stack: true;">
                    <div className="uk-modal-dialog uk-margin-auto-vertical uk-width-2-3@s">
                        <div className="uk-padding-small uk-text-center">
                            <div dangerouslySetInnerHTML={{__html: helpVideos[currentPath[1]]}} />
                            <div className="uk-margin-top">
                                <div className="uk-button uk-button-primary uk-modal-close">Закрыть</div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

const mapStateToProps = state => state;
export default connect(mapStateToProps)(Header)