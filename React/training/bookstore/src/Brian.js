import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class Brian extends Component {
  render() {
    switch (step) {
      case 1:
        return <BookList />;
      case 2:
        return <ShippingDetails />;
      case 3:
        return <DeliveryDetails />;
    }
  }
}

export default Brian;
