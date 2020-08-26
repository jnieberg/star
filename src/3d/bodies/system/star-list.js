import { TD } from '../../../variables';
import System from './System';
import Random from '../../../misc/Random';
import deleteThree from '../../tools/delete';

function deleteStarsOutsideRange({ coordx, coordy, coordz }) {
  Object.keys(TD.stars).forEach((s) => {
  // for (let si = 0; si < Object.keys(TD.stars).length; si += 1) {
    const star = TD.stars[s];
    if (star) {
      const coord = s.split('_').map((c) => Number(c));
      if (
        coord[0] < coordx - TD.stargrid.radius || coord[0] > coordx + TD.stargrid.radius
        || coord[1] < coordy - TD.stargrid.radius || coord[1] > coordy + TD.stargrid.radius
        || coord[2] < coordz - TD.stargrid.radius || coord[2] > coordz + TD.stargrid.radius
      ) {
        deleteThree(star.object);
        delete TD.stars[s];
      }
    }
  });
}

export default function starList({ coordx, coordy, coordz }, callback) {
  const random = new Random('stars');
  let count = (TD.stargrid.radius * 2 + 1) ** 3;
  const content = TD.stargrid.size * TD.stargrid.size * TD.stargrid.size;
  for (let z = coordz - TD.stargrid.radius; z <= coordz + TD.stargrid.radius; z += 1) {
    for (let y = coordy - TD.stargrid.radius; y <= coordy + TD.stargrid.radius; y += 1) {
      for (let x = coordx - TD.stargrid.radius; x <= coordx + TD.stargrid.radius; x += 1) {
        // eslint-disable-next-line no-loop-func
        setTimeout(() => {
          const coordString = `${x}_${y}_${z}`;
          if (!TD.stars[coordString]) {
            TD.stars[coordString] = {
              x,
              y,
              z,
              this: [],
              positions: [],
              colors: [],
              sizes: [],
            };
            random.seed = coordString;
            const quantity = random.rndInt(
              TD.stargrid.density * content,
              TD.stargrid.density * content * 2,
            );
            for (let index = 0; index < quantity; index += 1) {
              // eslint-disable-next-line no-unused-vars
              const _ = new System({
                x, y, z, index,
              }).children;
            }
          }
          if (count <= 0) {
            deleteStarsOutsideRange({ coordx, coordy, coordz });
            callback();
          }
        });
        count -= 1;
      }
    }
  }
}
