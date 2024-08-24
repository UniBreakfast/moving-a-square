const square = document.getElementById('square');

window.onkeydown = handleMove;

const size = 50;
let speed = 300;
let x = 3, y = 3;
const route = [];
let running = false;

square.style.setProperty('--size', size + 'px');
square.style.translate = `${x * 100}% ${y * 100}%`;

run();

async function run() {
  if (running) return;

  running = true;

  while (route.length) {
    const direction = route.shift();

    updateSpeed();
    
    square.style.setProperty('--speed', speed + 'ms');

    if (!canMove(direction)) continue;

    await move(direction);
    await skipFrames(1);
  }

  running = false;
}

function updateSpeed() {
  speed = 600 * Math.max(1 - route.length / 10, 0.05);
}

function canMove(direction) {
  return direction === 'right' && x < (innerWidth - 16) / size - 2
    || direction === 'left' && x > 0
    || direction === 'down' && y < (innerHeight - 16) / size - 2
    || direction === 'up' && y > 0;
}

async function skipFrames(n) {
  if (n > 1) await skipFrames(n - 1);

  return new Promise(requestAnimationFrame);
}

function handleMove(e) {
  const { key } = e;

  try {
    const [, direction] = key.match(/Arrow(.*)/);

    if (direction) {
      route.push(direction.toLowerCase());

      if (!running) run();
    }
  } catch { }
}

async function move(direction) {
  await ready(direction);
  await go(direction);
}

function ready(direction) {
  return new Promise(resolve => {
    square.classList.add(direction + 0);
    requestAnimationFrame(resolve);
  });
}

function go(direction) {
  return new Promise(resolve => {
    square.classList.add('transit', direction + 1);

    square.ontransitionend = async () => {
      square.ontransitionend = null;

      if (['right', 'left'].includes(direction)) {
        direction === 'right' ? ++x : --x;
        square.classList.remove('transit', direction + 0, direction + 1);
        square.style.translate = `${x * 100}% ${y * 100}%`;
        resolve();

      } else {
        direction === 'down' ? ++y : --y;
        square.classList.remove('transit');
        square.classList.toggle('down0');
        square.classList.toggle('up0');
        square.style.translate = `${x * 100}% ${y * 100}%`;

        await skipFrames(2);

        square.classList.add('transit');
        square.classList.remove(direction + 1);

        square.ontransitionend = () => {
          square.classList.remove('transit', 'down0', 'up0');
          resolve();
        }
      }
    }
  });
}
