import { Population } from './population';

const population: Population = new Population();

population.init();

console.log(population.members);
population.addMember(3);
population.addMember(5);
console.log(population.members);
