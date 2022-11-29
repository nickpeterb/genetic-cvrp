import { City } from './Population';

export interface Dataset {
    name: string;
    route: string;
    optimum: number;
    fleetSize: number;
    cities: City[];
    capacity: number;
}

const datasetNames = ['A-n32-k5', 'A-n33-k5', 'P-n20-k2'];

export async function testReadFile(): Promise<any> {
    const filename = datasetNames[1];
    const localUrl = 'datasets/' + filename;
    const solutionResp = await fetch(localUrl + '.sol.txt');
    const solution = await solutionResp.text();

    const [route, optimum, fleetSize] = readSolution(solution);
    return fleetSize;
}

export async function readFile(): Promise<Dataset> {
    console.log('getting files...');

    const filename = datasetNames[0];
    const localUrl = 'datasets/' + filename;

    const instanceResp = await fetch(localUrl + '.vrp.txt');
    const instance = await instanceResp.text();

    const name = readValue(instance, 'NAME');
    const capacity = parseInt(readValue(instance, 'CAPACITY'));
    const cities = readCoordinates(instance);

    const solutionResp = await fetch(localUrl + '.sol.txt');
    const solution = await solutionResp.text();

    const [route, optimum, fleetSize] = readSolution(solution);

    return {
        name,
        route,
        optimum,
        fleetSize,
        capacity,
        cities,
    };
}

export function readSolution(solution: string): [string, number, number] {
    const split = solution.split('\n').filter((d) => d !== '');
    const lastRow = split.pop();
    const costKey = 'Cost ';
    const cost = parseInt(lastRow?.slice(costKey.length) || '');
    const fleetSize = split.length;
    const routes: string[] = [];
    for (const route of split) {
        const routeArr = route
            .split(':')[1]
            .split(' ')
            .filter((r) => r !== '');
        routes.push(...routeArr);
    }
    return [routes.join(','), cost, fleetSize];
}

function readCoordinates(data: string): City[] {
    const key = 'NODE_COORD_SECTION';
    const startIndex = data.indexOf(key) + 1 + key.length;
    const endIndex = data.indexOf('DEMAND_SECTION') - 1;
    const substring = data.slice(startIndex, endIndex);
    const arr = substring.split('\n').filter((e) => e !== '');
    const demands = readDemands(data);
    const cities: City[] = [];
    for (let cityStr of arr) {
        if (cityStr[0] === ' ') cityStr = cityStr.slice(1);
        const [index, x, y] = cityStr.split(' ').map((n) => parseInt(n));
        cities[index - 1] = { x, y, demand: demands[index - 1] };
    }
    return cities;
}

function readDemands(data: string): number[] {
    const key = 'DEMAND_SECTION';
    const startIndex = data.indexOf(key) + 1 + key.length;
    const endIndex = data.indexOf('DEPOT_SECTION') - 1;
    const substring = data.slice(startIndex, endIndex);
    const arr = substring.split('\n');
    const demands: number[] = [];
    for (const cityStr of arr) {
        const [index, demand] = cityStr.split(' ').map((n) => parseInt(n));
        demands[index - 1] = demand;
    }
    return demands;
}

function readValue(data: string, name: string): string {
    const key = name + ' : ';
    const startIndex = data.indexOf(key) + key.length;
    const substring = data.slice(startIndex);
    const result = substring.slice(0, substring.indexOf('\n'));
    return result;
}
