import p5 from 'p5';
import { City } from './Population';

export class VRPGraph {
    noOfVertecies: number;
    graph = {};
    lookup: { [key: string]: City } = {};

    constructor(cities: City[]) {
        for (let cityIndex = 0; cityIndex < cities.length; cityIndex++) {
            const city = cities[cityIndex];
            const cityId = cityIndex.toString();
            this.lookup[cityId] = city;
            this.graph[cityId] = {};

            for (let sisterIndex = 0; sisterIndex < cities.length; sisterIndex++) {
                if (sisterIndex === cityIndex) this.graph[cityId][cityId] = 0;
                else {
                    const sisterCity = cities[sisterIndex];
                    const sisterId = sisterIndex.toString();
                    const cityVector = p5.prototype.createVector(city.x, city.y);
                    const sisterVector = p5.prototype.createVector(sisterCity.x, sisterCity.y);
                    this.graph[cityId][sisterId] = Math.round(p5.Vector.dist(cityVector, sisterVector));
                }
            }
        }
    }
}
