import expect from "expect.js";
import { Adornment } from "./adornment";
import { Player } from "./player";
import { GameState } from "./gameState";
import { testInitialGameState, multiStepGameInputTest } from "./testHelpers";
import {
  AdornmentName,
  ExpansionType,
  LocationName,
  GameInputType,
  GameInputPlayAdornment,
  CardName,
  ResourceType,
} from "./types";

const playAdornmentInput = (
  adornment: AdornmentName
): GameInputPlayAdornment => {
  return {
    inputType: GameInputType.PLAY_ADORNMENT,
    clientOptions: {
      adornment,
    },
  };
};

describe("Adornment", () => {
  let gameState: GameState;
  let player: Player;

  beforeEach(() => {
    gameState = testInitialGameState();
    player = gameState.getActivePlayer();
  });

  describe("fromName", () => {
    it("should return the expect Adornment instances", () => {
      Object.values(AdornmentName).forEach((adt) => {
        expect(Adornment.fromName(adt as AdornmentName).name).to.be(adt);
      });
    });
  });

  describe(AdornmentName.SPYGLASS, () => {
    const name = AdornmentName.SPYGLASS;
    beforeEach(() => {
      player.gainResources({ [ResourceType.PEARL]: 1 });
      player.adornmentsInHand.push(name);
    });

    it("should gain 1 ANY, CARD and PEARL", () => {
      expect(player.getNumResourcesByType(ResourceType.PEARL)).to.be(1);

      expect(player.cardsInHand.length).to.be(0);
      expect(player.getNumResourcesByType(ResourceType.PEBBLE)).to.be(0);

      [player, gameState] = multiStepGameInputTest(gameState, [
        playAdornmentInput(name),
        {
          inputType: GameInputType.SELECT_OPTION_GENERIC,
          prevInputType: GameInputType.PLAY_ADORNMENT,
          adornmentContext: name,
          options: [
            ResourceType.BERRY,
            ResourceType.TWIG,
            ResourceType.RESIN,
            ResourceType.PEBBLE,
          ],
          clientOptions: {
            selectedOption: ResourceType.PEBBLE,
          },
        },
      ]);

      expect(player.adornmentsInHand).to.eql([]);
      expect(player.playedAdornments).to.eql([name]);
      expect(player.cardsInHand.length).to.be(1);
      expect(player.getNumResourcesByType(ResourceType.PEBBLE)).to.be(1);
      expect(player.getNumResourcesByType(ResourceType.PEARL)).to.be(1);
    });
  });

  describe(AdornmentName.SCALES, () => {
    const name = AdornmentName.SCALES;
    beforeEach(() => {
      player.gainResources({ [ResourceType.PEARL]: 1 });
      player.adornmentsInHand.push(name);
    });

    it("should be able to play and gain resources", () => {
      const adornment = Adornment.fromName(name);
      const gameInput = playAdornmentInput(name);

      expect(adornment.canPlay(gameState, gameInput)).to.be(true);
      expect(player.getNumResourcesByType(ResourceType.BERRY)).to.be(0);
      expect(player.getNumResourcesByType(ResourceType.TWIG)).to.be(0);
      player.cardsInHand.push(CardName.WIFE);
      player.cardsInHand.push(CardName.FARM);
      player.cardsInHand.push(CardName.HUSBAND);
      player.cardsInHand.push(CardName.POSTAL_PIGEON);
      player.cardsInHand.push(CardName.INN);
      player.cardsInHand.push(CardName.INNKEEPER);
      player.cardsInHand.push(CardName.QUEEN);

      const selectCardsInput = {
        inputType: GameInputType.SELECT_CARDS as const,
        prevInputType: GameInputType.PLAY_ADORNMENT,
        adornmentContext: name,
        cardOptions: player.cardsInHand,
        maxToSelect: 4,
        minToSelect: 0,
        clientOptions: {
          selectedCards: [
            CardName.INN,
            CardName.POSTAL_PIGEON,
            CardName.FARM,
            CardName.WIFE,
          ],
        },
      };

      const selectAnyInput = {
        inputType: GameInputType.SELECT_RESOURCES as const,
        prevInputType: GameInputType.SELECT_CARDS,
        adornmentContext: name,
        toSpend: false,
        maxResources: 4,
        minResources: 4,
        clientOptions: {
          resources: { [ResourceType.BERRY]: 3, [ResourceType.TWIG]: 1 },
        },
      };

      [player, gameState] = multiStepGameInputTest(gameState, [
        gameInput,
        selectCardsInput,
        selectAnyInput,
      ]);

      expect(adornment.canPlay(gameState, gameInput)).to.be(false);

      player = gameState.getPlayer(player.playerId);
      expect(player.getNumResourcesByType(ResourceType.PEARL)).to.be(0);
      expect(player.getNumResourcesByType(ResourceType.BERRY)).to.be(3);
      expect(player.getNumResourcesByType(ResourceType.TWIG)).to.be(1);
      expect(player.cardsInHand).to.eql([
        CardName.HUSBAND,
        CardName.INNKEEPER,
        CardName.QUEEN,
      ]);
      expect(player.getPoints(gameState)).to.be(3);
    });

    it("should not gain resources if didn't discard cards", () => {
      const adornment = Adornment.fromName(name);
      const gameInput = playAdornmentInput(name);

      expect(adornment.canPlay(gameState, gameInput)).to.be(true);
      expect(player.getNumResourcesByType(ResourceType.BERRY)).to.be(0);
      expect(player.getNumResourcesByType(ResourceType.TWIG)).to.be(0);
      player.cardsInHand.push(CardName.WIFE);
      player.cardsInHand.push(CardName.FARM);
      player.cardsInHand.push(CardName.HUSBAND);
      player.cardsInHand.push(CardName.POSTAL_PIGEON);
      player.cardsInHand.push(CardName.INN);
      player.cardsInHand.push(CardName.INNKEEPER);
      player.cardsInHand.push(CardName.QUEEN);

      const selectCardsInput = {
        inputType: GameInputType.SELECT_CARDS as const,
        prevInputType: GameInputType.PLAY_ADORNMENT,
        adornmentContext: name,
        cardOptions: player.cardsInHand,
        maxToSelect: 4,
        minToSelect: 0,
        clientOptions: {
          selectedCards: [],
        },
      };

      [player, gameState] = multiStepGameInputTest(gameState, [
        gameInput,
        selectCardsInput,
      ]);

      expect(adornment.canPlay(gameState, gameInput)).to.be(false);

      player = gameState.getPlayer(player.playerId);
      expect(player.getNumResourcesByType(ResourceType.PEARL)).to.be(0);
      expect(player.getNumResourcesByType(ResourceType.BERRY)).to.be(0);
      expect(player.getNumResourcesByType(ResourceType.TWIG)).to.be(0);
      expect(player.getNumResourcesByType(ResourceType.RESIN)).to.be(0);
      expect(player.getNumResourcesByType(ResourceType.PEBBLE)).to.be(0);
      expect(player.cardsInHand).to.eql([
        CardName.WIFE,
        CardName.FARM,
        CardName.HUSBAND,
        CardName.POSTAL_PIGEON,
        CardName.INN,
        CardName.INNKEEPER,
        CardName.QUEEN,
      ]);
      expect(player.getPoints(gameState)).to.be(5);
    });

    it("should calculate points correctly", () => {
      player.playedAdornments.push(name);

      let testHand = [CardName.WIFE];
      player.cardsInHand.push(...testHand);
      expect(player.getPointsFromAdornments(gameState)).to.be(1);

      player.cardsInHand = [];
      testHand = [CardName.WIFE, CardName.FARM];
      player.cardsInHand.push(...testHand);
      expect(player.getPointsFromAdornments(gameState)).to.be(2);

      player.cardsInHand = [];
      testHand = [CardName.WIFE, CardName.FARM, CardName.HUSBAND];
      player.cardsInHand.push(...testHand);
      expect(player.getPointsFromAdornments(gameState)).to.be(3);

      player.cardsInHand = [];
      testHand = [
        CardName.WIFE,
        CardName.FARM,
        CardName.HUSBAND,
        CardName.MONK,
      ];
      player.cardsInHand.push(...testHand);
      expect(player.getPointsFromAdornments(gameState)).to.be(4);

      player.cardsInHand = [];
      testHand = [
        CardName.WIFE,
        CardName.FARM,
        CardName.HUSBAND,
        CardName.MONK,
        CardName.QUEEN,
      ];
      player.cardsInHand.push(...testHand);
      // max 5 points from adornment
      expect(player.getPointsFromAdornments(gameState)).to.be(5);

      player.cardsInHand = [];
      testHand = [
        CardName.WIFE,
        CardName.FARM,
        CardName.HUSBAND,
        CardName.MONK,
        CardName.QUEEN,
        CardName.KING,
      ];
      player.cardsInHand.push(...testHand);
      // max 5 points from adornment
      expect(player.getPointsFromAdornments(gameState)).to.be(5);

      player.cardsInHand = [];
      testHand = [
        CardName.WIFE,
        CardName.FARM,
        CardName.HUSBAND,
        CardName.MONK,
        CardName.QUEEN,
        CardName.KING,
        CardName.POSTAL_PIGEON,
      ];
      player.cardsInHand.push(...testHand);
      // max 5 points from adornment
      expect(player.getPointsFromAdornments(gameState)).to.be(5);

      testHand = [
        CardName.WIFE,
        CardName.FARM,
        CardName.HUSBAND,
        CardName.MONK,
        CardName.QUEEN,
        CardName.KING,
        CardName.POSTAL_PIGEON,
        CardName.INN,
      ];
      player.cardsInHand.push(...testHand);

      // max 5 points from adornment
      expect(player.getPointsFromAdornments(gameState)).to.be(5);
    });
  });

  describe(AdornmentName.MIRROR, () => {
    const name = AdornmentName.MIRROR;
    beforeEach(() => {
      player.gainResources({ [ResourceType.PEARL]: 1 });
      player.adornmentsInHand.push(name);
    });

    xit("should have tests", () => {
      expect(player.getNumResourcesByType(ResourceType.PEARL)).to.be(1);
      [player, gameState] = multiStepGameInputTest(gameState, [
        playAdornmentInput(name),
      ]);
      expect(player.getNumResourcesByType(ResourceType.PEARL)).to.be(0);
    });
  });

  describe(AdornmentName.KEY_TO_THE_CITY, () => {
    const name = AdornmentName.KEY_TO_THE_CITY;
    beforeEach(() => {
      player.gainResources({ [ResourceType.PEARL]: 1 });
      player.adornmentsInHand.push(name);
    });

    xit("should have tests", () => {
      expect(player.getNumResourcesByType(ResourceType.PEARL)).to.be(1);
      [player, gameState] = multiStepGameInputTest(gameState, [
        playAdornmentInput(name),
      ]);
      expect(player.getNumResourcesByType(ResourceType.PEARL)).to.be(0);
    });
  });

  describe(AdornmentName.SUNDIAL, () => {
    const name = AdornmentName.SUNDIAL;
    beforeEach(() => {
      player.gainResources({ [ResourceType.PEARL]: 1 });
      player.adornmentsInHand.push(name);
    });

    xit("should have tests", () => {
      expect(player.getNumResourcesByType(ResourceType.PEARL)).to.be(1);
      [player, gameState] = multiStepGameInputTest(gameState, [
        playAdornmentInput(name),
      ]);
      expect(player.getNumResourcesByType(ResourceType.PEARL)).to.be(0);
    });
  });

  describe(AdornmentName.GILDED_BOOK, () => {
    const name = AdornmentName.GILDED_BOOK;
    beforeEach(() => {
      player.gainResources({ [ResourceType.PEARL]: 1 });
      player.adornmentsInHand.push(name);
    });

    xit("should have tests", () => {
      expect(player.getNumResourcesByType(ResourceType.PEARL)).to.be(1);
      [player, gameState] = multiStepGameInputTest(gameState, [
        playAdornmentInput(name),
      ]);
      expect(player.getNumResourcesByType(ResourceType.PEARL)).to.be(0);
    });
  });

  describe(AdornmentName.SEAGLASS_AMULET, () => {
    const name = AdornmentName.SEAGLASS_AMULET;
    beforeEach(() => {
      player.gainResources({ [ResourceType.PEARL]: 1 });
      player.adornmentsInHand.push(name);
    });

    xit("should have tests", () => {
      expect(player.getNumResourcesByType(ResourceType.PEARL)).to.be(1);
      [player, gameState] = multiStepGameInputTest(gameState, [
        playAdornmentInput(name),
      ]);
      expect(player.getNumResourcesByType(ResourceType.PEARL)).to.be(0);
    });
  });

  describe(AdornmentName.MASQUE, () => {
    const name = AdornmentName.MASQUE;
    beforeEach(() => {
      player.gainResources({ [ResourceType.PEARL]: 1 });
      player.adornmentsInHand.push(name);
    });

    xit("should have tests", () => {
      expect(player.getNumResourcesByType(ResourceType.PEARL)).to.be(1);
      [player, gameState] = multiStepGameInputTest(gameState, [
        playAdornmentInput(name),
      ]);
      expect(player.getNumResourcesByType(ResourceType.PEARL)).to.be(0);
    });
  });

  describe(AdornmentName.BELL, () => {
    const name = AdornmentName.BELL;
    beforeEach(() => {
      player.gainResources({ [ResourceType.PEARL]: 1 });
      player.adornmentsInHand.push(name);
    });

    it("can play adornment", () => {
      const adornment = Adornment.fromName(name);
      const gameInput = playAdornmentInput(name);

      expect(adornment.canPlay(gameState, gameInput)).to.be(true);
      expect(player.getNumResourcesByType(ResourceType.BERRY)).to.be(0);

      [player, gameState] = multiStepGameInputTest(gameState, [gameInput]);

      expect(adornment.canPlay(gameState, gameInput)).to.be(false);

      player = gameState.getPlayer(player.playerId);
      expect(player.getNumResourcesByType(ResourceType.PEARL)).to.be(0);
      expect(player.getNumResourcesByType(ResourceType.BERRY)).to.be(3);
      expect(player.getPoints(gameState)).to.be(0);
    });

    it("calculate points when city has critters", () => {
      const adornment = Adornment.fromName(name);
      const gameInput = playAdornmentInput(name);

      player.addToCity(CardName.WIFE);
      player.addToCity(CardName.POSTAL_PIGEON);
      player.addToCity(CardName.HUSBAND);
      player.addToCity(CardName.HUSBAND);

      expect(adornment.canPlay(gameState, gameInput)).to.be(true);
      expect(player.getNumResourcesByType(ResourceType.BERRY)).to.be(0);

      [player, gameState] = multiStepGameInputTest(gameState, [gameInput]);

      expect(adornment.canPlay(gameState, gameInput)).to.be(false);

      player = gameState.getPlayer(player.playerId);
      expect(player.getNumResourcesByType(ResourceType.PEARL)).to.be(0);
      expect(player.getNumResourcesByType(ResourceType.BERRY)).to.be(3);
      expect(player.getPointsFromAdornments(gameState)).to.be(2);
      expect(player.getPoints(gameState)).to.be(11);
    });

    it("odd number of critters in city", () => {
      player.addToCity(CardName.WIFE);
      player.addToCity(CardName.POSTAL_PIGEON);
      player.addToCity(CardName.HUSBAND);
      player.playedAdornments.push(name);

      expect(player.getPointsFromAdornments(gameState)).to.be(1);
    });
  });

  describe(AdornmentName.HOURGLASS, () => {
    const name = AdornmentName.HOURGLASS;
    beforeEach(() => {
      player.gainResources({ [ResourceType.PEARL]: 1 });
      player.adornmentsInHand.push(name);

      gameState.locationsMap[LocationName.FOREST_TWO_BERRY_ONE_CARD] = [];
      gameState.locationsMap[LocationName.FOREST_THREE_BERRY] = [];
    });

    it("should allow the player to copy a forest location and gain 1 ANY", () => {
      expect(player.getNumResourcesByType(ResourceType.PEARL)).to.be(1);

      expect(player.getNumResourcesByType(ResourceType.PEBBLE)).to.be(0);
      expect(player.getNumResourcesByType(ResourceType.BERRY)).to.be(0);

      [player, gameState] = multiStepGameInputTest(
        gameState,
        [
          playAdornmentInput(name),
          {
            inputType: GameInputType.SELECT_LOCATION,
            prevInputType: GameInputType.PLAY_ADORNMENT,
            adornmentContext: name,
            locationOptions: [
              LocationName.FOREST_TWO_BERRY_ONE_CARD,
              LocationName.FOREST_THREE_BERRY,
            ],
            clientOptions: {
              selectedLocation: LocationName.FOREST_THREE_BERRY,
            },
          },
          {
            inputType: GameInputType.SELECT_OPTION_GENERIC,
            prevInputType: GameInputType.PLAY_ADORNMENT,
            adornmentContext: name,
            options: [
              ResourceType.BERRY,
              ResourceType.TWIG,
              ResourceType.RESIN,
              ResourceType.PEBBLE,
            ],
            clientOptions: {
              selectedOption: ResourceType.PEBBLE,
            },
          },
        ],
        { skipMultiPendingInputCheck: true }
      );

      expect(player.adornmentsInHand).to.eql([]);
      expect(player.playedAdornments).to.eql([name]);
      expect(player.getNumResourcesByType(ResourceType.BERRY)).to.be(3);
      expect(player.getNumResourcesByType(ResourceType.PEBBLE)).to.be(1);
      expect(player.getNumResourcesByType(ResourceType.PEARL)).to.be(0);
    });
  });

  describe(AdornmentName.COMPASS, () => {
    const name = AdornmentName.COMPASS;
    beforeEach(() => {
      player.gainResources({ [ResourceType.PEARL]: 1 });
      player.adornmentsInHand.push(name);
    });

    xit("should have tests", () => {
      expect(player.getNumResourcesByType(ResourceType.PEARL)).to.be(1);
      [player, gameState] = multiStepGameInputTest(gameState, [
        playAdornmentInput(name),
      ]);
      expect(player.getNumResourcesByType(ResourceType.PEARL)).to.be(0);
    });
  });

  describe(AdornmentName.TIARA, () => {
    const name = AdornmentName.TIARA;
    beforeEach(() => {
      player.gainResources({ [ResourceType.PEARL]: 1 });
      player.adornmentsInHand.push(name);
    });

    it("should do nothing if no PROSPERITY", () => {
      expect(player.getNumResourcesByType(ResourceType.PEARL)).to.be(1);
      [player, gameState] = multiStepGameInputTest(gameState, [
        playAdornmentInput(name),
      ]);
      expect(player.getNumResourcesByType(ResourceType.PEARL)).to.be(0);
    });

    it("should allow the player to gain ANY per PROSPERITY", () => {
      player.addToCity(CardName.WIFE);
      player.addToCity(CardName.WIFE);

      expect(player.getNumResourcesByType(ResourceType.BERRY)).to.be(0);
      expect(player.getNumResourcesByType(ResourceType.PEARL)).to.be(1);

      [player, gameState] = multiStepGameInputTest(gameState, [
        playAdornmentInput(name),
        {
          inputType: GameInputType.SELECT_RESOURCES,
          toSpend: false,
          prevInputType: GameInputType.PLAY_ADORNMENT,
          adornmentContext: name,
          maxResources: 2,
          minResources: 2,
          clientOptions: {
            resources: {
              [ResourceType.BERRY]: 2,
            },
          },
        },
      ]);
      expect(player.getNumResourcesByType(ResourceType.PEARL)).to.be(0);
      expect(player.getNumResourcesByType(ResourceType.BERRY)).to.be(2);
    });
  });
});
