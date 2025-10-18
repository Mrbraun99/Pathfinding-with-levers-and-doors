class MinHeap {
    constructor(comparator) {
        this.heap = [];
        this.comparator = comparator;
    }

    insert(item) {
        this.heap.push(item);

        let index = this.heap.length - 1;
        while (index > 0) {
            const parent_index = Math.floor((index - 1) / 2);

            if (this.heap[parent_index][this.comparator] <= this.heap[index][this.comparator]) break;

            [this.heap[parent_index], this.heap[index]] = [this.heap[index], this.heap[parent_index]];
            index = parent_index;
        }
    }

    pop() {
        const min = this.heap[0];

        if (this.heap.length == 1) {
            this.heap.pop();
            return min;
        }

        this.heap[0] = this.heap.pop();

        let index = 0;
        while (true) {
            const left = 2 * index + 1;
            const right = 2 * index + 2;
            let smallest = index;

            if (left < this.heap.length && this.heap[left][this.comparator] < this.heap[smallest][this.comparator]) {
                smallest = left;
            }

            if (right < this.heap.length && this.heap[right][this.comparator] < this.heap[smallest][this.comparator]) {
                smallest = right;
            }

            if (smallest == index) break;

            [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
            index = smallest;
        }

        return min;
    }

    isEmpty() {
        return this.heap.length == 0;
    }
}