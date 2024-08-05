import { winningPatterns } from 'src/constants/constant';
import { IPlayer } from 'src/interfaces/game.interface';

export class Game {
  board: Array<IPlayer>;
  currentPlayer: 'X' | 'O';
  round: number;
  winner: null | IPlayer;
  scores: {
    X: number;
    O: number;
    Tie: number;
  };

  constructor() {
    this.board = Array(9).fill('');
    this.round = 1;
    this.currentPlayer = 'X';
    this.winner = null;
    this.scores = {
      X: 0,
      O: 0,
      Tie: 0,
    };
  }

  updateBoard(position: number, player: IPlayer) {
    if (this.currentPlayer === player) {
      if (!this.board[position]) {
        this.board[position] = player;
        this.nextPlayer();
        return this.board;
      } else throw new Error('Invalid Move');
    } else throw new Error(`Player ${this.currentPlayer} Turn`);
  }

  nextPlayer() {
    this.currentPlayer = this.currentPlayer == 'X' ? 'O' : 'X';
  }

  getWinner() {
    let winningPattern = null;

    if (this.board.filter((cell) => cell).length <= 3) {
      this.winner = null;
      return { winner: this.winner, pattern: winningPattern };
    }

    for (let [a, b, c] of winningPatterns) {
      if (
        this.board[a] &&
        this.board[a] === this.board[b] &&
        this.board[a] === this.board[c]
      ) {
        this.winner = this.board[a];
        winningPattern = [a, b, c];
        return { winner: this.winner, pattern: winningPattern };
      }
    }

    // Check for a tie
    this.winner = this.board.includes('') ? null : '';
    return { winner: this.winner, pattern: winningPattern };
  }

  nextRound() {
    this.round += 1;
    this.board = this.board.map((pos) => (pos = ''));
    this.currentPlayer = 'X';
    this.winner = null;

    return this.round;
  }

  updateScore() {
    const key =
      this.winner === 'X' || this.winner === 'O' ? this.winner : 'Tie';
    this.scores = { ...this.scores, [key]: this.scores[key] + 1 };

    return this.scores;
  }
}
