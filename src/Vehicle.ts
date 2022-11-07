export class Vehicle {
    route: string[] = [];
    //distance: number | null = null;

    constructor(route?: string[]) {
        if (route) this.route = route;
    }

    calcDistance(citiesGraph: { [key: string]: { [key: string]: number } }) {
        let distance = 0;
        for (let i = 0; i < this.route.length - 1; i++) {
            const city = this.route[i];
            const nextCity = this.route[i + 1];
            distance += citiesGraph[city][nextCity];
        }
        const roundDist = Math.round(distance);
        //this.distance = roundDist;
        return roundDist;
    }
}
