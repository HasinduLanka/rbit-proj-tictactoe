import React, { Component } from 'react';

const BoardSize = 3;
const EmptyCell = ' ';
const Player1 = 'X';
const Player2 = '0';

class Board extends Component {
    constructor(props) {
        super(props);
        let cells = this.reset();
        this.state = {
            cells: cells,
            player: Player1,
            history: [],
            future: [],
            bot: EmptyCell
        };

    }

    reset() {
        let cells = new Array(BoardSize);
        for (let i = 0; i < BoardSize; i++) {
            cells[i] = new Array(BoardSize);
            for (let j = 0; j < BoardSize; j++) {
                cells[i][j] = ' ';
            }
        }

        this.setState({ cells: cells, player: Player1, history: [], future: [] });

        if (this.state && this.state.bot === Player1) {
            this.playAsComputer();
        }

        return cells;
    }

    tick(rowIndex, cellIndex) {

        let cells = this.state.cells;

        if (cells[rowIndex][cellIndex] === EmptyCell) {

            let history = this.state.history;
            history.push(JSON.parse(JSON.stringify(cells)));

            cells[rowIndex][cellIndex] = this.state.player;

            let player = this.state.player === Player1 ? Player2 : Player1

            this.setState({ player: player, cells: cells, history: history, future: [] });

            this.checkWinner();

            if (this.state.bot === player) {
                setTimeout(() => {
                    this.playAsComputer();
                }, 300);
            }

        }

    }


    undo() {

        let history = this.state.history;
        if (history.length > 0) {

            let current = this.state.cells;
            let future = this.state.future;

            future.push(current);

            let cells = history.pop();

            console.log(cells);

            let player = this.state.player === Player1 ? Player2 : Player1
            this.setState({ player: player, cells: cells, history: history, future: future });
        }

    }

    redo() {

        let future = this.state.future;
        if (future.length > 0) {

            let history = this.state.history;
            let current = this.state.cells;

            history.push(current);

            let cells = future.pop();

            console.log(cells);

            let player = this.state.player === Player1 ? Player2 : Player1
            this.setState({ player: player, cells: cells, history: history, future: future });
        }

    }


    startPlayingAsComputer() {
        if (this.state.bot === EmptyCell) {
            this.setState({ bot: this.state.player });
            this.playAsComputer();
        } else {
            this.setState({ bot: EmptyCell });
        }
    }

    checkWinner() {
        if (this.checkIfPlayerWon(Player1, this.state.cells)) {
            this.victory(Player1);
        } else if (this.checkIfPlayerWon(Player2, this.state.cells)) {
            this.victory(Player2);
        }
    }

    victory(player) {
        setTimeout(() => {
            if (window.confirm(`Player ${player} won this match!`)) {
                this.reset();
            }
        }, 300);
    }

    checkIfPlayerWon(player, cells) {


        let winner = false;

        for (let i = 0; i < BoardSize; i++) {
            let row = cells[i];
            let col = [];
            let diag = [];
            let antiDiag = [];

            for (let j = 0; j < BoardSize; j++) {
                col.push(cells[j][i]);
                diag.push(cells[j][j]);
                antiDiag.push(cells[j][BoardSize - j - 1]);
            }

            let winPattern = player.repeat(BoardSize);

            if (row.join('') === winPattern ||
                col.join('') === winPattern ||
                diag.join('') === winPattern ||
                antiDiag.join('') === winPattern) {
                winner = true;
            }
        }

        return winner;
    }

    playAsComputer() {

        let computerMove = this.getComputerMove(this.state.player);

        console.log(computerMove);

        if (computerMove) {
            this.tick(computerMove.rowIndex, computerMove.cellIndex);
        }

    }

    getComputerMove(botPlayer) {

        let WinningMove = (player) => {

            let cells = JSON.parse(JSON.stringify(this.state.cells));

            for (let i = 0; i < BoardSize; i++) {
                for (let j = 0; j < BoardSize; j++) {
                    if (cells[i][j] === EmptyCell) {
                        cells[i][j] = player;
                        let winner = this.checkIfPlayerWon(player, cells);
                        if (!winner) {
                            cells[i][j] = EmptyCell;
                        } else {
                            console.log("Player " + player + " can win at " + i + "," + j);
                            return { rowIndex: i, cellIndex: j };

                        }
                    }
                }
            }
            return null;
        }

        let MyWinningMove = WinningMove(botPlayer);
        if (MyWinningMove) {
            return MyWinningMove;
        }

        // Find opponent's move
        let opWinningMove = WinningMove(botPlayer === Player1 ? Player2 : Player1);
        if (opWinningMove) {
            return opWinningMove;
        }


        let RandomCell = () => {
            let cells = JSON.parse(JSON.stringify(this.state.cells));

            // Find an empty cell to block the opponent from winning
            let emptyCells = [];
            for (let i = 0; i < BoardSize; i++) {
                for (let j = 0; j < BoardSize; j++) {
                    if (cells[i][j] === EmptyCell) {
                        emptyCells.push({ rowIndex: i, cellIndex: j });
                    }
                }
            }

            if (emptyCells.length > 0) {
                let randomIndex = Math.floor(Math.random() * emptyCells.length);
                return emptyCells[randomIndex];

            }
            return null;

        }

        let randomCell = RandomCell();
        if (randomCell) {
            return randomCell;
        }

        return null;

    }





    render() {
        return (
            <div className='board' >
                <div>
                    {this.state.cells.map((row, rowIndex) => {
                        return (
                            <div key={rowIndex}>
                                {row.map((cell, cellIndex) => {
                                    return (
                                        <input key={cellIndex}
                                            className='cell'
                                            type="button"
                                            onClick={() => this.tick(rowIndex, cellIndex)}
                                            value={cell}
                                        />
                                    )
                                })}
                            </div>
                        )
                    })}
                </div>

                <div className='toolbar' >
                    <span > Player : {this.state.player} </span>
                </div>

                <div className='toolbar' >
                    <input className='toolbutton' disabled={!(this.state.history && this.state.history.length !== 0)} type="button" value="Undo" onClick={() => this.undo()} />
                    <input className='toolbutton' disabled={!(this.state.future && this.state.future.length !== 0)} type="button" value="Redo" onClick={() => this.redo()} />
                    <input className='toolbutton' type="button" value="Reset" onClick={() => this.reset()} />
                    <input className='botbutton' type="button" value={this.state.bot === EmptyCell ? "Start playing with computer" : "Stop playing with computer"} onClick={() => this.startPlayingAsComputer()} />
                </div>

                <div>
                </div>


                <style>
                    {`
                        .board {
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            min-width: 40rem;
                        }

                        .cell {
                            width: 10rem;
                            height: 10rem;
                            border: 1px solid black;
                            text-align: center;
                            font-size: 8rem;
                        }
                        
                        .toolbar {
                            width: 30rem;
                            height: 3rem;
                            text-align: center;
                            font-size: 2rem;
                        }

                        .toolbutton {
                            width: 10rem;
                            height: 2.8rem;
                            margin-top: 0.1rem;
                            margin-bottom: 0.1rem;
                            border: 1px solid gray;
                            text-align: center;
                            font-size: 1rem;
                            vertical-align: middle;
                        }

                        .botbutton {
                            width: 30rem;
                            height: 2.8rem;
                            margin-top: 0.1rem;
                            margin-bottom: 0.1rem;
                            border: 1px solid gray;
                            text-align: center;
                            font-size: 1rem;
                            vertical-align: middle;
                        }

                    `}
                </style>
            </div>
        );
    }
}

export default Board;
