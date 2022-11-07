import P5 from 'p5';
import { Member } from './Member';
import { Population } from './Population';
import { calcTotalDistance, annealTSP } from './anneal';
import { bruteForceTSP } from './brute';
import { testGA, testInputs } from './test';

const totalCities: number = 8;
const populationSize: number = 1500;
const mutationRate = 0.09;
const canvasDimention = 600; // pixels
const maxGenerations = 250;

// https://p5js.org/reference/#/p5/mouseX
// https://p5js.org/reference/#/p5.Element/mouseClicked for inputting cities

// Generate initial population
const population = new Population(totalCities, mutationRate, populationSize, canvasDimention);

// Brute force implementation for comparison
const bruteForceSolution = bruteForceTSP(population.cities);
writeToElem('bruteBest', bruteForceSolution + 'px');

const start = new Date();

// Simulated annealing solution for comparison
//const annealingSolution = annealTSP(population.cities);

// Initial generation
population.getAllFitnessValues();
//population.normalizeFitnessValues();

let bestDistance = Number.MAX_SAFE_INTEGER;
let bestFitness = 0;

let bestEverMember: Member = new Member(totalCities);

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
        p5.background('white');
        p5.textFont('Arial');
        p5.textSize(16);
        p5.textStyle();
        //p5.frameRate(2);
        p5.noLoop();
    };

    const drawMember = (member: Member) => {
        p5.background(0);
        const routeCities = member.genes.map((hexId) => population.citiesGraph.xyLookup[hexId]);
        // Draw route line
        p5.fill(0, 0, 0, 0);
        p5.strokeWeight(2);
        p5.beginShape();
        for (const city of routeCities) {
            p5.vertex(city.x, city.y);
        }
        p5.endShape();
        drawCityNumbers();
    };

    const drawCityNumbers = () => {
        // Draw city dots
        p5.fill('white');
        p5.stroke('white');
        for (let i = 0; i < population.cities.length; i++) {
            const city = population.cities[i];
            p5.ellipse(city.x, city.y, 30, 30);
        }

        // Draw city order numbers
        p5.fill('green');
        p5.stroke('green');
        /* for (let i = 0; i < member.genes.length; i++) {
            const index = member.genes[i];
            const city = population.cities[index];
            p5.text(i, city.x - 5, city.y + 5);
        } */
        for (let i = 0; i < population.cities.length; i++) {
            const city = population.cities[i];
            const cityHexId = i.toString(16);
            p5.text(cityHexId, city.x - 5, city.y + 5);
            /*  p5.fill('white');
            p5.text(`${city.x}, ${city.y}`, city.x - 5, city.y + 30); */
        }
    };

    const drawLine = (member: Member) => {
        p5.beginShape();
        p5.fill(0, 0, 0, 0);
        const routeCities = member.genes.map((hexId) => population.citiesGraph.xyLookup[hexId]);
        for (const city of routeCities) {
            p5.vertex(city.x, city.y);
        }
        p5.endShape();
    };

    // The sketch draw method
    p5.draw = () => {
        population.newGeneration();
        population.getAllFitnessValues();
        //population.normalizeFitnessValues();

        // Get most fit member & check if finished
        const bestMemberOfGeneration = population.getMostFitMember();
        if (bestMemberOfGeneration.distance < bestDistance) {
            bestDistance = bestMemberOfGeneration.distance;
        }
        if (bestMemberOfGeneration.fitness > bestFitness) {
            bestFitness = bestMemberOfGeneration.fitness;
            bestEverMember = bestMemberOfGeneration;
        }

        writeToElem('bestDistance', bestMemberOfGeneration.distance + '');
        writeToElem('generations', population.generations + '');

        p5.stroke(255);
        drawMember(bestMemberOfGeneration);

        //console.log('Best Distance, Fitness', bestDistance, bestFitness);
        if (population.generations === maxGenerations) {
            const end = new Date();
            const elapsed = end.getTime() - start.getTime();
            console.log('seconds elapsed', elapsed / 1000);

            p5.stroke('green');
            drawMember(bestEverMember);
            console.log('genetic best route', bestEverMember.genes);
            //calcTotalDistance(bestEverMember.genes, population.cities);
            console.log('genetic algorithm best', bestEverMember.distance);

            /* if (bruteForceSolution) {
                p5.stroke('red');
                drawLine(bruteForceSolution);
            } 
            drawCityNumbers(); */

            p5.noLoop();

            writeToElem('bestDistance', bestEverMember.distance + '');
            writeToElem('bestFitness', bestEverMember.fitness + '');
        }
    };
};

function writeToElem(id: string, txt: string) {
    const elem = document.getElementById(id);
    if (elem !== null) elem.innerHTML = txt;
}

const sketch = new P5(sketchSetup);

(window as any).run = function () {
    sketch.loop();
};

//testInputs();
