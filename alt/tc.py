import random


class Board:
    def __init__(self, size):
        self.size = size
        self.data = []
        for r in range(size):
            row = []
            for c in range(size):
                row.append(".")
            self.data.append(row)

    def setPosition(self, x, y, s):
        self.data[y][x] = s
    
    def getPosition(self, x, y):
        return self.data[y][x]

    def __str__(self):
        output = ""
        for r in range(self.size):
            for c in range(self.size):
                output += self.data[r][c]
            output += "\n"
        return output


class Symbol:
    def __init__(self, int, text):
        self.int = int
        self.text = text

    def __str__(self):
        return self.text


class Game:
    score: int
    size: int
    variations: int
    randomize: bool
    symbols: []
    board: Board
    blank: Symbol
    colors = []
    movesAvailable: int = 20
    movesUsed: int = 0

    def __init__(self, size: int = 3, variations: int = 3, randomize: bool = True):
        self.score = 0
        self.size = size
        self.variations = variations
        self.randomize = randomize
        self.symbols = []

        self.board = Board(size)
        self.blank = ' '
        self.initColors()
        self.getSymbols()
        self.populate()

    def initColors(self):
        step = 8
        multi_step = step * 3
        start = 0
        max = 255
        min = 256
        for r in range(0, max, step):
            for g in range(start, max, step):
                for b in range(start, max, step):
                    deltas = abs(r - g) + abs(r - b) + abs(b - g)
                    if ((r + g + b) >= min and (deltas > multi_step)):
                        self.colors.append("rgb(" + str(r) + "," + str(g) + "," + str(b) + ")")
        random.shuffle(self.colors)

    def getRandomSymbol(self):
        r = random.randint(0, self.variations)
        s = self.symbols[r]
        return self.symbols[r].text

    def populate(self):
        size = self.size
        for y in range(0, size):
            for x in range(0, size):
                s = self.getRandomSymbol()
                #  s.color = self.colors[y * size + x]
                self.board.setPosition(x, y, s)

    def randomCompare(self):
        return 0.5 - random()

    def getSymbols(self):
        index = 0
        for c in range(0, 10):
            self.symbols.append(Symbol(index, str(c)))
            index += 1
        base = ord("A")
        for a in range(0, 26):
            self.symbols.append(Symbol(index, chr(base + a)))
            index += 1
        base_lower = ord("a")
        for a in range(0, 26):
            self.symbols.append(Symbol(index, chr(base_lower + a)))
            index += 1
        random.shuffle(self.symbols)

    def moveDown(self):
        moved = 0
        b = self.board
        for y in range(b.size - 1, -1, -1):
            for x in range(b.size - 1, -1, -1):
                v = b.getPosition(x, y)
                #  print(ord(v))
                if (v == self.blank):
                    if (y > 0):
                        b.setPosition(x, y, b.getPosition(x, y - 1))
                        b.setPosition(x, y - 1, self.blank)
                    else:
                        b.setPosition(x, y, self.getRandomSymbol())
                    moved += 1
        if (moved > 0):
            self.moveDown()

    def onRemove(self, x: int, y: int, neighbors: dict = {}):
        count = len(neighbors)
        b = self.board
        key: string = str(x) + "," + str(y)
        if (key in neighbors):
            return
        v: str = b.getPosition(x, y)
        neighbors[key] = key
        b.setPosition(x, y, self.blank)
        if (x < self.size - 1 and v == b.getPosition(x + 1, y)):
            self.onRemove(x + 1, y, neighbors)
        if (x > 0 and v == b.getPosition(x - 1, y)):
            self.onRemove(x - 1, y, neighbors)
        if (y < self.size - 1 and v == b.getPosition(x, y + 1)):
            self.onRemove(x, y + 1, neighbors)
        if (y > 0 and v == b.getPosition(x, y - 1)):
            self.onRemove(x, y - 1, neighbors)
        if (count == 0):
            n = len(neighbors)
            s = 2^(n-1)
            self.score += s
            self.movesUsed += 1


g = Game()
print(g.board)
g.onRemove(1, 1, {})
print(g.board)
g.moveDown()
print(g.board)
