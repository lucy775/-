(function () {
  /** 生成随机数 */
  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /** 一维坐标转二维 */
  const xTo2D = (index) => index % 10;
  const yTo2D = (index) => Math.floor(index / 10);

  const playgroundEl = document.querySelector('.playground');

  class Grid {
    x = 0;
    y = 0;
    checked = false;
    plane = false;
    bullsEye = false;
    locked = false;
    el;

    onCheck = () => {};
    onPlane = () => {};
    onBullsEye = () => {};

    constructor(x, y) {
      this.x = x;
      this.y = y;

      this.el = document.createElement('div');

      playgroundEl.append(this.el);

      this.el.onclick = () => {
        if (this.checked || this.locked) {
          return;
        }

        this.check();

        this.onCheck();
      };
    }

    check() {
      this.el.classList.add('checked');
      this.checked = true;

      if (this.plane) {
        this.el.classList.add('plane');
        this.onPlane();
      }

      if (this.bullsEye) {
        this.onBullsEye();
      }
    }

    dispose() {
      this.el.remove();
    }
  }

  class Game {
    grids = [];
    hits = 0;
    steps = 0;
    completed = false;

    stepsEl = document.querySelector('.board span');

    constructor() {
      this.stepsEl.innerHTML = '0';

      const plane = this.randomPlane();

      this.grids = new Array(100).fill(null).map((g, i) => {
        const x = xTo2D(i);
        const y = yTo2D(i);

        const grid = new Grid(x, y);

        // 标记机身
        if (plane.points.some(([px, py]) => px === x && py === y)) {
          grid.plane = true;
        }

        // 标记飞机中心点
        if (x === plane.bx && y === plane.by) {
          grid.bullsEye = true;
        }

        grid.onCheck = () => {
          this.steps++;
          this.stepsEl.innerHTML = this.steps;
        };

        // 命中飞机
        grid.onPlane = () => {
          this.hits++;

          if (this.hits > 2) {
            this.gameOver();
          }
        };

        // 命中飞机中心
        grid.onBullsEye = () => {
          this.gameOver();
        };

        return grid;
      });
    }

    /** 获取随机飞机坐标集合 */
    randomPlane() {
      // 中心点
      const bx = getRandomInt(2, 7);
      const by = getRandomInt(1, 7);

      // 机身坐标群
      const points = [
        [bx, by],
        [bx, by - 1],
        [bx - 1, by],
        [bx - 2, by],
        [bx + 1, by],
        [bx + 2, by],
        [bx, by + 1],
        [bx, by + 2],
        [bx - 1, by + 2],
        [bx + 1, by + 2],
      ];

      return { bx, by, points };
    }

    gameOver() {
      this.grids.forEach((g) => {
        if (g.plane && !g.checked) {
          g.check();
        }

        g.locked = true;
      });

      this.completed = true;
    }

    /** 垃圾回收当前游戏对象 */
    dispose() {
      this.grids.forEach((g) => g.dispose());
    }
  }

  let game = new Game();

  document.querySelector('button').onclick = () => {
    game.dispose();
    game = new Game();
  };
})();
