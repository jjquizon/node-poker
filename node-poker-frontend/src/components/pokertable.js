import { useEffect, useState } from "react";
import socket from "../socket";

export default function Pokertable() {
    const [gameState, setGameState] = useState(null);
    const [betAmount, setBetAmount] = useState(0);

    useEffect(() => {
        socket.on("update_game", (data) => {
            setGameState(data);
        });

        return () => {
            socket.off("update_game");
        }

    }, []);

    const handleAction = (action) => {
        socket.emit("player_action", { action: action, amount: (action === "bet" ? betAmount : null) });
    };

    const getCardImage = (card) => {
        var lowerCaseRank = card.rank.toLowerCase();
        return `/cards/${card.suit}_${lowerCaseRank}.png`;  // Example: "AH.png"
    };

    return (
        <div className="poker-table">
            <h1> Poker Table </h1>
            <div className="players">
                { gameState?.players.map((player, index) => (
                    <div key={index} className={`player ${player.isTurn ? "active" : ""}`}>
                        <p>{player.userName} {player.isTurn && "(Your turn!)"}</p>
                        <p>Chips: {player.chips}</p>
                        {player.cards && (
                            <div className="cards">
                                {player.cards.map((card, index) => (
                                    <span key={index}>{card.rank}{card.suit}</span>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="community-cards">
                {gameState?.communityCards.map((card, index) => (
                    <span key={index}>{card.rank}{card.suit}</span>
                ))}
            </div>

            <div className="actions">
                <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                />
                <button onClick={() => handleAction("bet")}>Bet</button>
                <button onClick={() => handleAction("call")}>Call</button>
                <button onClick={() => handleAction("check")}>Check</button>
                <button onClick={() => handleAction("fold")}>Fold</button>
                <button onClick={() => handleAction("all-in")}>All-In</button>
            </div>

            <div className="pot">
                <h2>Pot: {gameState?.pot || 0 }</h2>
            </div>

            { gameState ? (
                <pre> {JSON.stringy(gameState, null, 2)} </pre>
                ) : (
                    <p> Waiting for game data... </p>
                )
            }
        </div>
    )
}
