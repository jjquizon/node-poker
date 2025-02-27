class PokerGame {
    constructor(tableId, players = []) {
        this.tableId = tableId;
        this.players = players;
        this.deck = this.createDeck();
        this.pot = 0;
        this.currentBet = 0;
        this.dealer_position = 0;
        this.currentTurn = 0;
        this.gameStarted = false;
    }

    createDeck() {
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        let deck = [];
        for (let suit of suits) {
            for (let rank of ranks) {
                deck.push({ suit, rank });
            }
        }

        return deck.sort(() => Math.random() - 0.5);
    }

    // Add a player to the table
    addPlayer(playerName) {
        if (this.players.length < 8) {
            this.players.push({ name: playerName, hand: [] chips: 1000, active: false });
            return `Player ${playerName} joined the table`;
        } else {
            return `Table is full`;
        }
    }

    // Deal two cards to each player
    dealHoleCards() {
        this.players.forEach(player => {
            player.hand = [this.deck.pop(), this.deck.pop()];
        });
    }

    nextStage() {
        if (this.stage === "pre-flop") {
            this.stage = "flop";
            this.communityCards = [this.deck.pop(), this.deck.pop(), this.deck.pop()];
        } else if (this.stage === "flop") {
            this.stage = "turn";
            this.communityCards.push(this.deck.pop());
        } else if (this.stage === "turn") {
            this.stage = "river";
            this.communityCards.push(this.deck.pop());
        } else if (this.stage === "river") {
            this.stage = "showdown";
        }
    }

    bet(playerName, amount) {
        let player = this.players.find(p => p.name === playerName);
        if (!player || player.chips < amount) {
            return `Invalid Bet`;
        }

        this.players.chips -= amount;
        this.pot += amount;
        this.currentBet = amount;
        this.nextTurn();
        return `${playerName} bet ${amount}`;
    }

    nextTurn() {
        do {
            this.currentTurn = (this.currentTurn + 1) % this.players.length;
        } while (!this.players[this.currentTurn].active);
    }

    fold(playerName) {
        let player = this.players.find(p => p.name === playerName);
        if (player) {
            player.active = false;
            this.nextTurn();
            return `${playerName} folded`;
        }
        
    }
}

module.exports = PokerGame;