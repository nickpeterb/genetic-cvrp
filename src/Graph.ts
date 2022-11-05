import p5 from 'p5';

export class TSPGraph {
    noOfVertecies: number;
    graph = {};
    xyLookup: { [key: string]: p5.Vector } = {};

    constructor(cities: p5.Vector[]) {
        for (let cityIndex = 0; cityIndex < cities.length; cityIndex++) {
            const city = cities[cityIndex];
            const cityHexId = cityIndex.toString(16);
            this.xyLookup[cityHexId] = city;
            this.graph[cityHexId] = {};

            for (let sisterIndex = 0; sisterIndex < cities.length; sisterIndex++) {
                if (sisterIndex !== cityIndex) {
                    const sisterCity = cities[sisterIndex];
                    const sisterHexId = sisterIndex.toString(16);
                    this.graph[cityHexId][sisterHexId] = Math.round(this.calcDistance(city.x, city.y, sisterCity.x, sisterCity.y));
                }
            }
        }
    }

    calcDistance(x1: number, x2: number, y1: number, y2: number) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }
}
