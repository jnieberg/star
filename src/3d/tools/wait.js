import { MISC } from '../../variables';

export default function wait(
  timerBank,
  // callback = () => {},
  interrupt = false
) {
  return new Promise((resolve) => {
    if (interrupt && MISC.timers[timerBank]) {
      // console.log('TIMEOUT INTERRUPT');
      for (let i = 0; i < MISC.timers[timerBank].length; i += 1) {
        clearTimeout(MISC.timers[timerBank][i]);
      }
      MISC.timers[timerBank] = [];
    }
    if (!MISC.timers[timerBank]) {
      MISC.timers[timerBank] = [];
    }
    ((index) => {
      const timer = setTimeout(() => {
        MISC.timers[timerBank].splice(index, 1);
        resolve();
      });
      MISC.timers[timerBank].push(timer);
    })(MISC.timers[timerBank].length - 1);
  });
}

// export class Queue {
//   constructor() {
//     this.functions = [];
//     this.executing = false;
//   }

//   add(self, fn, props, resolve) {
//     this.functions.push({ self, fn, props, resolve });
//   }

//   check() {
//     // return new Promise((mainResolve) => {
//     if (!this.executing && this.functions.length > 0) {
//       this.executing = true;
//       const { self, fn, props, resolve } = this.functions.shift();
//       console.log(self[fn](...props), this.functions.length);
//       self[fn](...props).then(() => {
//         console.log(this.functions.length);
//         this.executing = false;
//         resolve();
//       });
//       // } else {
//       //   this.executing = false;
//       // }
//     }
//     // });
//   }
// }
