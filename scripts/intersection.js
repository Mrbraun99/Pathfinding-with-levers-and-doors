class Intersection {
    static lineline(l1, l2) {
        const p1 = l1.p1;
        const p2 = l1.p2;
        const p3 = l2.p1;
        const p4 = l2.p2;

        const s1 = { x: p2.x - p1.x, y: p2.y - p1.y };
        const s2 = { x: p4.x - p3.x, y: p4.y - p3.y };

        const s = (-s1.y * (p1.x - p3.x) + s1.x * (p1.y - p3.y)) / (-s2.x * s1.y + s1.x * s2.y);
        const t = (s2.x * (p1.y - p3.y) - s2.y * (p1.x - p3.x)) / (-s2.x * s1.y + s1.x * s2.y);

        if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
            return { x: p1.x + (t * s1.x), y: p1.y + (t * s1.y), t: t };
        }

        return null;
    }

    static rectline(corners, l) {
        const edges = [
            { "p1": corners[0], "p2": corners[1] },
            { "p1": corners[1], "p2": corners[2] },
            { "p1": corners[2], "p2": corners[3] },
            { "p1": corners[3], "p2": corners[0] }
        ];

        const intersections = [];

        for (const edge of edges) {
            const intersection_point = Intersection.lineline({ "p1": l.p1, "p2": l.p2 }, { "p1": edge.p1, "p2": edge.p2 });

            if (intersection_point) {
                intersections.push(intersection_point);
            }
        }

        return intersections;
    }
}