#!/usr/bin/env node
//
// The game's rules, pinned.
//
// Everything the README promises a player is a rule in the model, and none of it was checked
// anywhere: an 8x8 board dealt from 8 distinct characters, a tap clearing the connected run and
// nothing joined only by a corner, 2^(n-1) for a run of n, one turn per clear however large the run,
// twenty turns, the board settling with the tiles above falling into the gap, and a game in progress
// surviving a round trip through storage. A tap-connectivity bug or an off-by-one in the exponent
// ships silently otherwise.
//
// Dependency-free on purpose: the page loads these files as plain scripts, so the suite loads the
// same shipped .js in a vm context and calls the same methods the page calls. No npm install, no
// test framework - `node test/game-rules.test.js`.
//
// It tests the .js the page loads, which is generated from the .ts beside it; it cannot tell whether
// the two are still in step. Regenerating needs a TypeScript compiler:
//
//   npx -y -p typescript@5 tsc -p tsconfig.json

"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const MODEL = path.join(__dirname, "..", "source", "game", "classes", "model");

// The order index.html loads the model in, trimmed to what the rules need.
const FILES = ["Util.js", "Symbol.js", "Board.js", "Game.js"];

function loadModel() {
    const context = vm.createContext({});
    for (const file of FILES) {
        vm.runInContext(fs.readFileSync(path.join(MODEL, file), "utf8"), context, { filename: file });
    }
    return context;
}

const world = loadModel();
const Game = world.Game;

// ---- harness -----------------------------------------------------------------------------------

let passed = 0;
const failures = [];

function test(name, fn) {
    try {
        fn();
        passed++;
        process.stdout.write("  ok    " + name + "\n");
    } catch (problem) {
        failures.push(name + ": " + problem.message);
        process.stdout.write("  FAIL  " + name + "\n        " + problem.message + "\n");
    }
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

function eq(actual, expected, what) {
    if (actual !== expected) {
        throw new Error((what || "value") + ": expected " + JSON.stringify(expected)
            + ", got " + JSON.stringify(actual));
    }
}

function section(title) {
    process.stdout.write("\n" + title + "\n");
}

// ---- fixtures ----------------------------------------------------------------------------------

// A board built by slot: rows like [0, 0, 1] place game.symbols[0], game.symbols[0], game.symbols[1].
// Slots are how the real game deals - one Symbol instance per slot, shared by every cell holding that
// character - so identity comparison inside onRemove behaves exactly as it does in play.
function dealt(size, variations, rows) {
    const game = new Game(size, variations);
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            game.board.setPosition(x, y, game.symbols[rows[y][x]]);
        }
    }
    return game;
}

// A board of distinct characters, so a tap clears exactly the cell it lands on.
function allDistinct(size) {
    const rows = [];
    for (let y = 0; y < size; y++) {
        const row = [];
        for (let x = 0; x < size; x++) {
            row.push((y * size + x) % 8);
        }
        rows.push(row);
    }
    return dealt(size, 8, rows);
}

function grid(game) {
    let out = "";
    for (let y = 0; y < game.size; y++) {
        const row = [];
        for (let x = 0; x < game.size; x++) {
            row.push(game.board.getPosition(x, y).character);
        }
        out += row.join(" ") + "\n";
    }
    return out;
}

function slots(game) {
    const seen = new Set();
    for (let y = 0; y < game.size; y++) {
        for (let x = 0; x < game.size; x++) {
            seen.add(game.board.getPosition(x, y));
        }
    }
    return seen;
}

function tap(game, x, y) {
    const before = game.score;
    const neighbors = {};
    game.onRemove(x, y, neighbors);
    return { cleared: Object.keys(neighbors).length, scored: game.score - before };
}

// ---- the board as dealt ------------------------------------------------------------------------

section("the board as dealt");

test("the board is size x size, and the game is played on 8x8", () => {
    const game = new Game(8, 8);
    eq(game.board.size, 8, "board size");
    eq(game.size, 8, "game size");
    eq(game.board.positions.length, 64, "cell count");
    eq(game.variations, 8, "characters in play");
});

test("eight distinct characters are in play, and no cell is blank at the deal", () => {
    const game = new Game(8, 8);
    const inPlay = new Set();
    for (let i = 0; i < game.variations; i++) {
        inPlay.add(game.symbols[i].character);
    }
    eq(inPlay.size, 8, "distinct characters in play");

    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const cell = game.board.getPosition(x, y);
            assert(inPlay.has(cell.character),
                "cell " + x + "," + y + " holds " + JSON.stringify(cell.character)
                + ", which is not one of the eight");
        }
    }
});

