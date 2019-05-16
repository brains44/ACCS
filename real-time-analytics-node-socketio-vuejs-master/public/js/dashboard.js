/* global _ */

var socket = io();

var vm = new Vue({
    el: '#app',
    data: {
        nrMessages: 0,
        message: '',
        messages: []
    },
    ready: function () {
        socket.on('brian', function (data) {
            console.log(data.length);
            this.messages.push(data);
        }.bind(this));
    },
    methods: {
        send: function (event) {
            debugger;
            vm.config.devtools = true;

        }
    }
    
});

