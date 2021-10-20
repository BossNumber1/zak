import React from 'react';
import store from "../../utils/store";
import {connect} from "react-redux";
import ReactCrop from 'react-image-crop';
import UIkit from "uikit";

class Profile extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            profile: [],
            updateProfile: [],
            lifestyles: [],
            src: null,
            imageBlob: null,
            crop: {
                aspect: 1,
                unit: 'px',
                x: 50,
                y: 50,
                width: 100,
                height: 100
            }
        };

        this.changeField = this.changeField.bind(this);
        this.actionUpdateProfile = this.actionUpdateProfile.bind(this);
        this.actionUploadFile = this.actionUploadFile.bind(this);
        this.changeFieldVolumes = this.changeFieldVolumes.bind(this);
    }

    componentDidMount() {
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
        const sid = localStorage.getItem("sid");

        if (!accessToken) {
            this.props.history.push('/signin');
        }

        let modalTrainingDone = document.getElementById('tm-modal-workouts-training-done');
        let modalTrainingCircle = document.getElementById('tm-modal-workouts-training-circle');

        if (modalTrainingDone) {
            modalTrainingDone.parentNode.removeChild(modalTrainingDone);
        }

        if (modalTrainingCircle) {
            modalTrainingCircle.parentNode.removeChild(modalTrainingCircle);
        }

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
                    profile: result,
                    updateProfile: result,
                    isLoaded: true
                });
            },(error) => {
                console.log(error)
            }
        );

        fetch( `https://api-academy.zubareva.online/api/directory/lifestyle`, {
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
                    lifestyles: result.list
                });
            },(error) => {
                console.log(error)
            }
        );

        store.dispatch({
            type: "CHANGE_PAGE",
            payload: {
                body: {
                    class: "tm-page-profile"
                },
                header: {
                    navigation: true,
                    title: null
                }
            }
        });
    }

    actionUpdateProfile = () => {
        const accessToken = localStorage.getItem("accessToken");

        if (this.state.updateProfile.lifestyle.id === 0) {
            UIkit.modal('#tm-modal-profile-error').show();

            return false;
        }

        fetch( `https://api-academy.zubareva.online/api/profile/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : accessToken
            },
            body: JSON.stringify(this.state.updateProfile)
        })
        .then(res => res.json())
        .then(
            (result) => {

            },(error) => {
                console.log(error)
            }
        );

        UIkit.modal('#tm-modal-profile-saved').show();
    };

    actionUploadFile = () => {
        const accessToken = localStorage.getItem("accessToken");
        let reader = new FileReader();
        let base64data;
        let $this = this;

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
                    $this.setState({
                        profile: {
                            ...$this.state.profile,
                            photo: {
                                id: result.id,
                                path: ''
                            }
                        },
                        updateProfile: {
                            ...$this.state.updateProfile,
                            photo: {
                                id: result.id,
                                path: ''
                            }
                        }
                    });
                },(error) => {
                    console.log(error)
                }
            );
        };


        UIkit.modal('#tm-modal-avatar-crop').hide();
    };

    changeField = (e) => {
        this.setState({
            updateProfile: {
                ...this.state.updateProfile,
                [e.target.name]: e.target.value
            }
        })
    };

    changeFieldVolumes = (e) => {
        this.setState({
            updateProfile: {
                ...this.state.updateProfile,
                volumes: {
                    ...this.state.updateProfile.volumes,
                    [e.target.name]: e.target.value
                }
            }
        })
    };

    onSelectFile = e => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener('load', () =>
                this.setState({ src: reader.result })
            );
            reader.readAsDataURL(e.target.files[0]);

            UIkit.modal('#tm-modal-avatar-crop').show();
        }
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

    goToNews = () => {
        this.props.history.push('/news');
    };

    render() {
        const { isLoaded, profile, lifestyles, crop, croppedImageUrl, src } = this.state;

        return (
            <div className="tm-container-profile">
                <div className="uk-container uk-container-large uk-section">
                    {
                        isLoaded ? (
                            <>
                                <div className="uk-flex uk-flex-middle" data-uk-grid>
                                    <div className="uk-width-auto">
                                        <div className="tm-profile-avatar">
                                            {
                                                (!this.state.croppedImageUrl && profile.photo.path) && (
                                                    <img src={profile.photo.path} alt="" />
                                                )
                                            }
                                            {
                                                this.state.croppedImageUrl && (
                                                    <img src={this.state.croppedImageUrl} alt="" />
                                                )
                                            }
                                        </div>
                                    </div>
                                    <div className="uk-width-auto uk-width-1-5m@s">
                                        <h3 className="uk-h3 uk-margin-remove uk-visible@m" style={{fontWeight: 700}}>{profile.first_name} {profile.last_name}</h3>
                                        <h4 className="uk-h4 uk-margin-remove uk-hidden@m" style={{fontWeight: 700}}>{profile.first_name} {profile.last_name}</h4>
                                        <div className="tm-button-profile-select-avatar" data-uk-form-custom>
                                            Изменить изображение
                                            <input type="file" accept="image/*" onChange={this.onSelectFile} />
                                        </div>
                                    </div>
                                    <div className="uk-width-auto@s uk-visible@m">
                                        <div className="uk-button uk-button-primary" onClick={this.actionUpdateProfile}>Сохранить</div>
                                    </div>
                                </div>
                                <div className="uk-child-width-1-2@s" data-uk-grid>
                                    <div>
                                        <div className="uk-child-width-1-2@s uk-grid-row-small" data-uk-grid>
                                            <div style={{marginBottom: 10}}>
                                                <label className="uk-form-label">* Ваше имя</label>
                                                <input type="text" name="first_name" className="uk-input" defaultValue={profile.first_name} onChange={this.changeField} />
                                            </div>
                                            <div style={{marginBottom: 10}}>
                                                <label className="uk-form-label">* Ваша фамилия</label>
                                                <input type="text" name="last_name" className="uk-input" defaultValue={profile.last_name} onChange={this.changeField} />
                                            </div>
                                            <div style={{marginBottom: 10}}>
                                                <label className="uk-form-label">* Телефон</label>
                                                <input type="text" name="phone" className="uk-input" defaultValue={profile.phone} onChange={this.changeField} />
                                            </div>
                                            <div style={{marginBottom: 10}}>
                                                <label className="uk-form-label">* E-mail</label>
                                                <input type="text" name="email" className="uk-input" defaultValue={profile.email} onChange={this.changeField} />
                                            </div>
                                            <div style={{marginBottom: 10}}>
                                                <label className="uk-form-label">* Город</label>
                                                <input type="text" name="city" className="uk-input" defaultValue={profile.city} onChange={this.changeField} />
                                            </div>
                                            <div style={{marginBottom: 10}}>
                                                <label className="uk-form-label">* Возраст</label>
                                                <input type="text" name="age" className="uk-input" defaultValue={profile.age} onChange={this.changeField} />
                                            </div>
                                            <div style={{marginBottom: 10}}>
                                                <label className="uk-form-label">* Пол</label>
                                                <select name="gender" className="uk-select" defaultValue={profile.gender} onChange={this.changeField}>
                                                    <option value="">Выбрать значение</option>
                                                    <option value="M">М</option>
                                                    <option value="F">Ж</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="uk-form-label">* Рост</label>
                                                <input type="text" name="height" className="uk-input" defaultValue={profile.height} onChange={this.changeField} />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="uk-child-width-1-2@s uk-grid-row-small" data-uk-grid>
                                            <div className="uk-width">
                                                <label style={{fontWeight: 700}}>Вес</label>
                                            </div>
                                            <div style={{marginBottom: 10}}>
                                                <label className="uk-form-label">* Сейчас</label>
                                                <input type="text" name="weight" className="uk-input" defaultValue={profile.weight} onChange={this.changeField} />
                                            </div>
                                            <div>
                                                <label className="uk-form-label">* Желаемый</label>
                                                <input type="text" name="weight_wish" className="uk-input" defaultValue={profile.weight_wish} onChange={this.changeField} />
                                            </div>
                                            <div className="uk-width">
                                                <label style={{fontWeight: 700}}>Объёмы</label>
                                            </div>
                                            <div style={{marginBottom: 10}}>
                                                <label className="uk-form-label">Талия</label>
                                                <input type="text" name="waist" className="uk-input" defaultValue={profile.volumes.waist} onChange={this.changeFieldVolumes} />
                                            </div>
                                            <div style={{marginBottom: 10}}>
                                                <label className="uk-form-label">Живот</label>
                                                <input type="text" name="belly" className="uk-input" defaultValue={profile.volumes.belly} onChange={this.changeFieldVolumes} />
                                            </div>
                                            <div style={{marginBottom: 10}}>
                                                <label className="uk-form-label">Бёдра</label>
                                                <input type="text" name="hip" className="uk-input" defaultValue={profile.volumes.hip} onChange={this.changeFieldVolumes} />
                                            </div>
                                            <div style={{marginBottom: 10}}>
                                                <label className="uk-form-label">Грудь</label>
                                                <input type="text" name="breast" className="uk-input" defaultValue={profile.volumes.breast} onChange={this.changeFieldVolumes} />
                                            </div>
                                            <div>
                                                <label className="uk-form-label">* Образ жизни</label>
                                                <select name="lifestyle" className="uk-select" defaultValue={profile.lifestyle.id} onChange={this.changeField}>
                                                    <option value="">Выбрать значение</option>
                                                    {
                                                        lifestyles.map((value, index) => (
                                                            <option key={index} value={value.id} selected={value.id === profile.lifestyle.id ? true : false}>{value.name}</option>
                                                        ))
                                                    }
                                                </select>
                                            </div>
                                            <div style={{marginBottom: 10}}>
                                                <label className="uk-form-label">* Цель</label>
                                                <select name="target" className="uk-select" defaultValue={profile.target} onChange={this.changeField}>
                                                    <option value="">Выбрать значение</option>
                                                    <option value="Снижение веса">Снижение веса</option>
                                                    <option value="Сохранение веса">Сохранение веса</option>
                                                    <option value="Набор веса">Набор веса</option>
                                                </select>
                                            </div>
                                            <div style={{marginBottom: 10}}>
                                                <label className="uk-form-label">Пароль</label>
                                                <input type="password" name="password" className="uk-input"  ref={(input) => {this.password = input}} onChange={this.changeField} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="uk-hidden@m uk-text-center uk-margin-medium-top">
                                    <div className="uk-button uk-button-primary" onClick={this.actionUpdateProfile}>Сохранить</div>
                                </div>
                            </>
                        ) : ('')
                    }
                    <div>
                        <div id="tm-modal-avatar-crop" className="uk-flex-top" data-uk-modal>
                            <div className="uk-modal-dialog uk-margin-auto-vertical uk-width-2-3@s">
                                <div className="uk-padding-small">
                                    <div>
                                        {src && (
                                            <ReactCrop
                                                src={src}
                                                crop={crop}
                                                ruleOfThirds
                                                onImageLoaded={this.onImageLoaded}
                                                onComplete={this.onCropComplete}
                                                onChange={this.onCropChange}
                                                minWidth={100}
                                                minHeight={100}
                                                keepSelection={true}
                                            />
                                        )}
                                        <div className="uk-margin-small-top uk-text-center">
                                            <div className="uk-button uk-button-primary" onClick={this.actionUploadFile}>Готово</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="tm-modal-profile-error" className="uk-flex-top" data-uk-modal="stack: true;">
                            <div className="uk-modal-dialog uk-margin-auto-vertical uk-width-1-3@s">
                                <button className="uk-modal-close-full uk-close-large" type="button" data-uk-close />
                                <div className="uk-padding uk-text-center">
                                    <div>Заполните поле "образ жизни"</div>
                                    <div className="uk-margin-medium-top">
                                        <div className="uk-button uk-button-primary uk-modal-close">ОК</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="tm-modal-profile-saved" className="uk-flex-top" data-uk-modal="stack: true;">
                            <div className="uk-modal-dialog uk-margin-auto-vertical uk-width-1-3@s">
                                <button className="uk-modal-close-full uk-close-large" type="button" data-uk-close />
                                <div className="uk-padding uk-text-center">
                                    <div>Ваши данные сохранены</div>
                                    <div className="uk-margin-medium-top">
                                        <div className="uk-button uk-button-primary uk-modal-close" onClick={this.goToNews}>ОК</div>
                                    </div>
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
export default connect(mapStateToProps)(Profile)
