import P5 from 'p5';
import { Member } from './Member';
import { Population } from './Population';

const totalCities: number = 7;
const fleetSize: number = 2;
const populationSize: number = 501;
const mutationRate = 0.2;
const canvasDimention = 600; // pixels
const maxGenerations = 250;

// Generate initial population
const population = new Population(totalCities, fleetSize, mutationRate, populationSize, canvasDimention);

const start = new Date();

let bestDistance = Number.MAX_SAFE_INTEGER;
let bestFitness = 0;

let bestEverMember: Member = new Member(totalCities, fleetSize);

// Creating the sketch itself
const sketchSetup = (p5: P5) => {
    // The sketch setup method
    p5.setup = () => {
        // Creating and positioning the canvas
        const canvasHeight = canvasDimention;
        const canvasWidth = canvasDimention;
        const canvas = p5.createCanvas(canvasWidth, canvasHeight);
        canvas.parent('app');

        // Configuring the canvas
        p5.background('black');
        p5.textFont('Arial');
        p5.textSize(16);
        p5.textStyle();
        //p5.frameRate(2);
        p5.noLoop();
    };
};

const sketch = new P5(sketchSetup);

const drawMember = (member: Member) => {
    const colors = ['red', 'green', 'blue', 'purple', 'yellow'];
    for (let i = 0; i < member.routes.length; i++) {
        const vehicle = member.routes[i];
        const color = colors[i];
        drawRoute(vehicle.route, color);
    }
};

const drawCityNumbers = () => {
    // Draw city dots
    sketch.fill('white');
    sketch.stroke('white');
    for (let i = 0; i < population.cities.length; i++) {
        const city = population.cities[i];
        sketch.ellipse(city.x, city.y, 30, 30);
    }

    // Draw city order numbers
    sketch.fill('green');
    sketch.stroke('green');
    /* for (let i = 0; i < member.genes.length; i++) {
        const index = member.genes[i];
        const city = population.cities[index];
        p5.text(i, city.x - 5, city.y + 5);
    } */
    for (let i = 0; i < population.cities.length; i++) {
        const city = population.cities[i];
        const cityHexId = i.toString(16);
        sketch.text(cityHexId, city.x - 5, city.y + 5);
        /*  p5.fill('white');
        p5.text(`${city.x}, ${city.y}`, city.x - 5, city.y + 30); */
    }
};

const drawRoute = (route: string[], color: string) => {
    sketch.beginShape();
    sketch.fill(0, 0, 0, 0);
    sketch.stroke(color);
    const routeCities = route.map((hexId) => population.citiesGraph.xyLookup[hexId]);
    for (const city of routeCities) {
        sketch.vertex(city.x, city.y);
    }
    sketch.endShape();
};

function runGA() {
    // Inital fitness values
    population.getAllFitnessValues();

    while (population.generations < maxGenerations) {
        population.newGeneration();
        population.getAllFitnessValues();

        // Get most fit member & check if finished
        const bestMemberOfGeneration = population.getMostFitMember();
        if (bestMemberOfGeneration.totalDistance < bestDistance) {
            bestDistance = bestMemberOfGeneration.totalDistance;
        }
        if (bestMemberOfGeneration.fitness > bestFitness) {
            bestFitness = bestMemberOfGeneration.fitness;
            bestEverMember = bestMemberOfGeneration;
        }
    }

    drawMember(bestEverMember);
    drawCityNumbers();
    console.log(bestEverMember.routes.map((veh) => veh.route).join('\n'));
    writeToElem('bestDistance', bestDistance + '');
    writeToElem('generations', population.generations + '');

    const end = new Date();
    const elapsed = end.getTime() - start.getTime();
    console.log('seconds elapsed', elapsed / 1000);

    /* console.log('genetic best route', bestEverMember.genes);
    console.log('genetic best distance', bestEverMember.distance);

    writeToElem('bestDistance', bestEverMember.distance + '');
    writeToElem('bestFitness', bestEverMember.fitness + ''); */
}

function writeToElem(id: string, txt: string) {
    const elem = document.getElementById(id);
    if (elem !== null) elem.innerHTML = txt;
}

(window as any).run = function () {
    runGA();
};
