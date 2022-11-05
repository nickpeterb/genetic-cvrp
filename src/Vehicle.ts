export class Vehicle {
    route: string[] = [];
    distance: number | null = null;

    calcDistance(citiesGraph: { [key: string]: { [key: string]: number } }) {
        let distance = 0;
        for (let i = 0; i < this.route.length - 1; i++) {
            const city = this.route[i];
            const nextCity = this.route[i + 1];
            distance += citiesGraph[city][nextCity];
        }
        this.distance = Math.round(distance);
        return this.distance;
    }
}
