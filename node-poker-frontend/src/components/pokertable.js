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

    const handleBet = () => {
        socket.emit("player_action", { action: "bet", amount: betAmount });
    };

    return (
        <div className="poker-table">
            <h1> Poker Table </h1>
            { gameState ? (
                <pre> {JSON.stringy(gameState, null, 2)} </pre>
                ) : (
                    <p> Waiting for game data... </p>
                )
            }
            <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
            />
            <button onClick={handleBet}> Place Bet </button>
        </div>
    )
}
