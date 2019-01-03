function outerHeight(el) {
  let height = el.offsetHeight;
  let style = getComputedStyle(el);

  height += parseInt(style.marginTop) + parseInt(style.marginBottom);
  return height;
}

function resize() {
  const newHeight = window.innerHeight - cvs.offsetTop - Math.abs(outerHeight(cvs) - cvs.offsetHeight);
  // console.log(window.innerHeight, cvs.offsetTop, Math.abs(outerHeight(cvs) - cvs.offsetHeight), newHeight);
  cvs.outerHeight = newHeight;
}

const errorContainer = document.getElementById('error');
const cvs = document.getElementById('cvs');

window.addEventListener('resize', () => {
  resize();
}, { passive: true });

class Picture {
  constructor(picture) {
    this.ctx = cvs.getContext('2d');
    this.figures = [];
    this.x = null;
    this.y = null;
    this.beta = null;
    this.alpha = null;
    this.xPoint = document.getElementById('xPoint');
    this.yPoint = document.getElementById('yPoint');

    cvs.style.backgroundColor = picture.backgorundColor;
    cvs.width = picture.width;
    cvs.height = picture.height;

    resize();

    if (picture.rectangles) {
      this.drawRectangles(picture.rectangles);
    }

    // event listener
    document.addEventListener('mousemove', (e) => {
      this.moveObjects(e);
    }, { passive: true });

      if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', (e) => {
          // const x = e.accelerationIncludingGravity.x.toPrecision(3);
          // const y = e.accelerationIncludingGravity.y.toPrecision(3);

          const x = e.acceleration.x.toPrecision(3);
          const y = e.acceleration.y.toPrecision(3);

          const beta = e.rotationRate.beta.toPrecision(2)
          const alpha = e.rotationRate.alpha.toPrecision(2);

          if (!this.beta && !this.alpha) {
            this.beta = beta;
            this.alpha = alpha;
            return;
          }

          const acc = 2;

          const xDiff = Math.abs(this.beta - beta).toPrecision(2);
          const yDiff = Math.abs(this.alpha - alpha).toPrecision(2)

          this.xPoint.innerHTML = beta;
          this.yPoint.innerHTML = alpha;

          // if (xDiff < acc || yDiff < acc) return;

          const clientX = beta;
          const clientY = alpha;

          this.moveObjects({
            clientX,
            clientY,
            gyro: true,
          });
        }, { passive: true });
      }
  }

  drawRectangles(rectangles) {
    rectangles.forEach(rect => {
      this.figures.push(rect);
      this.drawRectangle(rect);
    });
  }

  drawRectangle(rect) {
    this.ctx.fillStyle = rect.fillColor;

    if (rect.rotate) {
      this.ctx.save();
      this.ctx.translate(rect.x + rect.width / 2, rect.y + rect.height / 2);
      this.ctx.rotate(rect.rotate * Math.PI / 180);
      this.ctx.fillRect(-rect.width / 2, -rect.height / 2, rect.width, rect.height);
      this.ctx.restore();
    }
    else this.ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  }

  moveObjects(e) {
    if (!this.x && !this.y) {
      this.x = e.clientX;
      this.y = e.clientY;
      return;
    }

    const factor = e.gyro ? 15 : 100;

    if (e.gyro) {
      this.figures = this.figures.map(figure => ({
        x: figure.x + (this.beta - e.clientX) * figure.speed / factor,
        y: figure.y + (this.alpha - e.clientY) * figure.speed / factor,
        width: figure.width,
        height: figure.height,
        fillColor: figure.fillColor,
        rotate: figure.rotate ? figure.rotate : null,
        speed: figure.speed,
      }));

      this.beta = e.clientX;
      this.alpha = e.clientY;
    }
    else {
      this.figures = this.figures.map(figure => ({
        x: figure.x + (this.x - e.clientX) * figure.speed / factor,
        y: figure.y + (this.y - e.clientY) * figure.speed / factor,
        width: figure.width,
        height: figure.height,
        fillColor: figure.fillColor,
        rotate: figure.rotate ? figure.rotate : null,
        speed: figure.speed,
      }));

      this.x = e.clientX;
      this.y = e.clientY;
    }

    requestAnimationFrame(() => this.redraw());
  }

  redraw() {
    this.ctx.clearRect(0, 0, cvs.width, cvs.height);

    this.figures.forEach(rect => this.drawRectangle(rect));
  }
}

const pictures = [
  {
    width: 1243,
    height: 2000,
    // width: 600,
    // height: 660,
    backgorundColor: '#d2cec2',
    rectangles: [
      {
        x: 380,
        y: 400,
        width: 350,
        height: 350,
        fillColor: '#242424',
        rotate: null,
        speed: 10,
      },
      {
        x: 630,
        y: 830,
        width: 200,
        height: 200,
        fillColor: '#a73a39',
        rotate: '-15',
        speed: 20,
      },
    ],
  },
]


if (cvs.getContext) {
  new Picture(pictures[0]);
}
else {
  errorContainer.innerHTML = 'Your browser does not support canvas';
}
