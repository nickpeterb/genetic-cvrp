import P5 from 'p5';
import salesman from 'salesman.js';

export function annealTSP(cities: P5.Vector[]) {
    const points = cities.map((city) => new salesman.Point(city.x, city.y));
    const solution = salesman.solve(points);
    console.log(solution);
    const distance = calcTotalDistance(solution, cities);
    console.log('sim. annealing best', distance);
    const orderedPoints = solution.map((i) => points[i]);
    console.log(orderedPoints);
    return solution;
}

export function calcTotalDistance(route: number[], cities: P5.Vector[]): number {
    let distance = 0;
    for (let i = 0; i < route.length - 1; i++) {
        const currIndex = route[i];
        const nextIndex = route[i + 1];
        const dist = calcDistance(cities[currIndex].x, cities[currIndex].y, cities[nextIndex].x, cities[nextIndex].y);
        distance += dist;
        console.log(`${currIndex} --> ${nextIndex}`, dist);
    }
    return Math.round(distance);
}

function calcDistance(x1: number, x2: number, y1: number, y2: number) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}
