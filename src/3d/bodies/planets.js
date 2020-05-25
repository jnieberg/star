import seedrandom from "seedrandom";
import getName from "../../name-generator/name";
import { getStarTemperature } from "./star";

function getPlanetName(star, index) {
    return getName(`planet_${star.id}_${index}`, 2, 2);
}

function getPlanetTemperature(star, index) {
    var rnd = seedrandom(`planet_temperature_${star.id}_${index}`);
    var starTemp = getStarTemperature(star);
    var temp = [
        Math.floor(starTemp / ((rnd() * (index + 3) + (index + 2)) * 3)),
        Math.floor(starTemp / ((rnd() * (index + 3) + (index + 2)) * 3))
    ];
    temp = temp.sort((a, b) => a > b ? 1 : -1);
    return {
        min: temp[0], max: temp[1]
    }
}

export function getPlanetInfo(star, index) {
    return {
        id: index + 1,
        name: getPlanetName(star, index),
        temperature: getPlanetTemperature(star, index)
    }
}