import React from 'react';
import axios from 'axios';
import store from "../../utils/store";
import { connect } from "react-redux";
import TextareaAutosize from 'react-textarea-autosize';
import ScrollContainer from 'react-indiana-drag-scroll';
import TextTruncate from 'react-text-truncate';
import UIkit from "uikit";
import ReactCrop from 'react-image-crop';

axios.defaults.baseURL = 'https://api-academy.zubareva.online';

const reportsDays = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28];

const cropWidth = window.innerWidth >= 960 ? 150 : 75;
const cropHeight = window.innerWidth >= 960 ? 300 : 150;

class Reports extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentCrop: null,
            currentCropItem: null,
            currentCropImage: null,
            src: null,
            imageBlob: null,
            crop: {
                aspect: 9 / 16,
                unit: 'px',
                x: 50,
                y: 50,
                width: cropWidth,
                height: cropHeight
            },
            isLoaded: false,
            isMeat1: true,
            isMeat2: false,
            isMeat3: false,
            isMeat4: false,
            isMeat5: false,
            activeTab: 1,
            activeArchiveDay: {
                id: false,
                number: false
            },
            reportsComments: [],
            createArchiveComment: {
                report_id: 0,
                text: null
            },
            waters: [],
            report: {
                day: 1,
                water: 32,
                eats: [{
                    type: null,
                    text: null,
                    photo: {
                        id: null,
                        path: null
                    }
                }, {
                    type: null,
                    text: null,
                    photo: {
                        id: null,
                        path: null
                    }
                }, {
                    type: null,
                    text: null,
                    photo: {
                        id: null,
                        path: null
                    }
                }, {
                    type: null,
                    text: null,
                    photo: {
                        id: null,
                        path: null
                    }
                }, {
                    type: null,
                    text: null,
                    photo: {
                        id: null,
                        path: null
                    }
                }]
            },
            nutrition: {
                menus: [],
                meals: []
            },
            body: {
                before: [],
                after: []
            },
            bodyComment: {
                before: null,
                after: null
            },
            createBodyComment: {
                before: null,
                after: null
            },
            archive: [],
            archiveDetail: {
                menu: [],
                eats: [],
                result: []
            },
            popup: {
                message: null
            }
        };

        this.actionCreateArchiveComment = this.actionCreateArchiveComment.bind(this);
        this.changeFieldArchive = this.changeFieldArchive.bind(this);
        this.changeTab = this.changeTab.bind(this);
        this.changeDay = this.changeDay.bind(this);
        this.addMeat = this.addMeat.bind(this);
        this.changeField = this.changeField.bind(this);
        this.changeFieldEats = this.changeFieldEats.bind(this);
        this.actionUploadFile = this.actionUploadFile.bind(this);
        this.actionGetFile = this.actionGetFile.bind(this);
        this.actionCreateReport = this.actionCreateReport.bind(this);
        this.actionGetArchive = this.actionGetArchive.bind(this);
        this.actionGetBody = this.actionGetBody.bind(this);
        this.actionCreateBody = this.actionCreateBody.bind(this);
        this.actionGetBodyComment = this.actionGetBodyComment.bind(this);
        this.actionCreateBodyComment = this.actionCreateBodyComment.bind(this);
        this.changeFieldBody = this.changeFieldBody.bind(this);
        this.actionReplaceBody = this.actionReplaceBody.bind(this);
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
    }

    async componentWillMount() {
        const accessToken = localStorage.getItem("accessToken");

        await fetch( 'https://api-academy.zubareva.online/api/recipes/menu', {
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
                    nutrition: {
                        ...this.state.nutrition,
                        menus: result.list
                    },
                    report: {
                        ...this.state.report,
                        menu: result.list.length > 0 ? result.list[0].id : []
                    }
                })
            },(error) => {
                console.log(error)
            }
        );

        await fetch( `https://api-academy.zubareva.online/api/directory/recipetype`, {
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
                    nutrition: {
                        ...this.state.nutrition,
                        meals: result.list
                    },
                    report: {
                        ...this.state.report,
                        eats: {0:{
                                ...this.state.report.eats[0],
                                type: result.list[0].id
                            }, 1:{
                                ...this.state.report.eats[1],
                                type: result.list[0].id
                            }, 2:{
                                ...this.state.report.eats[2],
                                type: result.list[0].id
                            }, 3:{
                                ...this.state.report.eats[3],
                                type: result.list[0].id
                            }, 4:{
                                ...this.state.report.eats[4],
                                type: result.list[0].id
                            }}
                    }
                })
            },(error) => {
                console.log(error)
            }
        );

         await fetch( 'https://api-academy.zubareva.online/api/directory/water.php', {
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
                    waters:  result.list
                });
            },(error) => {
                console.log(error)
            }
        );

        store.dispatch({
            type: "CHANGE_PAGE",
            payload: {
                body: {
                    class: "tm-page-reports"
                },
                header: {
                    navigation: true,
                    title: "Отчёты"
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

        if (!accessToken) {
            this.props.history.push('/signin');
        }
    }

    activeArchiveDay = (id, number) => {
        this.setState({
            activeArchiveDay: {
                id: id,
                number: number,
            }
        });

        this.actionGetReportComments(id);
    };

    changeFieldArchive = (e) => {
        this.setState({
            createArchiveComment: {
                ...this.state.createArchiveComment,
                [e.target.name]: e.target.value
            }
        })
    };

    changeTab = (tab) => {
        this.setState({
            activeTab: tab
        });

        if (tab === 2) {
            this.actionGetBody();
            this.actionGetBodyComment();

        }

        if (tab === 3) {
            this.actionGetArchive();
        }
    };

    changeDay = (day) => {
        this.setState({
            report: {
                ...this.state.report,
                day: day + 1
            }
        })
    };

    addMeat = () => {
        if (!this.state.isMeat2) {
            this.setState({
                isMeat2: true
            });

            setTimeout(() => (
                UIkit.scroll().scrollTo('#tm-report-meat-2')
            ), 100);

            return false;
        }

        if (!this.state.isMeat3) {
            this.setState({
                isMeat3: true
            });

            setTimeout(() => (
                UIkit.scroll().scrollTo('#tm-report-meat-3')
            ), 100);

            return false;
        }

        if (!this.state.isMeat4) {
            this.setState({
                isMeat4: true
            });

            setTimeout(() => (
                UIkit.scroll().scrollTo('#tm-report-meat-4')
            ), 100);

            return false;
        }

        if (!this.state.isMeat5) {
            this.setState({
                isMeat5: true
            });

            setTimeout(() => (
                UIkit.scroll().scrollTo('#tm-report-meat-5')
            ), 100);

            return false;
        }
    };

    removeMeat = (key) => {
        if (key === 2) {
            this.setState({
                isMeat2: false,
                report: {
                    ...this.state.report,
                    eats: {
                        ...this.state.report.eats,
                        1: {
                            ...this.state.report.eats[1],
                            text: null
                        }
                    }
                }
            });
        }

        if (key === 3) {
            this.setState({
                isMeat3: false,
                report: {
                    ...this.state.report,
                    eats: {
                        ...this.state.report.eats,
                        2: {
                            ...this.state.report.eats[2],
                            text: null
                        }
                    }
                }
            });
        }

        if (key === 4) {
            this.setState({
                isMeat4: false,
                report: {
                    ...this.state.report,
                    eats: {
                        ...this.state.report.eats,
                        3: {
                            ...this.state.report.eats[3],
                            text: null
                        }
                    }
                }
            });
        }

        if (key === 5) {
            this.setState({
                isMeat5: false,
                report: {
                    ...this.state.report,
                    eats: {
                        ...this.state.report.eats,
                        4: {
                            ...this.state.report.eats[4],
                            text: null
                        }
                    }
                }
            });
        }
    };

    changeField = (e) => {
        this.setState({
            report: {
                ...this.state.report,
                [e.target.name]: e.target.name === 'menu' ? parseInt(e.target.value) : e.target.value
            }
        })
    };

    changeFieldEats = (e, meal) => {
        this.setState({
            report: {
                ...this.state.report,
                eats: {
                    ...this.state.report.eats,
                    [meal]: {
                        ...this.state.report.eats[meal],
                        [e.target.name]: e.target.name === 'type' ? parseInt(e.target.value) : e.target.value
                    }
                }
            }
        })
    };

    changeFieldBody = (e, bodyType) => {
        this.setState({
            createBodyComment: {
                ...this.state.createBodyComment,
                [bodyType]: e.target.value
            }
        })
    };

    async actionCreateBody(data) {
        const accessToken = localStorage.getItem("accessToken");

        await fetch( 'https://api-academy.zubareva.online/api/report/body', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : accessToken
            },
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(
            (result) => {
                this.actionGetBody();
            },(error) => {
                console.log(error)
            }
        );
    };

    async actionReplaceBody(data) {
        const accessToken = localStorage.getItem("accessToken");

        await fetch( 'https://api-academy.zubareva.online/api/report/replace_body', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : accessToken
            },
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(
            (result) => {
                this.actionGetBody();
            },(error) => {
                console.log(error)
            }
        );
    };

    actionGetFile = (meal = null, bodyType = null, bodyItem = null, fileId) => {
        const accessToken = localStorage.getItem("accessToken");

        fetch( `https://api-academy.zubareva.online/api/file/get?id=${fileId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization' : accessToken
            }
        })
        .then(res => res.json())
        .then(
            (result) => {
                if (meal) {
                    this.setState({
                        report: {
                            ...this.state.report,
                            eats: {
                                ...this.state.report.eats,
                                [meal]: {
                                    ...this.state.report.eats[meal],
                                    photo: {
                                        id: result.id,
                                        path: result.path
                                    }
                                }
                            }
                        }
                    })
                }
                else if (bodyType) {
                    if (bodyItem !== null) {
                        this.actionReplaceBody({
                            id: this.state.body[bodyType][bodyItem].id,
                            file_id: result.id
                        });
                    }
                    else {
                        this.actionCreateBody({
                            photo_id: result.id,
                            type: bodyType
                        });
                    }
                }
            },(error) => {
                console.log(error)
            }
        );
    };

    onSelectFile = (e, currentCrop, currentItem, item) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener('load', () =>
                this.setState({ src: reader.result, currentCrop: currentCrop, currentCropItem: currentItem, currentCropItemIndex: item, currentCropImage: e.target.files[0]})
            );
            reader.readAsDataURL(e.target.files[0]);

            UIkit.modal('#tm-modal-avatar-crop').show();
        }
    };

    actionUploadFile = (e, meal = null, bodyType = null, bodyItem = null) => {
        const accessToken = localStorage.getItem("accessToken");
        const formData = new FormData();

        let reader = new FileReader();
        let base64data;
        let $this = this;

        if (bodyType) {
            reader.readAsDataURL(this.state.imageBlob);
            reader.onloadend = function() {
                base64data = reader.result;

                fetch( `https://api-academy.zubareva.online/api/file/add`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization' : accessToken
                    },
                    body: JSON.stringify({
                        file: base64data
                    })
                })
                .then(res => res.json())
                .then(
                    (result) => {
                        $this.actionGetFile(meal = null, bodyType, bodyItem, result.id);
                        UIkit.modal('#tm-modal-avatar-crop').hide();
                    },(error) => {
                        console.log(error)
                    }
                );
            };
        }
        else {
            reader.readAsDataURL(e.target.files[0]);

            reader.onloadend = function() {
                base64data = reader.result;

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
                    if (meal) {
                        $this.actionGetFile(meal, bodyType = null, null, response.data.id);
                    }
                    else if (bodyType) {
                        $this.actionGetFile(meal = null, bodyType, bodyItem, response.data.id);
                        UIkit.modal('#tm-modal-avatar-crop').hide();
                    }
                })
                .catch((error) => {
                    console.log(error)
                });
            };
        }
    };

    actionCreateReport = () => {
        const accessToken = localStorage.getItem("accessToken");
        let reportEats = this.state.report.eats;
        let newReportEats = [];

        if (reportEats[0].text) {
            newReportEats.push(reportEats[0])
        }

        if (reportEats[1].text) {
            newReportEats.push(reportEats[1])
        }

        if (reportEats[2].text) {
            newReportEats.push(reportEats[2])
        }

        if (reportEats[3].text) {
            newReportEats.push(reportEats[3])
        }

        if (reportEats[4].text) {
            newReportEats.push(reportEats[4])
        }

        fetch( 'https://api-academy.zubareva.online/api/report/eat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : accessToken
            },
            body: JSON.stringify({
                ...this.state.report,
                eats: newReportEats
            })
        })
        .then(res => res.json())
        .then(
            (result) => {
                if (result.message) {
                    this.setState({
                        popup: {
                            message: result.message
                        }
                    });

                    UIkit.modal('#tm-modal-report').toggle();
                }

                if (result.status === 'success') {
                    this.comment.value = '';
                    this.text0.value = '';

                    if (this.text1) {
                        this.text1.value = '';
                    }

                    if (this.text2) {
                        this.text2.value = '';
                    }

                    if (this.text3) {
                        this.text3.value = '';
                    }

                    if (this.text4) {
                        this.text4.value = '';
                    }

                    this.refMeatType.value = this.state.nutrition.meals[0].id;

                    this.setState({
                        isMeat1: true,
                        isMeat2: false,
                        isMeat3: false,
                        isMeat4: false,
                        isMeat5: false,
                        report: {
                            day: 1,
                            water: 34263,
                            eats: [{
                                type: this.state.nutrition.meals[0].id,
                                text: null,
                                photo: {
                                    id: null,
                                    path: null
                                }
                            }, {
                                type: this.state.nutrition.meals[0].id,
                                text: null,
                                photo: {
                                    id: null,
                                    path: null
                                }
                            }, {
                                type: this.state.nutrition.meals[0].id,
                                text: null,
                                photo: {
                                    id: null,
                                    path: null
                                }
                            }, {
                                type: this.state.nutrition.meals[0].id,
                                text: null,
                                photo: {
                                    id: null,
                                    path: null
                                }
                            }, {
                                type: this.state.nutrition.meals[0].id,
                                text: null,
                                photo: {
                                    id: null,
                                    path: null
                                }
                            }]
                        },
                    })
                }

            },(error) => {
                console.log(error)
            }
        );
    };

    actionGetArchive = () => {
        const accessToken = localStorage.getItem("accessToken");

        fetch( 'https://api-academy.zubareva.online/api/report/checked', {
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
                    archive:  result.list
                });
            },(error) => {
                console.log(error)
            }
        );
    };

    async actionGetBody() {
        const accessToken = localStorage.getItem("accessToken");

        await fetch( 'https://api-academy.zubareva.online/api/report/get_body', {
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
                    body: result
                })
            },(error) => {
                console.log(error)
            }
        );
    };

    actionCreateBodyComment = (bodyType) => {
        const accessToken = localStorage.getItem("accessToken");

        fetch( `https://api-academy.zubareva.online/api/report/body_comment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : accessToken
            },
            body: JSON.stringify({
                type: bodyType,
                comment: this.state.createBodyComment[bodyType]
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

    actionGetBodyComment = () => {
        const accessToken = localStorage.getItem("accessToken");

        fetch( `https://api-academy.zubareva.online/api/report/body_comment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : accessToken
            }
        })
        .then(res => res.json())
        .then(
            (result) => {
                this.setState({
                    bodyComment: result
                })
            },(error) => {
                console.log(error)
            }
        );
    };

    actionGetArchiveDetail = (archiveId) => {
        const accessToken = localStorage.getItem("accessToken");

        fetch( `https://api-academy.zubareva.online/api/report/checked_detail?id=${archiveId}`, {
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
                    archiveDetail: {
                        ...result.detail,
                        menu: result.detail.menu !== null ? result.detail.menu : []
                    }
                });

                UIkit.modal('#tm-modal-report-archive-detail').show();

            },(error) => {
                console.log(error)
            }
        );
    };

    actionGetReportComments = (reportId) => {
        const accessToken = localStorage.getItem("accessToken");

        fetch( `https://api-academy.zubareva.online/api/report/get_questions?report_id=${reportId}`, {
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
                    reportsComments: result
                });
            },(error) => {
                console.log(error)
            }
        );
    };

    actionCreateArchiveComment = (archiveId) => {
        const accessToken = localStorage.getItem("accessToken");

        fetch( `https://api-academy.zubareva.online/api/report/add_question`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : accessToken
            },
            body: JSON.stringify({
                report_id: archiveId,
                text: this.state.createArchiveComment.text
            })
        })
        .then(res => res.json())
        .then(
            (result) => {
                this.actionGetArchive();
            },(error) => {
                console.log(error)
            }
        );
    };

    // If you setState the crop in here you should return false.
    onImageLoaded = image => {
        this.imageRef = image;
    };

    onCropComplete = crop => {
        this.makeClientCrop(crop);
    };

    onCropChange = (crop, percentCrop) => {
        // You could also use percentCrop:
        // this.setState({ crop: percentCrop });
        this.setState({ crop });
    };

    async makeClientCrop(crop) {
        if (this.imageRef && crop.width && crop.height) {
            const croppedImageUrl = await this.getCroppedImg(
                this.imageRef,
                crop,
                'newFile.jpeg'
            );

            this.setState({ croppedImageUrl });
        }
    }

    getCroppedImg(image, crop, fileName) {
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        const $this = this;
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height
        );

        return new Promise((resolve, reject) => {
            canvas.toBlob(blob => {
                if (!blob) {
                    //reject(new Error('Canvas is empty'));
                    console.error('Canvas is empty');
                    return;
                }

                $this.setState({
                    imageBlob: blob
                }) ;

                blob.name = fileName;
                window.URL.revokeObjectURL(this.fileUrl);
                this.fileUrl = window.URL.createObjectURL(blob);
                resolve(this.fileUrl);
            }, 'image/jpeg');
        });

    }

    render() {
        const { isLoaded, report, nutrition, archive, archiveDetail, reportsComments, body, bodyComment, crop, croppedImageUrl, src } = this.state;

        return (
            <div className="uk-container uk-container-large uk-section">
                <div className="uk-hidden@m">
                    <h2 className="uk-h2" style={{fontWeight: 700}}>Отчёты</h2>
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
                            <a href="https://off-slender.zubareva.online" target="_blank" className="uk-button uk-button-primary" rel="noreferrer">Купить</a>
                            <a href="https://wa.me/79182611437?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5%2C%20%D1%83%20%D0%BC%D0%B5%D0%BD%D1%8F%20%D0%B2%D0%BE%D0%BF%D1%80%D0%BE%D1%81%20%D0%BF%D0%BE%20%D0%BC%D0%B0%D1%80%D0%B0%D1%84%D0%BE%D0%BD%D1%83%2C%20" target="_blank" className="uk-button uk-button-default uk-margin-left" rel="noreferrer">Техническая поддержка</a>
                        </div>
                    )
                }
                {
                    this.props.seasonState.id === 1 && (

                        <div className="uk-grid-column-large" data-uk-grid>
                            <div className="uk-width-2-3@s">
                                <ul data-uk-tab="connect: .uk-switcher;">
                                    <li onClick={() => this.changeTab(1)}><a href="#">Фотоотчёт</a></li>
                                    <li onClick={() => this.changeTab(2)}><a href="#">Фото фигуры</a></li>
                                    <li onClick={() => this.changeTab(3)}><a href="#">Архив</a></li>
                                </ul>
                                {
                                    isLoaded ? (
                                        <ul className="uk-switcher uk-margin-medium-top">
                                            <li className="uk-active">
                                                <h2 className="uk-h2 uk-text-bolder">День</h2>
                                                <div className="tm-reports-days-list">
                                                    <ScrollContainer className="scroll-container">
                                                        <div>
                                                            {
                                                                reportsDays.map((daysItem, index) => (
                                                                    <div
                                                                        className={`tm-reports-days-list-item ${index === report.day - 1 ? 'tm-active' : ''}`}
                                                                        onClick={() => this.changeDay(index)}
                                                                    >
                                                                        {daysItem}
                                                                    </div>
                                                                ))
                                                            }
                                                        </div>
                                                    </ScrollContainer>
                                                </div>
                                                <div className="uk-margin-top">
                                                    <div className="tm-report-form">
                                                        <div data-uk-grid>
                                                            <div className="uk-width-3-5@s">
                                                                <div data-uk-grid>
                                                                    <div className="uk-width-auto@s">
                                                                        <h4 className="uk-h4 uk-text-middle">Вид меню</h4>
                                                                        <select className="uk-select" name="menu" onChange={this.changeField}>
                                                                            {
                                                                                nutrition.menus.map((menuItem) => (
                                                                                    <option value={menuItem.id}>{menuItem.name}</option>
                                                                                ))
                                                                            }
                                                                        </select>
                                                                    </div>
                                                                    <div className="uk-width-expand@s">
                                                                        <h4 className="uk-h4 uk-text-middle">Питьевой режим</h4>
                                                                        <select className="uk-select" name="water" onChange={this.changeField}>
                                                                            {
                                                                                this.state.waters.map((water) => (
                                                                                    <option value={water.id}>{water.name}</option>
                                                                                ))
                                                                            }
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="uk-width-3-5@s">
                                                                <div data-uk-grid>
                                                                    <div className="uk-width-expand@s">
                                                                        <select className="uk-select" name="type" ref={input => this.refMeatType = input} onChange={(e) => (this.changeFieldEats(e, 0))}>
                                                                            {
                                                                                nutrition.meals.map((mealItem) => (
                                                                                    <option value={mealItem.id}>{mealItem.name}</option>
                                                                                ))
                                                                            }
                                                                        </select>
                                                                    </div>
                                                                    <div className="uk-width-auto@s uk-flex uk-flex-middle">
                                                                        <div data-uk-form-custom>
                                                                            <div className="uk-flex uk-flex-middle">
                                                                                <div className="uk-margin-small-right">Загрузите Фото</div>
                                                                                {
                                                                                    report.eats[0].photo.path ? (
                                                                                        <img src={report.eats[0].photo.path} alt="" style={{width: 32, borderRadius: '50%'}} />
                                                                                    ) : (
                                                                                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                            <path d="M16 0C7.16354 0 0 7.16354 0 16C0 24.8365 7.16354 32 16 32C24.8365 32 32 24.8365 32 16C31.9901 7.16771 24.8323 0.00989587 16 0ZM16 30.9333C7.7526 30.9333 1.06667 24.2474 1.06667 16C1.06667 7.7526 7.7526 1.06667 16 1.06667C24.2474 1.06667 30.9333 7.7526 30.9333 16C30.924 24.2435 24.2435 30.924 16 30.9333Z" fill="#FFA53A"/>
                                                                                            <path d="M10.6666 12.8001C10.7877 12.8001 10.9049 12.759 10.9995 12.6832L15.4666 9.11003V19.7335C15.4666 20.028 15.7054 20.2668 16 20.2668C16.2945 20.2668 16.5333 20.028 16.5333 19.7335V9.11003L21 12.6832C21.2299 12.8673 21.5659 12.8301 21.7497 12.6001C21.9338 12.3702 21.8966 12.0342 21.6667 11.8504L16.3333 7.58372C16.3206 7.57357 16.3044 7.5707 16.2906 7.56185C16.2713 7.54753 16.251 7.53503 16.2299 7.52383C16.2125 7.51549 16.1948 7.5082 16.1765 7.50195C16.1526 7.49388 16.1278 7.48763 16.1028 7.4832C16.0791 7.47826 16.0552 7.47461 16.031 7.47279C16.0208 7.47279 16.0122 7.4668 16.0021 7.4668C15.9919 7.4668 15.9828 7.47201 15.9729 7.47279C15.9492 7.47461 15.9255 7.47826 15.9023 7.4832C15.8771 7.48763 15.8521 7.49388 15.8276 7.50195C15.8096 7.5082 15.7916 7.51549 15.7745 7.52383C15.7534 7.53503 15.7333 7.54753 15.714 7.56185C15.7002 7.5707 15.6844 7.57357 15.6708 7.58372L10.3375 11.8504C10.1612 11.9913 10.0927 12.228 10.1666 12.4413C10.2406 12.6548 10.4409 12.7986 10.6666 12.8001Z" fill="#FFA53A"/>
                                                                                            <path d="M21.3333 22.4004H10.6666C10.3721 22.4004 10.1333 22.6392 10.1333 22.9337C10.1333 23.2283 10.3721 23.4671 10.6666 23.4671H21.3333C21.6278 23.4671 21.8666 23.2283 21.8666 22.9337C21.8666 22.6392 21.6278 22.4004 21.3333 22.4004Z" fill="#FFA53A"/>
                                                                                        </svg>
                                                                                    )
                                                                                }
                                                                            </div>
                                                                            <input type="file" onChange={(e) => (this.actionUploadFile(e, '0'))} />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="uk-width-3-5@s">
                                                                <TextareaAutosize className="uk-textarea" style={{resize: 'none'}} placeholder="Приём пищи: время, состав, вес продуктов" name="text" ref={input => this.text0 = input} onChange={(e) => (this.changeFieldEats(e, 0))} />
                                                            </div>
                                                            <div className={`uk-width-auto@s`}>

                                                            </div>
                                                            {
                                                                this.state.isMeat2 && (
                                                                    <>
                                                                        <div id="tm-report-meat-2" className="uk-width-3-5@s">
                                                                            <div data-uk-grid>
                                                                                <div className="uk-width-expand@s">
                                                                                    <select className="uk-select" name="type" ref={input => this.refMeatType = input} onChange={(e) => (this.changeFieldEats(e, 1))}>
                                                                                        {
                                                                                            nutrition.meals.map((mealItem) => (
                                                                                                <option value={mealItem.id}>{mealItem.name}</option>
                                                                                            ))
                                                                                        }
                                                                                    </select>
                                                                                </div>
                                                                                <div className="uk-width-auto@s uk-flex uk-flex-middle">
                                                                                    <div data-uk-form-custom>
                                                                                        <div className="uk-flex uk-flex-middle">
                                                                                            <div className="uk-margin-small-right">Загрузите Фото</div>
                                                                                            {
                                                                                                report.eats[1].photo.path ? (
                                                                                                    <img src={report.eats[1].photo.path} alt="" style={{width: 32, borderRadius: '50%'}} />
                                                                                                ) : (
                                                                                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                                        <path d="M16 0C7.16354 0 0 7.16354 0 16C0 24.8365 7.16354 32 16 32C24.8365 32 32 24.8365 32 16C31.9901 7.16771 24.8323 0.00989587 16 0ZM16 30.9333C7.7526 30.9333 1.06667 24.2474 1.06667 16C1.06667 7.7526 7.7526 1.06667 16 1.06667C24.2474 1.06667 30.9333 7.7526 30.9333 16C30.924 24.2435 24.2435 30.924 16 30.9333Z" fill="#FFA53A"/>
                                                                                                        <path d="M10.6666 12.8001C10.7877 12.8001 10.9049 12.759 10.9995 12.6832L15.4666 9.11003V19.7335C15.4666 20.028 15.7054 20.2668 16 20.2668C16.2945 20.2668 16.5333 20.028 16.5333 19.7335V9.11003L21 12.6832C21.2299 12.8673 21.5659 12.8301 21.7497 12.6001C21.9338 12.3702 21.8966 12.0342 21.6667 11.8504L16.3333 7.58372C16.3206 7.57357 16.3044 7.5707 16.2906 7.56185C16.2713 7.54753 16.251 7.53503 16.2299 7.52383C16.2125 7.51549 16.1948 7.5082 16.1765 7.50195C16.1526 7.49388 16.1278 7.48763 16.1028 7.4832C16.0791 7.47826 16.0552 7.47461 16.031 7.47279C16.0208 7.47279 16.0122 7.4668 16.0021 7.4668C15.9919 7.4668 15.9828 7.47201 15.9729 7.47279C15.9492 7.47461 15.9255 7.47826 15.9023 7.4832C15.8771 7.48763 15.8521 7.49388 15.8276 7.50195C15.8096 7.5082 15.7916 7.51549 15.7745 7.52383C15.7534 7.53503 15.7333 7.54753 15.714 7.56185C15.7002 7.5707 15.6844 7.57357 15.6708 7.58372L10.3375 11.8504C10.1612 11.9913 10.0927 12.228 10.1666 12.4413C10.2406 12.6548 10.4409 12.7986 10.6666 12.8001Z" fill="#FFA53A"/>
                                                                                                        <path d="M21.3333 22.4004H10.6666C10.3721 22.4004 10.1333 22.6392 10.1333 22.9337C10.1333 23.2283 10.3721 23.4671 10.6666 23.4671H21.3333C21.6278 23.4671 21.8666 23.2283 21.8666 22.9337C21.8666 22.6392 21.6278 22.4004 21.3333 22.4004Z" fill="#FFA53A"/>
                                                                                                    </svg>
                                                                                                )
                                                                                            }
                                                                                        </div>
                                                                                        <input type="file" onChange={(e) => (this.actionUploadFile(e, 1))} />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="uk-width-expand uk-width-3-5@s">
                                                                            <TextareaAutosize className="uk-textarea" style={{resize: 'none'}} placeholder="Приём пищи: время, состав, вес продуктов" name="text" ref={input => this.text1 = input} onChange={(e) => (this.changeFieldEats(e, 1))} />
                                                                        </div>
                                                                        <div className={`uk-width-auto tm-button-meat-remove`}>
                                                                            {
                                                                                this.state.isMeat2 && (
                                                                                    <div onClick={()=> this.removeMeat(2)}>
                                                                                        <svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg"><line fill="none" stroke="#000" strokeWidth="1.1" x1="1" y1="1" x2="13" y2="13" /><line fill="none" stroke="#000" strokeWidth="1.1" x1="13" y1="1" x2="1" y2="13" /></svg>
                                                                                    </div>
                                                                                )
                                                                            }
                                                                        </div>
                                                                    </>
                                                                )
                                                            }
                                                            {
                                                                this.state.isMeat3 && (
                                                                    <>
                                                                        <div id="tm-report-meat-3" className="uk-width-3-5@s">
                                                                            <div data-uk-grid>
                                                                                <div className="uk-width-expand@s">
                                                                                    <select className="uk-select" name="type" ref={input => this.refMeatType = input} onChange={(e) => (this.changeFieldEats(e, 2))}>
                                                                                        {
                                                                                            nutrition.meals.map((mealItem) => (
                                                                                                <option value={mealItem.id}>{mealItem.name}</option>
                                                                                            ))
                                                                                        }
                                                                                    </select>
                                                                                </div>
                                                                                <div className="uk-width-auto@s uk-flex uk-flex-middle">
                                                                                    <div data-uk-form-custom>
                                                                                        <div className="uk-flex uk-flex-middle">
                                                                                            <div className="uk-margin-small-right">Загрузите Фото</div>
                                                                                            {
                                                                                                report.eats[2].photo.path ? (
                                                                                                    <img src={report.eats[2].photo.path} alt="" style={{width: 32, borderRadius: '50%'}} />
                                                                                                ) : (
                                                                                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                                        <path d="M16 0C7.16354 0 0 7.16354 0 16C0 24.8365 7.16354 32 16 32C24.8365 32 32 24.8365 32 16C31.9901 7.16771 24.8323 0.00989587 16 0ZM16 30.9333C7.7526 30.9333 1.06667 24.2474 1.06667 16C1.06667 7.7526 7.7526 1.06667 16 1.06667C24.2474 1.06667 30.9333 7.7526 30.9333 16C30.924 24.2435 24.2435 30.924 16 30.9333Z" fill="#FFA53A"/>
                                                                                                        <path d="M10.6666 12.8001C10.7877 12.8001 10.9049 12.759 10.9995 12.6832L15.4666 9.11003V19.7335C15.4666 20.028 15.7054 20.2668 16 20.2668C16.2945 20.2668 16.5333 20.028 16.5333 19.7335V9.11003L21 12.6832C21.2299 12.8673 21.5659 12.8301 21.7497 12.6001C21.9338 12.3702 21.8966 12.0342 21.6667 11.8504L16.3333 7.58372C16.3206 7.57357 16.3044 7.5707 16.2906 7.56185C16.2713 7.54753 16.251 7.53503 16.2299 7.52383C16.2125 7.51549 16.1948 7.5082 16.1765 7.50195C16.1526 7.49388 16.1278 7.48763 16.1028 7.4832C16.0791 7.47826 16.0552 7.47461 16.031 7.47279C16.0208 7.47279 16.0122 7.4668 16.0021 7.4668C15.9919 7.4668 15.9828 7.47201 15.9729 7.47279C15.9492 7.47461 15.9255 7.47826 15.9023 7.4832C15.8771 7.48763 15.8521 7.49388 15.8276 7.50195C15.8096 7.5082 15.7916 7.51549 15.7745 7.52383C15.7534 7.53503 15.7333 7.54753 15.714 7.56185C15.7002 7.5707 15.6844 7.57357 15.6708 7.58372L10.3375 11.8504C10.1612 11.9913 10.0927 12.228 10.1666 12.4413C10.2406 12.6548 10.4409 12.7986 10.6666 12.8001Z" fill="#FFA53A"/>
                                                                                                        <path d="M21.3333 22.4004H10.6666C10.3721 22.4004 10.1333 22.6392 10.1333 22.9337C10.1333 23.2283 10.3721 23.4671 10.6666 23.4671H21.3333C21.6278 23.4671 21.8666 23.2283 21.8666 22.9337C21.8666 22.6392 21.6278 22.4004 21.3333 22.4004Z" fill="#FFA53A"/>
                                                                                                    </svg>
                                                                                                )
                                                                                            }
                                                                                        </div>
                                                                                        <input type="file" onChange={(e) => (this.actionUploadFile(e, 2))} />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="uk-width-expand uk-width-3-5@s">
                                                                            <TextareaAutosize className="uk-textarea" style={{resize: 'none'}} placeholder="Приём пищи: время, состав, вес продуктов" name="text" ref={input => this.text2 = input} onChange={(e) => (this.changeFieldEats(e, 2))} />
                                                                        </div>
                                                                        <div className={`uk-width-auto tm-button-meat-remove`}>
                                                                            {
                                                                                this.state.isMeat3 && (
                                                                                    <div onClick={()=> this.removeMeat(3)}>
                                                                                        <svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg"><line fill="none" stroke="#000" strokeWidth="1.1" x1="1" y1="1" x2="13" y2="13" /><line fill="none" stroke="#000" strokeWidth="1.1" x1="13" y1="1" x2="1" y2="13" /></svg>
                                                                                    </div>
                                                                                )
                                                                            }
                                                                        </div>
                                                                    </>
                                                                )
                                                            }
                                                            {
                                                                this.state.isMeat4 && (
                                                                    <>
                                                                        <div id="tm-report-meat-4" className="uk-width-3-5@s">
                                                                            <div data-uk-grid>
                                                                                <div className="uk-width-expand@s">
                                                                                    <select className="uk-select" name="type" ref={input => this.refMeatType = input} onChange={(e) => (this.changeFieldEats(e, 3))}>
                                                                                        {
                                                                                            nutrition.meals.map((mealItem) => (
                                                                                                <option value={mealItem.id}>{mealItem.name}</option>
                                                                                            ))
                                                                                        }
                                                                                    </select>
                                                                                </div>
                                                                                <div className="uk-width-auto@s uk-flex uk-flex-middle">
                                                                                    <div data-uk-form-custom>
                                                                                        <div className="uk-flex uk-flex-middle">
                                                                                            <div className="uk-margin-small-right">Загрузите Фото</div>
                                                                                            {
                                                                                                report.eats[3].photo.path ? (
                                                                                                    <img src={report.eats[3].photo.path} alt="" style={{width: 32, borderRadius: '50%'}} />
                                                                                                ) : (
                                                                                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                                        <path d="M16 0C7.16354 0 0 7.16354 0 16C0 24.8365 7.16354 32 16 32C24.8365 32 32 24.8365 32 16C31.9901 7.16771 24.8323 0.00989587 16 0ZM16 30.9333C7.7526 30.9333 1.06667 24.2474 1.06667 16C1.06667 7.7526 7.7526 1.06667 16 1.06667C24.2474 1.06667 30.9333 7.7526 30.9333 16C30.924 24.2435 24.2435 30.924 16 30.9333Z" fill="#FFA53A"/>
                                                                                                        <path d="M10.6666 12.8001C10.7877 12.8001 10.9049 12.759 10.9995 12.6832L15.4666 9.11003V19.7335C15.4666 20.028 15.7054 20.2668 16 20.2668C16.2945 20.2668 16.5333 20.028 16.5333 19.7335V9.11003L21 12.6832C21.2299 12.8673 21.5659 12.8301 21.7497 12.6001C21.9338 12.3702 21.8966 12.0342 21.6667 11.8504L16.3333 7.58372C16.3206 7.57357 16.3044 7.5707 16.2906 7.56185C16.2713 7.54753 16.251 7.53503 16.2299 7.52383C16.2125 7.51549 16.1948 7.5082 16.1765 7.50195C16.1526 7.49388 16.1278 7.48763 16.1028 7.4832C16.0791 7.47826 16.0552 7.47461 16.031 7.47279C16.0208 7.47279 16.0122 7.4668 16.0021 7.4668C15.9919 7.4668 15.9828 7.47201 15.9729 7.47279C15.9492 7.47461 15.9255 7.47826 15.9023 7.4832C15.8771 7.48763 15.8521 7.49388 15.8276 7.50195C15.8096 7.5082 15.7916 7.51549 15.7745 7.52383C15.7534 7.53503 15.7333 7.54753 15.714 7.56185C15.7002 7.5707 15.6844 7.57357 15.6708 7.58372L10.3375 11.8504C10.1612 11.9913 10.0927 12.228 10.1666 12.4413C10.2406 12.6548 10.4409 12.7986 10.6666 12.8001Z" fill="#FFA53A"/>
                                                                                                        <path d="M21.3333 22.4004H10.6666C10.3721 22.4004 10.1333 22.6392 10.1333 22.9337C10.1333 23.2283 10.3721 23.4671 10.6666 23.4671H21.3333C21.6278 23.4671 21.8666 23.2283 21.8666 22.9337C21.8666 22.6392 21.6278 22.4004 21.3333 22.4004Z" fill="#FFA53A"/>
                                                                                                    </svg>
                                                                                                )
                                                                                            }
                                                                                        </div>
                                                                                        <input type="file" onChange={(e) => (this.actionUploadFile(e, 3))} />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="uk-width-expand uk-width-3-5@s">
                                                                            <TextareaAutosize className="uk-textarea" style={{resize: 'none'}} placeholder="Приём пищи: время, состав, вес продуктов" name="text" ref={input => this.text3 = input} onChange={(e) => (this.changeFieldEats(e, 3))} />
                                                                        </div>
                                                                        <div className={`uk-width-auto tm-button-meat-remove`}>
                                                                            {
                                                                                this.state.isMeat4 && (
                                                                                    <div onClick={()=> this.removeMeat(4)}>
                                                                                        <svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg"><line fill="none" stroke="#000" strokeWidth="1.1" x1="1" y1="1" x2="13" y2="13" /><line fill="none" stroke="#000" strokeWidth="1.1" x1="13" y1="1" x2="1" y2="13" /></svg>
                                                                                    </div>
                                                                                )
                                                                            }
                                                                        </div>
                                                                    </>
                                                                )
                                                            }
                                                            {
                                                                this.state.isMeat5 && (
                                                                    <>
                                                                        <div id="tm-report-meat-5" className="uk-width-3-5@s">
                                                                            <div data-uk-grid>
                                                                                <div className="uk-width-expand@s">
                                                                                    <select className="uk-select" name="type" onChange={(e) => (this.changeFieldEats(e, 4))} ref={input => this.refMeatType = input}>
                                                                                        {
                                                                                            nutrition.meals.map((mealItem) => (
                                                                                                <option value={mealItem.id}>{mealItem.name}</option>
                                                                                            ))
                                                                                        }
                                                                                    </select>
                                                                                </div>
                                                                                <div className="uk-width-auto@s uk-flex uk-flex-middle">
                                                                                    <div data-uk-form-custom>
                                                                                        <div className="uk-flex uk-flex-middle">
                                                                                            <div className="uk-margin-small-right .uk-text-bolder">Загрузите Фото</div>
                                                                                            {
                                                                                                report.eats[4].photo.path ? (
                                                                                                    <img src={report.eats[4].photo.path} alt="" style={{width: 32, borderRadius: '50%'}} />
                                                                                                ) : (
                                                                                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                                        <path d="M16 0C7.16354 0 0 7.16354 0 16C0 24.8365 7.16354 32 16 32C24.8365 32 32 24.8365 32 16C31.9901 7.16771 24.8323 0.00989587 16 0ZM16 30.9333C7.7526 30.9333 1.06667 24.2474 1.06667 16C1.06667 7.7526 7.7526 1.06667 16 1.06667C24.2474 1.06667 30.9333 7.7526 30.9333 16C30.924 24.2435 24.2435 30.924 16 30.9333Z" fill="#FFA53A"/>
                                                                                                        <path d="M10.6666 12.8001C10.7877 12.8001 10.9049 12.759 10.9995 12.6832L15.4666 9.11003V19.7335C15.4666 20.028 15.7054 20.2668 16 20.2668C16.2945 20.2668 16.5333 20.028 16.5333 19.7335V9.11003L21 12.6832C21.2299 12.8673 21.5659 12.8301 21.7497 12.6001C21.9338 12.3702 21.8966 12.0342 21.6667 11.8504L16.3333 7.58372C16.3206 7.57357 16.3044 7.5707 16.2906 7.56185C16.2713 7.54753 16.251 7.53503 16.2299 7.52383C16.2125 7.51549 16.1948 7.5082 16.1765 7.50195C16.1526 7.49388 16.1278 7.48763 16.1028 7.4832C16.0791 7.47826 16.0552 7.47461 16.031 7.47279C16.0208 7.47279 16.0122 7.4668 16.0021 7.4668C15.9919 7.4668 15.9828 7.47201 15.9729 7.47279C15.9492 7.47461 15.9255 7.47826 15.9023 7.4832C15.8771 7.48763 15.8521 7.49388 15.8276 7.50195C15.8096 7.5082 15.7916 7.51549 15.7745 7.52383C15.7534 7.53503 15.7333 7.54753 15.714 7.56185C15.7002 7.5707 15.6844 7.57357 15.6708 7.58372L10.3375 11.8504C10.1612 11.9913 10.0927 12.228 10.1666 12.4413C10.2406 12.6548 10.4409 12.7986 10.6666 12.8001Z" fill="#FFA53A"/>
                                                                                                        <path d="M21.3333 22.4004H10.6666C10.3721 22.4004 10.1333 22.6392 10.1333 22.9337C10.1333 23.2283 10.3721 23.4671 10.6666 23.4671H21.3333C21.6278 23.4671 21.8666 23.2283 21.8666 22.9337C21.8666 22.6392 21.6278 22.4004 21.3333 22.4004Z" fill="#FFA53A"/>
                                                                                                    </svg>
                                                                                                )
                                                                                            }
                                                                                        </div>
                                                                                        <input type="file" onChange={(e) => (this.actionUploadFile(e, 4))} />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="uk-width-expand uk-width-3-5@s">
                                                                            <TextareaAutosize className="uk-textarea" style={{resize: 'none'}} placeholder="Приём пищи: время, состав, вес продуктов" name="text" ref={input => this.text4 = input} onChange={(e) => (this.changeFieldEats(e, 4))} />
                                                                        </div>
                                                                        <div className={`uk-width-auto tm-button-meat-remove`}>
                                                                            {
                                                                                this.state.isMeat5 && (
                                                                                    <div onClick={()=> this.removeMeat(5)}>
                                                                                        <svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg"><line fill="none" stroke="#000" strokeWidth="1.1" x1="1" y1="1" x2="13" y2="13" /><line fill="none" stroke="#000" strokeWidth="1.1" x1="13" y1="1" x2="1" y2="13" /></svg>
                                                                                    </div>
                                                                                )
                                                                            }
                                                                        </div>
                                                                    </>
                                                                )
                                                            }
                                                            <div className="uk-width-3-5@s">
                                                                <TextareaAutosize className="uk-textarea" style={{resize: 'none'}} placeholder="Комментарий" name="comment" ref={input => this.comment = input} onChange={this.changeField} />

                                                            </div>
                                                        </div>
                                                        <div className="uk-margin-medium uk-text-center uk-text-left@m">
                                                            {
                                                                !this.state.isMeat5 && (
                                                                    <div className="uk-button uk-button-default uk-margin-small-right uk-margin-small-bottom" onClick={this.addMeat}>Добавить приём пищи</div>
                                                                )
                                                            }
                                                            <div className="uk-button uk-button-primary uk-margin-small-bottom" onClick={this.actionCreateReport}>Сохранить</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                            <li>
                                                <h2 className="uk-h2 uk-text-bolder">Фото фигуры до:</h2>
                                                <div className="tm-buttons">
                                                    <ScrollContainer className="scroll-container">
                                                        <div>
                                                            <div data-uk-form-custom>
                                                                {
                                                                    body.before.length > 0 && (
                                                                        <>
                                                                            <img src={body.before[0].url} alt="" />
                                                                            {
                                                                                body.before[0].can_delete ? (
                                                                                    <div className="tm-button-delete" onClick={() => this.actionReplaceBody({id: body.before[0].id, file_id: 0})}>
                                                                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                            <path d="M11.2877 0.712476C11.0201 0.4448 10.5908 0.4448 10.3231 0.712476L5.99986 5.03571L1.67663 0.712476C1.40896 0.4448 0.979664 0.4448 0.711988 0.712476C0.444311 0.980153 0.444311 1.40945 0.711988 1.67712L5.03521 6.00036L0.711988 10.3236C0.444311 10.5913 0.444311 11.0206 0.711988 11.2882C0.843301 11.4195 1.02007 11.4903 1.19179 11.4903C1.3635 11.4903 1.54027 11.4246 1.67158 11.2882L5.99481 6.965L10.318 11.2882C10.4493 11.4195 10.6261 11.4903 10.7978 11.4903C10.9746 11.4903 11.1463 11.4246 11.2776 11.2882C11.5453 11.0206 11.5453 10.5913 11.2776 10.3236L6.96451 6.00036L11.2877 1.67712C11.5554 1.40945 11.5554 0.980153 11.2877 0.712476Z" fill="#251716" fillOpacity="0.6" />
                                                                                        </svg>
                                                                                    </div>
                                                                                ) : ''
                                                                            }
                                                                        </>
                                                                    )
                                                                }
                                                                {
                                                                    body.before.length === 0 && (
                                                                        <div>
                                                                            <svg width="63" height="62" viewBox="0 0 63 62" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                <path fillRule="evenodd" clipRule="evenodd" d="M31.4999 0.217773C48.4563 0.217773 62.2022 13.9636 62.2022 30.92C62.2022 47.8764 48.4563 61.6223 31.4999 61.6223C14.5435 61.6223 0.797607 47.8764 0.797607 30.92C0.797607 13.9636 14.5435 0.217773 31.4999 0.217773ZM31.4994 3.0089C46.9143 3.0089 59.4105 15.5052 59.4105 30.9201C59.4105 46.335 46.9143 58.8312 31.4994 58.8312C16.0845 58.8312 3.58824 46.335 3.58824 30.9201C3.58824 15.5052 16.0845 3.0089 31.4994 3.0089ZM46.8509 32.3156H32.8953V46.2712H30.1042V32.3156H16.1486V29.5245H30.1042V15.5689H32.8953V29.5245H46.8509V32.3156Z" fill="#DD9D9D"/>
                                                                            </svg>
                                                                            <div>Выберите файл</div>
                                                                        </div>
                                                                    )
                                                                }
                                                                <input type="file" onChange={(e) => (this.onSelectFile(e, 'before', body.before.length > 0 ? 0 : null, 0))} />
                                                            </div>
                                                            <div data-uk-form-custom>
                                                                {
                                                                    body.before.length >= 2 && (
                                                                        <>
                                                                            <img src={body.before[1].url} alt="" />
                                                                            {
                                                                                body.before[1].can_delete ? (
                                                                                    <div className="tm-button-delete" onClick={() => this.actionReplaceBody({id: body.before[1].id, file_id: 0})}>
                                                                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                            <path d="M11.2877 0.712476C11.0201 0.4448 10.5908 0.4448 10.3231 0.712476L5.99986 5.03571L1.67663 0.712476C1.40896 0.4448 0.979664 0.4448 0.711988 0.712476C0.444311 0.980153 0.444311 1.40945 0.711988 1.67712L5.03521 6.00036L0.711988 10.3236C0.444311 10.5913 0.444311 11.0206 0.711988 11.2882C0.843301 11.4195 1.02007 11.4903 1.19179 11.4903C1.3635 11.4903 1.54027 11.4246 1.67158 11.2882L5.99481 6.965L10.318 11.2882C10.4493 11.4195 10.6261 11.4903 10.7978 11.4903C10.9746 11.4903 11.1463 11.4246 11.2776 11.2882C11.5453 11.0206 11.5453 10.5913 11.2776 10.3236L6.96451 6.00036L11.2877 1.67712C11.5554 1.40945 11.5554 0.980153 11.2877 0.712476Z" fill="#251716" fillOpacity="0.6"/>
                                                                                        </svg>
                                                                                    </div>
                                                                                ) : ''
                                                                            }
                                                                        </>
                                                                    )
                                                                }
                                                                {
                                                                    body.before.length < 2 && (
                                                                        <div>
                                                                            <svg width="63" height="62" viewBox="0 0 63 62" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                <path fillRule="evenodd" clipRule="evenodd" d="M31.4999 0.217773C48.4563 0.217773 62.2022 13.9636 62.2022 30.92C62.2022 47.8764 48.4563 61.6223 31.4999 61.6223C14.5435 61.6223 0.797607 47.8764 0.797607 30.92C0.797607 13.9636 14.5435 0.217773 31.4999 0.217773ZM31.4994 3.0089C46.9143 3.0089 59.4105 15.5052 59.4105 30.9201C59.4105 46.335 46.9143 58.8312 31.4994 58.8312C16.0845 58.8312 3.58824 46.335 3.58824 30.9201C3.58824 15.5052 16.0845 3.0089 31.4994 3.0089ZM46.8509 32.3156H32.8953V46.2712H30.1042V32.3156H16.1486V29.5245H30.1042V15.5689H32.8953V29.5245H46.8509V32.3156Z" fill="#DD9D9D"/>
                                                                            </svg>
                                                                            <div>Выберите файл</div>
                                                                        </div>
                                                                    )
                                                                }
                                                                <input type="file" onChange={(e) => (this.onSelectFile(e, 'before', body.before.length >= 2 ? 1 : null, 1))} />
                                                            </div>
                                                            <div data-uk-form-custom>
                                                                {
                                                                    body.before.length === 3 && (
                                                                        <>
                                                                            <img src={body.before[2].url} alt="" />
                                                                            {
                                                                                body.before[2].can_delete ? (
                                                                                    <div className="tm-button-delete" onClick={() => this.actionReplaceBody({id: body.before[2].id, file_id: 0})}>
                                                                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                            <path d="M11.2877 0.712476C11.0201 0.4448 10.5908 0.4448 10.3231 0.712476L5.99986 5.03571L1.67663 0.712476C1.40896 0.4448 0.979664 0.4448 0.711988 0.712476C0.444311 0.980153 0.444311 1.40945 0.711988 1.67712L5.03521 6.00036L0.711988 10.3236C0.444311 10.5913 0.444311 11.0206 0.711988 11.2882C0.843301 11.4195 1.02007 11.4903 1.19179 11.4903C1.3635 11.4903 1.54027 11.4246 1.67158 11.2882L5.99481 6.965L10.318 11.2882C10.4493 11.4195 10.6261 11.4903 10.7978 11.4903C10.9746 11.4903 11.1463 11.4246 11.2776 11.2882C11.5453 11.0206 11.5453 10.5913 11.2776 10.3236L6.96451 6.00036L11.2877 1.67712C11.5554 1.40945 11.5554 0.980153 11.2877 0.712476Z" fill="#251716" fillOpacity="0.6"/>
                                                                                        </svg>
                                                                                    </div>
                                                                                ) : ''
                                                                            }
                                                                        </>
                                                                    )
                                                                }
                                                                {
                                                                    body.before.length <= 2 && (
                                                                        <div>
                                                                            <svg width="63" height="62" viewBox="0 0 63 62" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                <path fillRule="evenodd" clipRule="evenodd" d="M31.4999 0.217773C48.4563 0.217773 62.2022 13.9636 62.2022 30.92C62.2022 47.8764 48.4563 61.6223 31.4999 61.6223C14.5435 61.6223 0.797607 47.8764 0.797607 30.92C0.797607 13.9636 14.5435 0.217773 31.4999 0.217773ZM31.4994 3.0089C46.9143 3.0089 59.4105 15.5052 59.4105 30.9201C59.4105 46.335 46.9143 58.8312 31.4994 58.8312C16.0845 58.8312 3.58824 46.335 3.58824 30.9201C3.58824 15.5052 16.0845 3.0089 31.4994 3.0089ZM46.8509 32.3156H32.8953V46.2712H30.1042V32.3156H16.1486V29.5245H30.1042V15.5689H32.8953V29.5245H46.8509V32.3156Z" fill="#DD9D9D"/>
                                                                            </svg>
                                                                            <div>Выберите файл</div>
                                                                        </div>
                                                                    )
                                                                }
                                                                <input type="file" onChange={(e) => (this.onSelectFile(e, 'before', body.before.length >= 3 ? 2 : null, 2))} />
                                                            </div>
                                                        </div>
                                                    </ScrollContainer>
                                                </div>
                                                <div className="uk-margin-medium-top">
                                                    {
                                                        bodyComment.before ? (
                                                            bodyComment.before
                                                        ) : (
                                                            <>
                                                                <TextareaAutosize className="uk-textarea" style={{resize: 'none'}} placeholder="Комментарий" name="comment" onChange={(e) => (this.changeFieldBody(e, 'before'))} defaulValue={bodyComment.before} />
                                                                <div className="uk-button uk-button-primary uk-margin-top" onClick={() => this.actionCreateBodyComment('before')}>Отправить</div>
                                                            </>
                                                        )
                                                    }
                                                </div>
                                                <h2 className="uk-h2 uk-text-bolder">Фото фигуры после:</h2>
                                                <div className="tm-buttons">
                                                    <ScrollContainer className="scroll-container">
                                                        <div>
                                                            <div data-uk-form-custom>
                                                                {
                                                                    body.after.length > 0 && (
                                                                        <>
                                                                            <img src={body.after[0].url} alt="" />
                                                                            {
                                                                                body.after[0].can_delete ? (
                                                                                    <div className="tm-button-delete" onClick={() => this.actionReplaceBody({id: body.after[0].id, file_id: 0})}>
                                                                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                            <path d="M11.2877 0.712476C11.0201 0.4448 10.5908 0.4448 10.3231 0.712476L5.99986 5.03571L1.67663 0.712476C1.40896 0.4448 0.979664 0.4448 0.711988 0.712476C0.444311 0.980153 0.444311 1.40945 0.711988 1.67712L5.03521 6.00036L0.711988 10.3236C0.444311 10.5913 0.444311 11.0206 0.711988 11.2882C0.843301 11.4195 1.02007 11.4903 1.19179 11.4903C1.3635 11.4903 1.54027 11.4246 1.67158 11.2882L5.99481 6.965L10.318 11.2882C10.4493 11.4195 10.6261 11.4903 10.7978 11.4903C10.9746 11.4903 11.1463 11.4246 11.2776 11.2882C11.5453 11.0206 11.5453 10.5913 11.2776 10.3236L6.96451 6.00036L11.2877 1.67712C11.5554 1.40945 11.5554 0.980153 11.2877 0.712476Z" fill="#251716" fillOpacity="0.6"/>
                                                                                        </svg>
                                                                                    </div>
                                                                                ) : ''
                                                                            }
                                                                        </>
                                                                    )
                                                                }
                                                                {
                                                                    body.after.length === 0 && (
                                                                        <div>
                                                                            <svg width="63" height="62" viewBox="0 0 63 62" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                <path fillRule="evenodd" clipRule="evenodd" d="M31.4999 0.217773C48.4563 0.217773 62.2022 13.9636 62.2022 30.92C62.2022 47.8764 48.4563 61.6223 31.4999 61.6223C14.5435 61.6223 0.797607 47.8764 0.797607 30.92C0.797607 13.9636 14.5435 0.217773 31.4999 0.217773ZM31.4994 3.0089C46.9143 3.0089 59.4105 15.5052 59.4105 30.9201C59.4105 46.335 46.9143 58.8312 31.4994 58.8312C16.0845 58.8312 3.58824 46.335 3.58824 30.9201C3.58824 15.5052 16.0845 3.0089 31.4994 3.0089ZM46.8509 32.3156H32.8953V46.2712H30.1042V32.3156H16.1486V29.5245H30.1042V15.5689H32.8953V29.5245H46.8509V32.3156Z" fill="#DD9D9D"/>
                                                                            </svg>
                                                                            <div>Выберите файл</div>
                                                                        </div>
                                                                    )
                                                                }
                                                                <input type="file" onChange={(e) => (this.onSelectFile(e, 'after', body.after.length > 0 ? 0 : null, 0))} />
                                                            </div>
                                                            <div data-uk-form-custom>
                                                                {
                                                                    body.after.length >= 2 && (
                                                                        <>
                                                                            <img src={body.after[1].url} alt="" />
                                                                            {
                                                                                body.after[1].can_delete ? (
                                                                                    <div className="tm-button-delete" onClick={() => this.actionReplaceBody({id: body.after[1].id, file_id: 0})}>
                                                                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                            <path d="M11.2877 0.712476C11.0201 0.4448 10.5908 0.4448 10.3231 0.712476L5.99986 5.03571L1.67663 0.712476C1.40896 0.4448 0.979664 0.4448 0.711988 0.712476C0.444311 0.980153 0.444311 1.40945 0.711988 1.67712L5.03521 6.00036L0.711988 10.3236C0.444311 10.5913 0.444311 11.0206 0.711988 11.2882C0.843301 11.4195 1.02007 11.4903 1.19179 11.4903C1.3635 11.4903 1.54027 11.4246 1.67158 11.2882L5.99481 6.965L10.318 11.2882C10.4493 11.4195 10.6261 11.4903 10.7978 11.4903C10.9746 11.4903 11.1463 11.4246 11.2776 11.2882C11.5453 11.0206 11.5453 10.5913 11.2776 10.3236L6.96451 6.00036L11.2877 1.67712C11.5554 1.40945 11.5554 0.980153 11.2877 0.712476Z" fill="#251716" fillOpacity="0.6"/>
                                                                                        </svg>
                                                                                    </div>
                                                                                ) : ''
                                                                            }
                                                                        </>
                                                                    )
                                                                }
                                                                {
                                                                    body.after.length < 2 && (
                                                                        <div>
                                                                            <svg width="63" height="62" viewBox="0 0 63 62" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                <path fillRule="evenodd" clipRule="evenodd" d="M31.4999 0.217773C48.4563 0.217773 62.2022 13.9636 62.2022 30.92C62.2022 47.8764 48.4563 61.6223 31.4999 61.6223C14.5435 61.6223 0.797607 47.8764 0.797607 30.92C0.797607 13.9636 14.5435 0.217773 31.4999 0.217773ZM31.4994 3.0089C46.9143 3.0089 59.4105 15.5052 59.4105 30.9201C59.4105 46.335 46.9143 58.8312 31.4994 58.8312C16.0845 58.8312 3.58824 46.335 3.58824 30.9201C3.58824 15.5052 16.0845 3.0089 31.4994 3.0089ZM46.8509 32.3156H32.8953V46.2712H30.1042V32.3156H16.1486V29.5245H30.1042V15.5689H32.8953V29.5245H46.8509V32.3156Z" fill="#DD9D9D"/>
                                                                            </svg>
                                                                            <div>Выберите файл</div>
                                                                        </div>
                                                                    )
                                                                }
                                                                <input type="file" onChange={(e) => (this.onSelectFile(e, 'after', body.after.length >= 2 ? 1 : null, 1))} />
                                                            </div>
                                                            <div data-uk-form-custom>
                                                                {
                                                                    body.after.length === 3 && (
                                                                        <>
                                                                            <img src={body.after[2].url} alt="" />
                                                                            {
                                                                                body.after[2].can_delete ? (
                                                                                    <div className="tm-button-delete" onClick={() => this.actionReplaceBody({id: body.after[2].id, file_id: 0})}>
                                                                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                            <path d="M11.2877 0.712476C11.0201 0.4448 10.5908 0.4448 10.3231 0.712476L5.99986 5.03571L1.67663 0.712476C1.40896 0.4448 0.979664 0.4448 0.711988 0.712476C0.444311 0.980153 0.444311 1.40945 0.711988 1.67712L5.03521 6.00036L0.711988 10.3236C0.444311 10.5913 0.444311 11.0206 0.711988 11.2882C0.843301 11.4195 1.02007 11.4903 1.19179 11.4903C1.3635 11.4903 1.54027 11.4246 1.67158 11.2882L5.99481 6.965L10.318 11.2882C10.4493 11.4195 10.6261 11.4903 10.7978 11.4903C10.9746 11.4903 11.1463 11.4246 11.2776 11.2882C11.5453 11.0206 11.5453 10.5913 11.2776 10.3236L6.96451 6.00036L11.2877 1.67712C11.5554 1.40945 11.5554 0.980153 11.2877 0.712476Z" fill="#251716" fillOpacity="0.6"/>
                                                                                        </svg>
                                                                                    </div>
                                                                                ) : ''
                                                                            }
                                                                        </>
                                                                    )
                                                                }
                                                                {
                                                                    body.after.length <= 2 && (
                                                                        <div>
                                                                            <svg width="63" height="62" viewBox="0 0 63 62" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                <path fillRule="evenodd" clipRule="evenodd" d="M31.4999 0.217773C48.4563 0.217773 62.2022 13.9636 62.2022 30.92C62.2022 47.8764 48.4563 61.6223 31.4999 61.6223C14.5435 61.6223 0.797607 47.8764 0.797607 30.92C0.797607 13.9636 14.5435 0.217773 31.4999 0.217773ZM31.4994 3.0089C46.9143 3.0089 59.4105 15.5052 59.4105 30.9201C59.4105 46.335 46.9143 58.8312 31.4994 58.8312C16.0845 58.8312 3.58824 46.335 3.58824 30.9201C3.58824 15.5052 16.0845 3.0089 31.4994 3.0089ZM46.8509 32.3156H32.8953V46.2712H30.1042V32.3156H16.1486V29.5245H30.1042V15.5689H32.8953V29.5245H46.8509V32.3156Z" fill="#DD9D9D"/>
                                                                            </svg>
                                                                            <div>Выберите файл</div>
                                                                        </div>
                                                                    )
                                                                }
                                                                <input type="file" onChange={(e) => (this.onSelectFile(e, 'after', body.after.length >= 3 ? 2 : null, 2))} />
                                                            </div>
                                                        </div>
                                                    </ScrollContainer>
                                                </div>
                                                <div className="uk-margin-medium-top">
                                                    {
                                                        bodyComment.after ? (
                                                            bodyComment.after
                                                        ) : (
                                                            <>
                                                                <TextareaAutosize className="uk-textarea" style={{resize: 'none'}} placeholder="Комментарий" name="comment" onChange={(e) => (this.changeFieldBody(e, 'after'))} />
                                                                <div className="uk-button uk-button-primary uk-margin-top" onClick={() => this.actionCreateBodyComment('after')}>Отправить</div>
                                                            </>
                                                        )
                                                    }
                                                </div>
                                            </li>
                                            <li>
                                                <h2 className="uk-h2 uk-text-bolder">Ваши отчёты, отправленные на проверку</h2>
                                                <div className="tm-archive-list">
                                                    <div className="uk-child-width-1-2@s" data-uk-grid>
                                                        {
                                                            archive.map((archiveItem) => (
                                                                <div>
                                                                    <div className="tm-archive-list-item">
                                                                        <div className="uk-text-bolder">День {archiveItem.day}</div>
                                                                        <div className="uk-flex uk-flex-middle">
                                                                            <svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                <path d="M7.00017 0L8.57177 4.83688H13.6576L9.54307 7.82624L11.1147 12.6631L7.00017 9.67376L2.88567 12.6631L4.45727 7.82624L0.342773 4.83688H5.42857L7.00017 0Z" fill="#DD9D9D"/>
                                                                            </svg>
                                                                            <div className="tm-result">
                                                                                {
                                                                                    archiveItem.result.reset === 1 ? (
                                                                                        <>
                                                                                            <span />
                                                                                            <span>Отменён</span>
                                                                                        </>
                                                                                    ) : (
                                                                                        <>
                                                                                            {
                                                                                                archiveItem.result.balls > 0 && (
                                                                                                    <>
                                                                                                        <span>Оценка: </span>
                                                                                                        <span>{archiveItem.result.balls}/5</span>
                                                                                                    </>
                                                                                                )
                                                                                            }
                                                                                            {
                                                                                                archiveItem.result.balls === 0 && (
                                                                                                    <>
                                                                                                        <span />
                                                                                                        <span>Ожидает проверки</span>
                                                                                                    </>
                                                                                                )
                                                                                            }
                                                                                        </>
                                                                                    )
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                        <div className="tm-comment">
                                                                            <span>Комментарий специалиста: </span>
                                                                            <TextTruncate
                                                                                line={2}
                                                                                element="span"
                                                                                truncateText="…"
                                                                                text={archiveItem.result.comment}
                                                                            />
                                                                            <div className="uk-margin-small-top" style={{cursor: 'pointer'}} onClick={() => this.actionGetArchiveDetail(archiveItem.id)}>
                                                                                Смотреть полностью
                                                                            </div>
                                                                        </div>
                                                                        {
                                                                            archiveItem.result.has_question === 1 && (
                                                                                <div className="uk-button uk-button-primary uk-margin-small-top" data-uk-toggle="#tm-modal-report-comments" onClick={() => this.activeArchiveDay(archiveItem.id, archiveItem.day)}>Ответить</div>
                                                                            )
                                                                        }
                                                                    </div>
                                                                </div>
                                                            ))
                                                        }
                                                    </div>
                                                </div>
                                            </li>
                                        </ul>
                                    ) : <div className="tm-spinner" data-uk-spinner="target: .tm-spinner;" />
                                }
                            </div>
                        </div>
                    )
                }
                <div id="tm-modal-report" className="uk-flex-top" data-uk-modal="stack: true;">
                    <div className="uk-modal-dialog uk-margin-auto-vertical uk-width-1-3@s">
                        <button className="uk-modal-close-full uk-close-large" type="button" data-uk-close />
                        <div className="uk-padding uk-text-center">
                            <div>{this.state.popup.message}</div>
                            <div className="uk-margin-medium-top">
                                <div className="uk-button uk-button-primary uk-modal-close">Закрыть</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="tm-modal-report-comments" className="uk-flex-top" data-uk-modal="stack: true;">
                    <div className="uk-modal-dialog uk-margin-auto-vertical uk-width-2-3@s">
                        <button className="uk-modal-close-full uk-close-large" type="button" data-uk-close />
                        <div className="uk-padding uk-text-center">
                            <h4 className="uk-h4 uk-text-bolder">День {this.state.activeArchiveDay.number}</h4>
                            <div className="uk-margin-medium-top">
                                <div className="tm-archive-day-comments">
                                    {
                                        this.state.activeArchiveDay.number > 0 && (
                                            reportsComments.map((commentItem) => (
                                                <div className={commentItem.me === 1 ? 'uk-text-right' : 'uk-text-left'}>
                                                    <div className={`tm-archive-day-comments-item ${commentItem.me === 0 ? 'uk-active' : '' }`}>
                                                        <div className="uk-text-bolder">
                                                            {
                                                                commentItem.me === 1 ? 'Вы' : 'Специалист'
                                                            }
                                                        </div>
                                                        <div>{commentItem.text}</div>
                                                        <div className="uk-text-small">{commentItem.date}</div>
                                                    </div>
                                                </div>
                                            ))
                                        )
                                    }
                                </div>
                                <div className="uk-margin-top">
                                    <div className="tm-archive-day-comment-create">
                                        <TextareaAutosize className="uk-textarea" style={{resize: 'none'}} placeholder="Комментарий" name="text" onChange={this.changeFieldArchive} />
                                        <div className="uk-button uk-button-primary uk-margin-top uk-modal-close" onClick={() => this.actionCreateArchiveComment(this.state.activeArchiveDay.id)}>Отправить</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="tm-modal-report-archive-detail" className="uk-flex-top" data-uk-modal="stack: true;">
                    <div className="uk-modal-dialog uk-margin-auto-vertical uk-width-2-3@s">
                        <button className="uk-modal-close-full uk-close-large" type="button" data-uk-close />
                        <div className="uk-padding">
                            <div>
                                <h3 className="uk-h3 uk-text-bolder">День {archiveDetail.day}</h3>
                                {
                                    archiveDetail.menu.name && (
                                        <div className="uk-margin-small">
                                            <span style={{color: 'rgba(37, 23, 22, 0.6)'}}>Меню:</span> {archiveDetail.menu.name}
                                        </div>
                                    )
                                }
                                <div className="uk-margin-small">
                                    <span style={{color: 'rgba(37, 23, 22, 0.6)'}}>Ваш комментарий:</span> {archiveDetail.comment ? archiveDetail.comment : 'отсутствует'}
                                </div>
                                <h4 className="uk-h4 uk-text-bolder">Приёмы пищи</h4>
                                {
                                    archiveDetail.eats.map((eatsItem) => (
                                        <div className="uk-margin-small">
                                            <span style={{color: 'rgba(37, 23, 22, 0.6)'}}>{eatsItem.type.name}:</span> {eatsItem.text}
                                        </div>
                                    ))
                                }
                                <h4 className="uk-h4 uk-text-bolder">Оценка специалиста</h4>
                                <div className="uk-margin-small">
                                    <span style={{color: 'rgba(37, 23, 22, 0.6)'}}>{archiveDetail.result.balls}/5</span>
                                </div>
                                <div className="uk-margin-small">
                                    <span style={{color: 'rgba(37, 23, 22, 0.6)'}}>Комментарий специалиста: </span> {archiveDetail.result.comment}
                                </div>
                                {
                                    archiveDetail.eats.map((eatsItem) => (
                                        <>
                                            {
                                                eatsItem.photo && (
                                                    <div className="uk-margin-small-top">
                                                        <img src={eatsItem.photo} alt="" />
                                                    </div>
                                                )
                                            }
                                        </>
                                    ))
                                }
                            </div>
                            <div className="uk-margin-medium-top">
                                <div className="uk-button uk-button-primary uk-modal-close">Закрыть</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="tm-modal-avatar-crop" className="uk-flex-top" data-uk-modal>
                    <div className="uk-modal-dialog uk-margin-auto-vertical uk-width-2-3@s">
                        <div className="uk-padding-small">
                            <div className={`tm-body-${this.state.currentCrop}-${this.state.currentCropItemIndex}`}>
                                {src && (
                                    <ReactCrop
                                        src={src}
                                        crop={crop}
                                        ruleOfThirds
                                        onImageLoaded={this.onImageLoaded}
                                        onComplete={this.onCropComplete}
                                        onChange={this.onCropChange}
                                        minWidth={cropWidth}
                                        minHeight={cropHeight}
                                        keepSelection={true}
                                    />
                                )}
                                <div className="uk-margin-small-top uk-text-center">
                                    <div className="uk-button uk-button-primary" onClick={() => this.actionUploadFile(null, null, this.state.currentCrop, this.state.currentCropItem)}>Готово</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => state;
export default connect(mapStateToProps)(Reports);
