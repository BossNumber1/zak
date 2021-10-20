import React from 'react';
import store from "../../utils/store";
import UIkit from 'uikit';
import TextareaAutosize from 'react-textarea-autosize';
import { connect } from "react-redux";

class Analyzes extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoaded: true,
      newAnalyses: {},
      // TODO: replace analyzes
      analyzes: [{
        name: 'Биохимия новая',
        description: 'Description',
        files: [{
          id: 1, title: 'Биохимический анализ крови'
        },
        {
          id: 2, title: 'Клинический анализ крови'
        }
      ]
      },
      {
        name: 'Биохимический анализ крови',
        description: 'Description',
        files: [{id: 2, title: 'Биохимический анализ крови'}]
      }],
    }
    this.changeField = this.changeField.bind(this)
  }
  
  componentDidMount() {
    // try {
    //   fetch('https://api-academy.zubareva.online/api/profile/analyzes')
    //     .then((resp) => resp.json())
    //     .then((data) => this.setState({
    //       analyzes: data
    //     }))
    // } catch (e) {
    //   console.log(e)
    // }
    UIkit.offcanvas("#offcanvas-usage").hide();
    store.dispatch({
      type: "CHANGE_PAGE",
      payload: {
          body: {
              class: "tm-page-analyzes"
          },
          header: {
              navigation: true,
              title: "Мои анализы"
          }
      }
    });
  }

  changeField = (e) => {
    this.setState({
        newAnalyses: {
            ...this.state.newAnalyses,
            [e.target.name]: e.target.value
        }
    })
};

  render() {
    const {isLoaded, analyzes} = this.state
    return (
      <div className="uk-container uk-container-large uk-section">
        <div className="uk-flex">
          <div className="uk-flex-1">
            {isLoaded && (
              analyzes.map((analyses, index) =>(
                <div id={`card-${index}`} class="uk-card uk-card-body hidden-content">
                    <div className="uk-flex uk-flex-between">
                      <h3 class="uk-card-title">{analyses.name}</h3>
                      <button uk-toggle={`target: #card-${index}; cls: hidden-content`}>
                        <svg width="13" height="8" viewBox="0 0 13 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M0.811664 7.19384C0.593998 6.97922 0.594033 6.628 0.811741 6.41342L5.88032 1.41762L5.87786 1.4152L6.65622 0.648438L6.65847 0.650656L6.66072 0.648438L7.44115 1.41796L7.43903 1.42006L12.4857 6.39457C12.7027 6.60848 12.7027 6.95859 12.4857 7.17248C12.273 7.38202 11.9316 7.38202 11.7189 7.17246L6.6609 2.187L1.58103 7.19392C1.36768 7.40421 1.02498 7.40418 0.811664 7.19384Z" fill="black" fill-opacity="0.2"/>
                        </svg>
                      </button>
                    </div>
                    <div className="uk-card-content">
                      <div>
                        {
                          analyses?.files?.map((file) => (
                            <div className="uk-flex">
                              <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13.1177 3.024L10.2606 0.166841C10.2074 0.113504 10.1441 0.0713504 10.0743 0.0428571C10.0054 0.0146986 9.93165 0.000133928 9.85719 0H2.42861C1.48184 0 0.714325 0.767511 0.714325 1.71428V14.2857C0.714325 15.2325 1.48184 16 2.42861 16H11.5715C12.5182 16 13.2858 15.2325 13.2858 14.2857V3.42857C13.285 3.2769 13.2246 3.13162 13.1177 3.024ZM10.4286 1.95087L11.3349 2.85716H10.4286V1.95087ZM12.1429 14.2857C12.1429 14.6013 11.887 14.8572 11.5714 14.8572H2.42861C2.11301 14.8572 1.85717 14.6013 1.85717 14.2857V1.71428C1.85717 1.39868 2.11301 1.14285 2.42861 1.14285H9.28575V3.42857C9.28575 3.74417 9.54158 4.00001 9.85719 4.00001H12.1429V14.2857H12.1429Z" fill="#251716"/>
                              </svg>
                              <span>{file.title}</span>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                </div>
              ))
            )}
          </div>
          <div className="uk-flex-1 upload">
            <div>
              <div className="uk-flex">
                <span className="uk-text-bolder">Загрузите анализы</span>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 0C7.16354 0 0 7.16354 0 16C0 24.8365 7.16354 32 16 32C24.8365 32 32 24.8365 32 16C31.9901 7.16771 24.8323 0.00989587 16 0ZM16 30.9333C7.7526 30.9333 1.06667 24.2474 1.06667 16C1.06667 7.7526 7.7526 1.06667 16 1.06667C24.2474 1.06667 30.9333 7.7526 30.9333 16C30.924 24.2435 24.2435 30.924 16 30.9333Z" fill="#FFA53A"/>
                  <path d="M10.6666 12.8001C10.7877 12.8001 10.9049 12.759 10.9995 12.6832L15.4666 9.11003V19.7335C15.4666 20.028 15.7054 20.2668 16 20.2668C16.2945 20.2668 16.5333 20.028 16.5333 19.7335V9.11003L21 12.6832C21.2299 12.8673 21.5659 12.8301 21.7497 12.6001C21.9338 12.3702 21.8966 12.0342 21.6667 11.8504L16.3333 7.58372C16.3206 7.57357 16.3044 7.5707 16.2906 7.56185C16.2713 7.54753 16.251 7.53503 16.2299 7.52383C16.2125 7.51549 16.1948 7.5082 16.1765 7.50195C16.1526 7.49388 16.1278 7.48763 16.1028 7.4832C16.0791 7.47826 16.0552 7.47461 16.031 7.47279C16.0208 7.47279 16.0122 7.4668 16.0021 7.4668C15.9919 7.4668 15.9828 7.47201 15.9729 7.47279C15.9492 7.47461 15.9255 7.47826 15.9023 7.4832C15.8771 7.48763 15.8521 7.49388 15.8276 7.50195C15.8096 7.5082 15.7916 7.51549 15.7745 7.52383C15.7534 7.53503 15.7333 7.54753 15.714 7.56185C15.7002 7.5707 15.6844 7.57357 15.6708 7.58372L10.3375 11.8504C10.1612 11.9913 10.0927 12.228 10.1666 12.4413C10.2406 12.6548 10.4409 12.7986 10.6666 12.8001Z" fill="#FFA53A"/>
                  <path d="M21.3333 22.3999H10.6667C10.3721 22.3999 10.1333 22.6387 10.1333 22.9332C10.1333 23.2278 10.3721 23.4666 10.6667 23.4666H21.3333C21.6279 23.4666 21.8667 23.2278 21.8667 22.9332C21.8667 22.6387 21.6279 22.3999 21.3333 22.3999Z" fill="#FFA53A"/>
                </svg>
              </div>
              <div className="uk-width-3-5@s uk-grid-margin">
                <TextareaAutosize className="uk-textarea" style={{resize: 'none'}} placeholder="Название" name="name" ref={input => this.comment = input} onChange={this.changeField} />
              </div>
              <div className="uk-width-3-5@s uk-grid-margin">
                <TextareaAutosize className="uk-textarea" style={{resize: 'none'}} placeholder="Описание" name="descriptin" ref={input => this.comment = input} onChange={this.changeField} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default connect((state) => state)(Analyzes)
