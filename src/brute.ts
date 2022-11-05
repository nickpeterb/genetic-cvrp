import P5 from 'p5';
import { TSPGraph } from './Graph';
import { Member } from './Member';

const permutator = (inputArr) => {
    let result: any[] = [];

    const permute = (arr: any[], m: any[] = []) => {
        if (arr.length === 0) {
            result.push(m);
        } else {
            for (let i = 0; i < arr.length; i++) {
                let curr = arr.slice();
                let next = curr.splice(i, 1);
                permute(curr.slice(), m.concat(next));
            }
        }
    };

    permute(inputArr);

    return result;
};

export function bruteForceTSP(cities: P5.Vector[]) {
    if (cities.length > 9) {
        console.log('too many points to brute force');
        return 0;
    }
    const graph = new TSPGraph(cities);
    const allPossibleRoutes: string[][] = permutator(Object.keys(graph.graph));
    let bestDistance: number = Number.MAX_SAFE_INTEGER;
    let bestRoute: string[] = [];
    for (const route of allPossibleRoutes) {
        let routeDistance = 0;
        for (let i = 0; i < route.length - 1; i++) {
            const city = route[i];
            const nextCity = route[i + 1];
            const dist = graph.graph[city][nextCity];
            routeDistance += dist;
        }
        if (routeDistance < bestDistance) {
            bestDistance = routeDistance;
            bestRoute = route;
        }
    }

    //console.log('brute force best route', bestRoute);
    //console.log('brute force best', bestDistance);
    //return new Member(bestRoute.length, bestRoute);
    return bestDistance;
}
