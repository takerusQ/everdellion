import * as React from "react";
import { useState, useCallback, useEffect } from "react";

import Meadow from "./Meadow";
import Players from "./Players";
import GameInputBox from "./GameInputBox";
import { Player } from "../model/player";
import { CardName } from "../model/types";
import { GameJSON, PlayerJSON } from "../model/jsonTypes";

const Game: React.FC<{
  game: GameJSON;
  viewingPlayer: PlayerJSON;
}> = (props) => {
  const [game, setGame] = useState(props.game);
  const [viewingPlayer, setViewingPlayer] = useState(props.viewingPlayer);
  const updateGameAndViewingPlayer = useCallback(
    ({ game, viewingPlayer }) => {
      setGame(game);
      setViewingPlayer(viewingPlayer);
    },
    [game, viewingPlayer]
  );

  const { gameId, gameState } = game;
  const { playerId, playerSecret } = viewingPlayer;
  useEffect(() => {
    const eventSource = new EventSource(
      `/api/game-updates?gameId=${gameId}&playerId=${playerId}&playerSecret=${playerSecret}`
    );
    eventSource.onopen = (e) => {
      console.log("Open EventStream", e);
    };
    eventSource.onerror = (e) => {
      console.error("EventStream Error", e);
    };
    eventSource.onmessage = (e) => {
      updateGameAndViewingPlayer(JSON.parse(e.data));
    };
    return () => {
      eventSource.close();
    };
  }, [gameId, playerId, playerSecret]);

  const viewingPlayerImpl = Player.fromJSON(viewingPlayer);
  return (
    <>
      <Meadow meadowCards={gameState.meadowCards} />
      <GameInputBox
        gameId={gameId}
        gameState={gameState}
        viewingPlayer={viewingPlayerImpl}
      />
      <Players viewingPlayer={viewingPlayerImpl} gameState={gameState} />
      <hr />
      <div>
        <h2>DEBUG</h2>
        <div>
          <h3>you</h3>
          <pre>{JSON.stringify(viewingPlayer, null, 2)}</pre>
        </div>
        <div>
          <h3>Game State:</h3>
          <pre>{JSON.stringify(game, null, 2)}</pre>
        </div>
      </div>
    </>
  );
};

export default Game;
