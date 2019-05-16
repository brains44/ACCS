console.log('Start') // Marks entry point of JS code.

var App = React.createClass({
    componentWillMount: function(){
      console.log('componentWillMount');
    },

    componentDidMount: function(){
      console.log('componentDidMount');
    },

    getInitialState: function(){
      return { status: true}
    },

    getDefaultProps: function(){
      return {name: 'John'};
    },

    componentWillReceiveProps: function(nextProps){
      console.log('componentWillReceiveProps');
    },

    shouldComponentUpdate: function(nextProps, nextState){
      console.log('shouldComponentUpdate');
      return true;
    },

    componentWillUpdate: function(){
      console.log('componentWillUpdate');
    },

    render: function() {
      console.log('render');
      return <h1 onClick={this.toggleState}>
             {this.state.status.toString()}
             </h1>
    },

    componentWillUnmount: function(){
      console.log('componentWillUnmount')
    },

    toggleState: function() {
      this.setState({status: !this.state.status})
    }
    });


ReactDOM.render(<App />, document.getElementById('container'));
