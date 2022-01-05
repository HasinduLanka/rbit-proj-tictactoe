import logo from './logo.svg';
import './App.css';
import React, { Component } from 'react';
import Board from './Board';


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {}
  }
  render() {
    return (
      <div>
        <Board />
      </div>
    );
  }
}

export default App;
