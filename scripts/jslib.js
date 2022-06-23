class JSlib {
    static create2DArray(size, value) {
        let arr = [];
        for (let y = 0; y < size.y; y++) {
            arr[y] = [];
            for (let x = 0; x < size.x; x++) {
                arr[y][x] = value;
            }
        }
        return arr;
    }
}