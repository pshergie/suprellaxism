const pictureList = [
  {
    id: 'id0',
    author: 'Kazimir Malevich',
    date: '1915',
    description: 'Red square and black square',
    figures: [
      { speed: 10 },
      { speed: 20 },
    ],
  },
  {
    id: 'id1',
    author: 'Nadezhda Udaltsova',
    date: '1916',
    description: 'Unnamed',
    figures: [
      { speed: 10 },
      { speed: 25 },
      { speed: 25 },
      { speed: 15 },
      { speed: 10 },
    ],
  },
];

const gallery = document.getElementsByClassName('gallery')[0];
const canvas = document.getElementsByClassName('pictures')[0];
const checkbox = document.getElementById('mode');

gallery.addEventListener('click', (e) => {
  if (e.target.parentElement.className === 'previewContainer') {
    const index = parseInt(e.target.parentElement.id, 10);
    const picturesContainer = document.getElementsByClassName('pictureContainer')[0];
    const { offsetTop } = picturesContainer;

    new Picture(pictureList[index]);
    window.scrollTo(0, offsetTop);
  }
});

class Picture {
  constructor(pic) {
    this.figures = new Array(pic.figures.length);
    this.x = 0;
    this.y = 0;

    this.drawPicture(pic);

    this.picture = document.getElementById(pic.id);

    this.parallax = this.parallax.bind(this);
    this.tiltPicture = this.tiltPicture.bind(this);

    // event listener
    window.addEventListener('mousemove', this.parallax, { passive: true });

    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', (e) => {
        const beta = e.rotationRate.beta.toPrecision(2)
        const alpha = e.rotationRate.alpha.toPrecision(2);

        this.x += parseFloat(beta);
        this.y += parseFloat(alpha);

        const clientX = this.x;
        const clientY = this.y;

        requestAnimationFrame(() => this.moveObjects({
          clientX,
          clientY,
          isGyro: true,
        }));
      }, { passive: true });
    }

    // Mode change
    checkbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        this.picture.style.overflow = 'visible';
        window.removeEventListener('mousemove', this.parallax);
        this.picture.addEventListener('mousemove', this.tiltPicture, { passive: true });
      } else {
        this.picture.style.overflow = 'hidden';
        this.picture.removeEventListener('mousemove', this.tiltPicture);
        window.addEventListener('mousemove', this.parallax, { passive: true });
      }
    })
  }

  drawPicture(pic) {
    canvas.innerHTML = `
      <li class="pictureContainer">
        <div class="description">
          <p class="name">«${pic.description}»</p>
          <p class="author">${pic.author}, ${pic.date}</p>
        </div>
        <div id="${pic.id}" class="picture">
          ${pic.figures.map((fig, index) => (
            `<div
              class="fig${index} figure"
              data-speed="${fig.speed}"></div>`
          ))}
        </div>
      </li>
    `;

    pic.figures.forEach((fig, index) => {
      const el = document.getElementsByClassName(`fig${index}`)[0];

      this.figures[index] = {
        el,
        speed: el.dataset.speed,
        rotate: el.dataset.rotate,
      }
    })
  }

  findCoordinates(figure, e, factor) {
    return {
      xPos: e.isGyro
        ? -e.clientX * figure.speed / factor
        : (this.x - e.clientX) * figure.speed / factor,
      yPos: e.isGyro
        ? -e.clientY * figure.speed / factor
        : (this.y - e.clientY) * figure.speed / factor,
    }
  }

  parallax(e) {
    requestAnimationFrame(() => this.moveObjects(e));
  }

  moveObjects(e) {
    const factor = e.isGyro ? 800 : 300; // more = slower

    if (!e.isGyro && !this.x && !this.y) {
      this.x = e.clientX;
      this.y = e.clientY;
      return;
    }

    this.figures.forEach(fig => {
      const { xPos, yPos } = this.findCoordinates(fig, e, factor);
      fig.el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    });
  }

  tiltPicture(e) {
    const { clientX, clientY } = e;

    if (!this.x && !this.y) {
      this.x = clientX;
      this.y = clientY;
      return;
    }

    const multiplier = 15;

    const xRot = (this.y - clientY) / multiplier;
    const yRot = (this.x - clientX) / multiplier;

    this.picture.style.transform = `perspective(1000px) rotateX(${-xRot}deg) rotateY(${-yRot}deg)`;
  }
}

// Default init with first picture
new Picture(pictureList[0]);
