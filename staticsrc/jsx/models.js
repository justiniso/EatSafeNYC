
var Restaurant = React.createClass({
    displayName: 'Restaurant',
    render: function () {
        return (
            <div className="item">
                <h3>{this.props.name} - {this.props.lastGrade || 'Currently ungraded'}</h3>
                <h4>{this.props.address}</h4>
                <ul className="inspections">
                    {this.props.inspections.map(function (insp, i) {
                        var violations = insp.violations;
                        return ( 
                            <li className="inspection">
                                <p>Inspected {insp.dateHuman}</p>
                                <ul className="violations">
                                    {violations.map(function (v, i) {
                                        return <li>{v.descriptionHuman}</li>   
                                    })}
                                </ul>
                            </li>
                        )
                    })}
                </ul>
            </div>
        )
    }
});


var List = React.createClass({
    displayName: 'List',
    render: function () {
        return (
            <ul className="results">
                {this.props.items.map(function (item, i) {
                    return (
                        <Restaurant name={item.name} address={item.address} 
                            lastGrade={item.lastGrade} critical={item.critical} 
                            description={item.description} 
                            inspections={item.inspections || []} />
                    )
                })}
            </ul>
        );
    }

});


var Search = React.createClass({
    displayName: 'Search',
    getInitialState: function () {
        return {
            items: [], 
            query: null, 
            error: null,
            loading: false
        };
    },
    onChange: function (e) {
        var query = e.target.value;

        this.setProps({query: query});
    },
    handleQuerySuccess: function (data) {
        if (data.error) {
            this.handleQueryFailure(data.error);
        } else {
            if (data.results.restaurants.length > 0) {
                this.setState({
                    items: data.results.restaurants, 
                    error: data.error,
                    loading: false
                });
            } else {
                var error = 'We couldn\'t find any matching restaurants. \
                             Try a simpler query like "Yasuda 43" instead of \
                             "Yasuda Sushi 43rd street" '
                this.handleQueryFailure(error);
            }
        }
    },
    handleQueryFailure: function (error) {
        this.setState({
            error: error,
            loading: false
        });
    },
    handleSubmit: function (e) {
        e.preventDefault();

        this.setState({
            error: null,
            loading: true
        });
        
        var query = this.props.query;

        jQuery.ajax({
            url: '/api/query',
            data: {
                'q': query
            },
            dataType: 'json',
            cache: true,
            success: this.handleQuerySuccess.bind(this),
            error: function (xhr, status, err) {
                var error = err.toString() + '(' + status + ')';
                this.handleQueryFailure(error);
            }.bind(this)
        });
    },
    
    render: function () {

        var button;
        if (this.state.loading) {
            button = <img src="/static/img/spinner.svg" alt="Loading..." />;
        } else {
            button = <input type="image" className="search-submit" src="/static/img/search.svg" alt="Search" />;

        }

        return (
            <div>
                <form onSubmit={this.handleSubmit} className="main-search" >
                    <div className="searchbox-container">
                        <input type="text" onChange={this.onChange} value={this.props.query} autoFocus placeholder="e.g. 'abc kitchen' or grand sichuan 7th avenue'" />
                        <div className="button-container">
                            {button}
                        </div>
                    </div>
                </form>
                <div className="error">{this.state.error}</div>
                <div className="results">
                    <List items={this.state.items} />
                </div>
            </div>
        );
    }
});
