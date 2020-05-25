import seedrandom from "seedrandom";
import { getPlanetInfo } from "./planets";
import { toCelcius } from "../../misc/temperature";
import getName from "../../name-generator/name";
import { TD } from "../../variables";
import * as THREE from "three";
import { deleteThree } from "../init/init";

function getStarSize(star) {
    let size = 'Hypergiant';
    if (star.size < 1) {
        size = 'Dwarf';
    } else if (star.size < 3) {
        size = 'Star';
    } else if (star.size < 4) {
        size = 'Giant';
    } else if (star.size < 4.5) {
        size = 'Supergiant';
    }

    return size;
}

function getStarColor(star) {
    let color = 'Red';
    if (star.brightness > 0.95) {
        return 'White';
    }
    if (star.hue < 0.05) {
    } else if (star.hue < 0.15) {
        color = 'Orange'
    } else if (star.hue < 0.2) {
        color = 'Yellow'
    } else if (star.hue < 0.5) {
        color = 'Green'
    } else if (star.hue < 0.7) {
        color = 'Blue'
    } else if (star.hue < 0.9) {
        color = 'Purple'
    }
    return color;
}

function getStarPlanets(star) {
    var rnd = seedrandom(`star_planets_${star.id}`);
    var planetLength = Math.floor(rnd() * star.size * 4); // number of planets depends on star size
    var planets = [];
    for (var p = 0; p < planetLength; p++) {
        planets.push(getPlanetInfo(star, p));
    }
    return planets;
}

function getStarPlanetsString(star) {
    var planets = getStarPlanets(star);
    var planetsString = [];
    for (var p = 0; p < planets.length; p++) {
        planetsString.push(`  ${planets[p].id}. ${planets[p].name} / ${toCelcius(planets[p].temperature.min)} ${toCelcius(planets[p].temperature.max)}`);
    }
    return planetsString;
}

export function getStarName(star) {
    return getName(`star_${star.id}`, 3, 3, 999);
}

export function getStarTemperature(star) {
    var rnd = seedrandom(`star_temperarure_${star.id}`);
    var tempMin = 0;
    var tempMax = 0;
    switch (getStarColor(star)) {
        case 'Red': tempMin = 500; tempMax = 3700; break;
        case 'Orange': tempMin = 3700; tempMax = 5200; break;
        case 'Yellow': tempMin = 5200; tempMax = 6000; break;
        case 'White': tempMin = 6000; tempMax = 7500; break;
        case 'Green': tempMin = 7500; tempMax = 10000; break;
        case 'Blue': tempMin = 10000; tempMax = 30000; break;
        case 'Purple': tempMin = 30000; tempMax = 40000; break;
    }
    return Math.floor(rnd() * (tempMax - tempMin)) + tempMin;
}

export function getStarInfoString(star) {
    var planets = getStarPlanets(star).length ? ['Planets:', ...getStarPlanetsString(star)] : [];
    return [
        getStarName(star),
        getStarColor(star) + ' ' + getStarSize(star),
        'Temperature: ' + toCelcius(getStarTemperature(star)),
        ...planets
    ];
}

export default function drawStar() {
    var star = TD.star.this;
    if (star) {
        deleteThree(TD.star.object);
        TD.star.geometry = new THREE.SphereGeometry(star.size * 0.01, 32, 32);
        TD.colorHelper.setHSL(star.hue, 1.0, star.brightness);
        TD.star.material = new THREE.MeshBasicMaterial({ color: TD.colorHelper });
        TD.star.object = new THREE.Mesh(TD.star.geometry, TD.star.material);
        TD.star.flare.material = new THREE.SpriteMaterial({
            map: TD.stars.texture,
            color: TD.colorHelper,
            depthTest: false,
            blending: THREE.AdditiveBlending,
            transparent: true
        })
        TD.star.flare.sprite = new THREE.Sprite(TD.star.flare.material);
        TD.star.flare.sprite.scale.set(star.size * 0.1, star.size * 0.1, star.size * 0.1);
        TD.star.object.add(TD.star.flare.sprite);
        TD.star.object.position.set(star.x * 100, star.y * 100, star.z * 100);
        TD.scene.add(TD.star.object);
    }
}