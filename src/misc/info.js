//           a          i     b
// 0   0.1  0.2        0.6   0.7
// |    |    |    0.4   . 0.1 |
//          0.5         ?    0.9
// colLast(a): 0.2
// index(i): 0.6
// col(b): 0.7
// diff(b - a): 0.5, 0.4
// fraction((i - a) / diff): 0.8
// result(?): diff + ((0.9 - 0.5) * fraction)
export default function getInfo(key, index) {
  if (key && key.length > 0) {
    index = Math.max(0.0, Math.min(index, 1.0));
    for (let i = 0; i < key.length; i += 1) {
      const col = key[i];
      if (col[0] >= index) {
        const colLast = i > 0 ? key[i - 1] : key[i];
        const diff = col[0] - colLast[0];
        const fraction = (index - colLast[0]) / diff;
        const result = {};
        Object.keys(colLast[1]).forEach((c) => {
          const valLast = colLast[1][c];
          const val = col[1][c];
          if (typeof val === 'string') {
            if (fraction < 0.5) result[c] = valLast;
            else result[c] = val;
          } else {
            result[c] = valLast + (val - valLast) * fraction;
          }
          return undefined;
        });
        return { index, ...result };
      }
    }
  }
  return undefined;
}
