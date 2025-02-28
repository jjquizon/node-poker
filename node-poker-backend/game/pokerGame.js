import PokerHandEvaluator from './PokerHandEvaluator';

class PokerGame {
    constructor(tableId, players = []) {
        this.tableId = tableId;
        this.players = players;
        this.deck = this.createDeck();
        this.pot = 0;
        this.currentBet = 0;
        this.dealerPositionIndex = 0;
        this.currentTurn = 0;
        this.gameStarted = false;
        this.turnIndex: 0,
        this.smallBlind: 10,
        this.bigBlind: 20
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


        // Shuffles deck, TODO: Fisher-Yates shuffle 
        return deck.sort(() => Math.random() - 0.5);
    }

    // Add a player to the table
    addPlayer(player) {
        if (this.players.length < 8) {
            this.players.push({
                id: player.id,
                username: player.userName,
                hand: [],
                chips: 1000,
                hasFolded: false,
                currentBet: 0,
                isAllIn: false
            });
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

    startBettingRound() {
        this.currentBet = 0;
        this.players.forEach(player => {
            player.currentBet = 0;
        }
        this.currentTurn = this.dealerPositionIndex + 1;
        this.players.forEach(player => {
            player.currentBet = 0;
            player.hasFolded = false;
        });
    }

    playerAction(playerId, action, amount = 0) {
        let player = this.players.find(p => p.id === playerId);
        if (!player || player.hasFolded || player.isAllIn) return { error: "Invalid move" };

        switch (action) {
            case "fold":
                player.hasFolded = true;
                break;

            case "call":
                let callAmount = this.currentBet - player.currentBet;
                if (player.chips < callAmount) return { error: "Not enough chips" };
                player.chips -= callAmount;
                player.currentBet += callAmount;
                this.pot += callAmount;
                break;

            case "raise":
                if (amount <= this.currentBet) return { error: "Raise must be higher" };
                if (player.chips < amount) return { error: "Not enough chips" };
                player.chips -= amount;
                player.currentBet += amount;
                this.pot += amount;
                this.currentBet = amount;
                this.lastAggressiveIndex = this.currentTurnIndex;
                break;


            // TODO Re-visit all-in logic for raises, need to implement side-pots
            case "all-in":
                player.isAllIn = true;
                this.pot += player.chips;
                player.currentBet += player.chips;
                player.chips = 0;
                if (player.currentBet > this.currentBet) {
                    this.currentBet = player.currentBet;
                    this.lastAggressiveIndex = this.currentTurnIndex;
                }
                break;
        }

        this.currentTurnIndex = this.getNextActivePlayer();
        if (this.currentTurnIndex === this.lastAggressiveIndex) this.nextStage();
    }

    getNextActivePlayer() {
        let nextIndex = this.currentTurnIndex;
        do {
            nextIndex = (nextIndex + 1) % this.players.length;
        } while (this.players[nextIndex].hasFolded || this.players[nextIndex].isAllIn);
        return nextIndex;
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
            return this.determineWinner();
        }
    }

    nextTurn() {
        let nextIndex = this.currentTurnIndex;
        do {
            this.currentTurn = (this.currentTurn + 1) % this.players.length;
        } while (!this.players[this.currentTurn].active);
        return nextIndex;
    }

    determineWinner() {
        const activePlayers = this.players.filter(p => !p.hasFolded);
        if (activePlayers.length === 1) return { winner: activePlayers[0].username, pot: this.pot };

        let bestHand = null;
        let winner = null;


        activePlayers.forEach(player => {
            const hand = [...player.holeCards, ...this.communityCards];
            const handRank = PokerHandEvaluator.evaluate(hand);
            if (!bestHand || handRank > bestHand) {
                bestHand = handRank;
                winner = player;
            }
        });

        // Implement tie-breaker logic here
        if (winner) {
            winner.chips += this.pot;
            return { winner: winner.username, pot: this.pot };
        }

        return { error: "No winner found" };
    }
}

module.exports = PokerGame;