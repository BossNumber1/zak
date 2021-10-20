import React from 'react';

class Plug extends React.Component {

    render() {
        let { seasonId } = this.props;

        return (
            <>
                {
                    seasonId === 0 && (
                        1
                    )
                }
            </>
        );
    }
}

export default Plug;