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

// window.addEventListener('resize', () => {
//   resize();
// }, { passive: true });

// resize();

class Picture {
  constructor(picture) {
    this.ctx = cvs.getContext('2d');
    this.figures = [];
    this.x = null;
    this.y = null;

    cvs.style.backgroundColor = picture.backgorundColor;
    cvs.width = picture.width;
    cvs.height = picture.height;

    if (picture.rectangles) {
      this.drawRectangles(picture.rectangles);
    }

    // event listener
    window.addEventListener('mousemove', (e) => {
      this.moveObjects(e);
    }, { passive: true });
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
      this.x = e.offsetX;
      this.y = e.offsetY;
      return;
    }

    this.figures = this.figures.map(figure => ({
      x: figure.x + (this.x - e.offsetX) * figure.speed / 100,
      y: figure.y + (this.y - e.offsetY) * figure.speed / 100,
      width: figure.width,
      height: figure.height,
      fillColor: figure.fillColor,
      rotate: figure.rotate ? figure.rotate : null,
      speed: figure.speed,
    }));

    this.x = e.offsetX;
    this.y = e.offsetY;

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
        speed: 10,
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