test("a fresh game is worth nothing and has twenty turns", () => {
    const game = new Game(8, 8);
    eq(game.score, 0, "score");
    eq(game.movesUsed, 0, "turns used");
    eq(game.movesAvailable, 20, "turns available");
});

// ---- the tap: what is connected ----------------------------------------------------------------

section("the tap clears the run the tile belongs to");

test("a run is connected up, down, left and right, not by corner", () => {
    //  0 0 1 1
    //  0 2 1 3
    //  2 2 2 3
    //  3 3 3 3
    const game = dealt(4, 4, [
        [0, 0, 1, 1],
        [0, 2, 1, 3],
        [2, 2, 2, 3],
        [3, 3, 3, 3]
    ]);

    const run = tap(game, 0, 0);
    eq(run.cleared, 3, "the 0-run through the corner cell is three tiles");
    eq(game.board.getPosition(1, 1).character, game.symbols[2].character,
        "the diagonal 2 survives a tap on 0");
    assert(game.board.getPosition(2, 0).value !== -1, "the 1 to the right survives");
});

test("only the connected run goes, and it leaves blanks behind", () => {
    const game = dealt(4, 4, [
        [0, 0, 1, 1],
        [0, 2, 1, 3],
        [2, 2, 2, 3],
        [3, 3, 3, 3]
    ]);

    tap(game, 2, 0);

    eq(game.board.getPosition(0, 0).value !== -1, true, "the 0-run survives a tap on the 1-run");
    eq(game.board.getPosition(2, 0).value, -1, "the tapped cell is blank");
    eq(game.board.getPosition(3, 0).value, -1, "its neighbour is blank");
    eq(game.board.getPosition(2, 1).value, -1, "the tile below it is blank");
});

test("a single tile is a run of one", () => {
    const game = allDistinct(3);
    const run = tap(game, 1, 1);
    eq(run.cleared, 1, "tiles cleared");
    eq(run.scored, 1, "a run of one is worth 1");
});

// ---- the scoring table -------------------------------------------------------------------------

section("scoring is 2^(n-1) for a run of n");

test("the run of n scores 2^(n-1), both ends included", () => {
    // n = 1 .. 8, the whole table the README prints.
    const expected = [1, 2, 4, 8, 16, 32, 64, 128];

    for (let n = 1; n <= 8; n++) {
        const rows = [];
        for (let y = 0; y < 8; y++) {
            const row = [];
            for (let x = 0; x < 8; x++) {
                // one horizontal run of n in the top row, distinct elsewhere
                row.push(y === 0 && x < n ? 0 : (x % 7) + 1);
            }
            rows.push(row);
        }
        const game = dealt(8, 8, rows);
        const run = tap(game, 0, 0);
        eq(run.cleared, n, "run of " + n + ": tiles cleared");
        eq(run.scored, expected[n - 1], "run of " + n + ": score");
    }
});

test("a run of 8 is 128, not 256 and not 128 + something", () => {
    const rows = [];
    for (let y = 0; y < 8; y++) {
        const row = [];
        for (let x = 0; x < 8; x++) {
            row.push(y === 0 ? 0 : (x + y) % 7 + 1);
        }
        rows.push(row);
    }
    const game = dealt(8, 8, rows);
    eq(tap(game, 0, 0).scored, 128, "score for the full row");
});

// ---- turns -------------------------------------------------------------------------------------

section("a turn is spent whatever the size of the run");

test("a clear of five tiles spends one turn, not five", () => {
    const game = allDistinct(3);
    game.board.setPosition(0, 0, game.symbols[0]);
    game.board.setPosition(1, 0, game.symbols[0]);
    game.board.setPosition(2, 0, game.symbols[0]);
    game.board.setPosition(1, 1, game.symbols[0]);

    const run = tap(game, 0, 0);
    eq(run.cleared, 4, "tiles cleared");
    eq(game.movesUsed, 1, "turns spent");
    eq(run.scored, 8, "score");
});

test("twenty turns are available, and each clear spends exactly one", () => {
    const game = allDistinct(3);
    eq(game.movesAvailable, 20, "turns available");

    // The board is not settled between taps here, so each cell is re-dealt a lone tile and tapped.
    for (let turn = 1; turn <= game.movesAvailable; turn++) {
        const x = (turn - 1) % 3;
        const y = Math.floor((turn - 1) / 3) % 3;
        game.board.setPosition(x, y, game.symbols[turn % 8]);
        // keep the tap to one tile: give the neighbours a different character
        for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
            if (nx >= 0 && ny >= 0 && nx < 3 && ny < 3) {
                game.board.setPosition(nx, ny, game.symbols[(turn + 4) % 8]);
            }
        }
        tap(game, x, y);
        eq(game.movesUsed, turn, "turns spent after clear " + turn);
    }

    assert(game.movesUsed >= game.movesAvailable,
        "the game is over: " + game.movesUsed + " of " + game.movesAvailable + " turns spent");
});

