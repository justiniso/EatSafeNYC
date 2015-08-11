
var Inspection = React.createClass({
    displayName: 'Inspection',
    render: function () {
        return (
            React.createElement("div", {className: "media"}, 
                React.createElement("hr", null), 
                React.createElement("div", {className: "media-left inspection"}, 
                    React.createElement("div", {className: "media-object grade"}, this.props.grade || '')
                ), 
                React.createElement("div", {className: "media-body"}, 
                    React.createElement("h4", {className: "media-heading"}, "Inspected ", this.props.dateHuman), 
                    React.createElement("ul", {className: "item-sub-contents violations"}, 
                        this.props.violations.map(function (v, i) {
                            return React.createElement("li", null, v.descriptionHuman);
                        })
                    )
                )
            )
        );
    }
});


var Restaurant = React.createClass({
    displayName: 'Restaurant',
    getInitialState: function () {
        return {collapsed: this.props.collapsed};
    },
    onClick: function (e) {
        this.setState({collapsed: !this.state.collapsed});
    },
    render: function () {
        var inspectionsClass = this.state.collapsed ? 'inspections collapsed' : 'inspections';
        return (
            React.createElement("a", {className: "item restaurant list-group-item", onClick: this.onClick}, 
                React.createElement("h3", null, this.props.name), 
                React.createElement("h4", null, this.props.address), 
                React.createElement("div", {className: inspectionsClass}, 
                    this.props.inspections.map(function (insp, i) {
                        return React.createElement(Inspection, {violations: insp.violations, grade: insp.grade, 
                            dateHuman: insp.dateHuman});
                    })
                )
            )
        )
    }
});


var List = React.createClass({
    displayName: 'List',
    render: function () {
        var collapsed = this.props.items.length > 1;
        if (this.props.items.length === 0) {
            return (React.createElement("span", null));
        }
        return (
            React.createElement("div", {className: "list-group"}, 
                this.props.items.map(function (item, i) {
                    return (
                        React.createElement(Restaurant, {name: item.name, address: item.address, 
                            lastGrade: item.lastGrade, critical: item.critical, 
                            description: item.description, 
                            inspections: item.inspections || [], 
                            collapsed: collapsed})
                    )
                })
            )
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
            button = React.createElement("img", {className: "search-submit", src: "/static/img/spinner.svg", alt: "Loading..."});
        } else {
            button = React.createElement("input", {type: "image", className: "search-submit", src: "/static/img/search.svg", alt: "Search"});

        }

        return (
            React.createElement("div", null, 
                React.createElement("form", {onSubmit: this.handleSubmit, className: "main-search"}, 
                    React.createElement("div", {className: "searchbox-container"}, 
                        React.createElement("input", {type: "text", onChange: this.onChange, value: this.props.query, autoFocus: true, placeholder: "e.g. 'abc kitchen' or grand sichuan 7th avenue'"}), 
                        React.createElement("div", {className: "button-container"}, 
                            button
                        )
                    )
                ), 
                React.createElement("div", {className: "error"}, this.state.error), 
                React.createElement("div", {className: "search-results"}, 
                    React.createElement(List, {items: this.state.items})
                )
            )
        );
    }
});
