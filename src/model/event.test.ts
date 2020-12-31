import expect from "expect.js";
import { Event } from "./event";
import { GameState } from "./gameState";
import { testInitialGameState } from "./testHelpers";
import {
  EventName,
  GameInputType,
  GameInputClaimEvent,
  CardName,
} from "./types";

const claimEventInput = (event: EventName): GameInputClaimEvent => {
  return {
    inputType: GameInputType.CLAIM_EVENT,
    event,
  };
};

describe("Event", () => {
  let gameState: GameState;

  beforeEach(() => {
    gameState = testInitialGameState();
  });

  describe("fromName", () => {
    it("should return the expect Event instances", () => {
      for (const evt in EventName) {
        expect(Event.fromName(evt as EventName).name).to.be(evt);
      }
    });
  });

  describe(EventName.BASIC_FOUR_PRODUCTION_TAGS, () => {
    it("should only be playable with four production tags", () => {
      const event = Event.fromName(EventName.BASIC_FOUR_PRODUCTION_TAGS);
      const gameInput = claimEventInput(event.name);
      const player = gameState.getActivePlayer();
      player.playedCards = {};
      expect(event.canPlay(gameState, gameInput)).to.be(false);

      player.playedCards[CardName.MINE] = [{}, {}];
      player.playedCards[CardName.FARM] = [{}, {}];
      expect(event.canPlay(gameState, gameInput)).to.be(true);

      expect(Object.keys(player.claimedEvents).length == 0);

      event.play(gameState, gameInput);
      expect(player.claimedEvents[EventName.BASIC_FOUR_PRODUCTION_TAGS]);
      expect(Object.keys(player.claimedEvents).length == 1);
    });
  });

  describe(EventName.BASIC_THREE_DESTINATION, () => {
    it("should only be playable with three destination tags", () => {
      const event = Event.fromName(EventName.BASIC_THREE_DESTINATION);
      const gameInput = claimEventInput(event.name);
      const player = gameState.getActivePlayer();
      player.playedCards = {};
      expect(event.canPlay(gameState, gameInput)).to.be(false);

      player.playedCards[CardName.UNIVERSITY] = [{}];
      player.playedCards[CardName.QUEEN] = [{}];
      player.playedCards[CardName.LOOKOUT] = [{}];
      expect(event.canPlay(gameState, gameInput)).to.be(true);

      expect(Object.keys(player.claimedEvents).length == 0);

      event.play(gameState, gameInput);
      expect(player.claimedEvents[EventName.BASIC_THREE_DESTINATION]);
      expect(Object.keys(player.claimedEvents).length == 1);
    });
  });

  describe(EventName.BASIC_THREE_TRAVELER, () => {
    it("should only be playable with three traverler tags", () => {
      const event = Event.fromName(EventName.BASIC_THREE_TRAVELER);
      const gameInput = claimEventInput(event.name);
      const player = gameState.getActivePlayer();
      player.playedCards = {};
      expect(event.canPlay(gameState, gameInput)).to.be(false);

      player.playedCards[CardName.WANDERER] = [{}, {}];
      player.playedCards[CardName.RANGER] = [{}];
      expect(event.canPlay(gameState, gameInput)).to.be(true);

      expect(Object.keys(player.claimedEvents).length == 0);

      event.play(gameState, gameInput);
      expect(player.claimedEvents[EventName.BASIC_THREE_TRAVELER]);
      expect(Object.keys(player.claimedEvents).length == 1);
    });
  });

  describe(EventName.BASIC_THREE_GOVERNANCE, () => {
    it("should only be playable with three governance tags", () => {
      const event = Event.fromName(EventName.BASIC_THREE_GOVERNANCE);
      const gameInput = claimEventInput(event.name);
      const player = gameState.getActivePlayer();
      player.playedCards = {};
      expect(event.canPlay(gameState, gameInput)).to.be(false);

      player.playedCards[CardName.JUDGE] = [{}];
      player.playedCards[CardName.HISTORIAN] = [{}];
      player.playedCards[CardName.INNKEEPER] = [{}];
      expect(event.canPlay(gameState, gameInput)).to.be(true);

      expect(Object.keys(player.claimedEvents).length == 0);

      event.play(gameState, gameInput);
      expect(player.claimedEvents[EventName.BASIC_THREE_GOVERNANCE]);
      expect(Object.keys(player.claimedEvents).length == 1);
    });
  });

  describe(EventName.SPECIAL_THE_EVERDELL_GAMES, () => {
    it("should only be playable with 2 of each tags", () => {
      const event = Event.fromName(EventName.SPECIAL_THE_EVERDELL_GAMES);
      const gameInput = claimEventInput(event.name);
      const player = gameState.getActivePlayer();

      gameState.eventsMap[EventName.SPECIAL_THE_EVERDELL_GAMES] = null;

      player.playedCards = {};
      expect(event.canPlay(gameState, gameInput)).to.be(false);

      player.playedCards[CardName.JUDGE] = [{}];
      player.playedCards[CardName.HISTORIAN] = [{}];
      expect(event.canPlay(gameState, gameInput)).to.be(false);

      player.playedCards[CardName.FARM] = [{}, {}];
      expect(event.canPlay(gameState, gameInput)).to.be(false);

      player.playedCards[CardName.WANDERER] = [{}, {}];
      expect(event.canPlay(gameState, gameInput)).to.be(false);

      player.playedCards[CardName.QUEEN] = [{}];
      player.playedCards[CardName.LOOKOUT] = [{}];
      expect(event.canPlay(gameState, gameInput)).to.be(false);

      player.playedCards[CardName.KING] = [{}];
      player.playedCards[CardName.WIFE] = [{}];
      expect(event.canPlay(gameState, gameInput)).to.be(true);

      expect(Object.keys(player.claimedEvents).length == 0);

      event.play(gameState, gameInput);
      expect(player.claimedEvents[EventName.SPECIAL_THE_EVERDELL_GAMES]);
      expect(Object.keys(player.claimedEvents).length == 1);
    });
  });

  describe(EventName.SPECIAL_GRADUATION_OF_SCHOLARS, () => {
    it("game state", () => {
      const event = Event.fromName(EventName.SPECIAL_GRADUATION_OF_SCHOLARS);
      let player = gameState.getActivePlayer();
      const gameInput = claimEventInput(event.name);

      gameState.eventsMap[EventName.SPECIAL_GRADUATION_OF_SCHOLARS] = null;
      player.playedCards[CardName.TEACHER] = [{}];
      player.playedCards[CardName.UNIVERSITY] = [{}];

      player.cardsInHand = [
        CardName.POSTAL_PIGEON,
        CardName.HUSBAND,
        CardName.WIFE,
        CardName.FOOL,
        CardName.FARM,
      ];

      // check if the player can claim the event

      // try to claim the event + check that you get the correct game state back
      expect(gameState.pendingGameInputs).to.eql([]);
      expect(
        player.claimedEvents[EventName.SPECIAL_GRADUATION_OF_SCHOLARS]
      ).to.be(undefined);

      expect(event.canPlay(gameState, gameInput)).to.be(true);

      const gameState2 = gameState.next(gameInput);
      expect(player.playerId).to.be(gameState2.getActivePlayer().playerId);
      player = gameState2.getActivePlayer();
      expect(
        player.claimedEvents[EventName.SPECIAL_GRADUATION_OF_SCHOLARS]
      ).to.eql({ storedCards: [], hasWorker: true });
      expect(gameState2.pendingGameInputs).to.eql([
        {
          inputType: GameInputType.SELECT_MULTIPLE_CARDS,
          prevInputType: GameInputType.CLAIM_EVENT,
          eventContext: EventName.SPECIAL_GRADUATION_OF_SCHOLARS,
          // Farm isn't an option for this event because it's not a critter
          cardOptions: [
            CardName.POSTAL_PIGEON,
            CardName.HUSBAND,
            CardName.WIFE,
            CardName.FOOL,
          ],
          maxToSelect: 3,
          minToSelect: 0,
          clientOptions: {
            selectedCards: null,
          },
        },
      ]);

      const gameState3 = gameState2.next({
        inputType: GameInputType.SELECT_MULTIPLE_CARDS,
        prevInputType: GameInputType.CLAIM_EVENT,
        eventContext: EventName.SPECIAL_GRADUATION_OF_SCHOLARS,
        cardOptions: [
          CardName.POSTAL_PIGEON,
          CardName.HUSBAND,
          CardName.WIFE,
          CardName.FOOL,
        ],
        maxToSelect: 3,
        minToSelect: 0,
        clientOptions: {
          selectedCards: [
            CardName.POSTAL_PIGEON,
            CardName.HUSBAND,
            CardName.WIFE,
          ],
        },
      });

      expect(player.playerId).to.not.be(gameState3.getActivePlayer().playerId);

      player = gameState3.getPlayer(player.playerId);

      expect(
        player.claimedEvents[EventName.SPECIAL_GRADUATION_OF_SCHOLARS]
      ).to.eql({
        storedCards: ["POSTAL_PIGEON", "HUSBAND", "WIFE"],
        hasWorker: true,
      });
    });
  });
});
