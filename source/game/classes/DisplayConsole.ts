class DisplayConsole {

    public draw(b: Board) {
        console.log(this.toString(b));
    }

    public toString(b: Board) {

        let output = [];

        for (let y = 0; y < b.size; y++) {

            let row = [];

            for (let x = 0; x < b.size; x++) {
                let p = b.getPosition(x, y);
                let c = p.character;
                row.push(c);
            }

            output.push(row.join(' '));
        }

        return output.join('\n') + '\n';
    }
}