// ---- the board settling ------------------------------------------------------------------------

section("the tiles above fall into the gap");

test("a tile lands in the cell below the run that was cleared", () => {
    const game = allDistinct(4);
    const falling = game.board.getPosition(1, 0);
    const bottom = game.board.getPosition(1, 3);

    tap(game, 1, 1);
    eq(game.board.getPosition(1, 1).value, -1, "the tapped cell is blank before the fall");

    game.fallPlan();
    game.moveDown();

    eq(game.board.getPosition(1, 1) === falling, true,
        "the tile above the gap landed in the gap");
    eq(game.board.getPosition(1, 3) === bottom, true,
        "and the tile that was already at the bottom stayed there");
});

test("clearing the bottom tile drops the column onto the bottom row", () => {
    const game = allDistinct(4);
    const above = game.board.getPosition(1, 2);

    const run = tap(game, 1, 3);
    eq(run.cleared, 1, "one tile was cleared");
    eq(game.board.getPosition(1, 3).value, -1, "the bottom cell is blank");

    game.moveDown();

    eq(game.board.getPosition(1, 3) === above, true,
        "the tile above the gap fell all the way to the bottom row");
});

test("the board settles with no blanks left anywhere", () => {
    const game = dealt(8, 8, Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => 0)));

    tap(game, 0, 0);
    eq(game.board.getPosition(0, 0).value, -1, "the whole board was cleared");
    game.moveDown();

    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            assert(game.board.getPosition(x, y).value !== -1, "cell " + x + "," + y + " is still blank");
        }
    }
    eq(slots(game).size <= 8, true, "the refills came from the eight in play");
});

test("the fall plan places every cell exactly once, and nothing moves up", () => {
    const game = dealt(4, 4, [
        [0, 1, 2, 3],
        [4, 5, 6, 7],
        [0, 1, 2, 3],
        [4, 5, 6, 7]
    ]);

    tap(game, 0, 3);

    const plan = game.fallPlan();
    eq(plan.length, 16, "one entry per cell");

    const seen = new Set();
    for (const move of plan) {
        const key = move.x + "," + move.to;
        assert(!seen.has(key), "two tiles land on " + key);
        seen.add(key);
        assert(move.to >= move.from || move.spawned,
            "a tile moved up: " + JSON.stringify(move));
        assert(move.spawned === (move.from < 0), "spawned means it starts above the grid");
    }
    eq(seen.size, 16, "every cell is covered");
});

// ---- the game in progress ----------------------------------------------------------------------

section("a game in progress survives a round trip through storage");

test("the board, the score and the turns come back", () => {
    const game = dealt(4, 4, [
        [0, 0, 1, 1],
        [0, 2, 1, 3],
        [2, 2, 2, 3],
        [3, 3, 3, 3]
    ]);
    tap(game, 0, 0);
    game.moveDown();

    const before = grid(game);
    const restored = Game.restore(game.serialize());

    eq(restored.size, game.size, "size");
    eq(restored.variations, game.variations, "characters in play");
    eq(restored.score, game.score, "score");
    eq(restored.movesUsed, game.movesUsed, "turns used");
    eq(grid(restored), before, "board");
});

test("state it cannot read is refused rather than half-restored", () => {
    const bad = [
        "not json at all",
        JSON.stringify({ version: 2, size: 4, variations: 4, score: 0, used: 0, symbols: "abcd", cells: "...." }),
        JSON.stringify({ version: 1, size: 4, variations: 4, score: 0, used: 0, symbols: "abc", cells: "...." }),
        JSON.stringify({ version: 1, size: 4, variations: 4, score: 0, used: 0, symbols: "abcd", cells: "..." })
    ];

    for (const state of bad) {
        let threw = false;
        try {
            Game.restore(state);
        } catch (expected) {
            threw = true;
        }
        assert(threw, "restore accepted " + state);
    }
});

// ---- result ------------------------------------------------------------------------------------

process.stdout.write("\n" + passed + " passed, " + failures.length + " failed\n");
if (failures.length > 0) {
    process.stdout.write("\n");
    for (const failure of failures) {
        process.stdout.write("  " + failure + "\n");
    }
    process.exit(1);
}
