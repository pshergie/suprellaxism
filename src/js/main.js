const pictureList = [
  {
    id: 'id0',
    author: 'Kazimir Malevich',
    date: '1915',
    description: 'Red square and black square',
    figures: [
      {
        name: 'fig0',
        speed: 10,
      },
      {
        name: 'fig1',
        speed: 20,
        rotate: '-12',
      },
    ],
  }
];

const picturesContainer = document.getElementsByClassName('pictures')[0];

picturesContainer.addEventListener('click', (e) => {
  if (e.target.className === 'picture') {
    console.log(e.target);
    // new Picture();
  }
});

class Picture {
  constructor(pic) {
    this.canvas = document.getElementsByClassName('pictures')[0];
    this.figures = new Array(pic.figures.length);
    this.x = 0;
    this.y = 0;

    this.drawPicture(pic);

    // event listener
    window.addEventListener('mousemove', (e) => {
      requestAnimationFrame(() =>this.moveObjects(e));
    }, { passive: true });

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
          gyro: true,
        }));
      }, { passive: true });
    }
  }

  drawPicture(pic) {
    this.canvas.innerHTML = `
      <li class="pictureContainer">
        <div class="description">
          <p class="name">«${pic.description}»</p>
          <p class="author">${pic.author}, ${pic.date}</p>
        </div>
        <div id="${pic.id}" class="picture">
          ${pic.figures.map((fig, index) => (
            `<div
              class="fig${index} figure"
              data-speed="${fig.speed}"
              data-rotate="${fig.rotate ? fig.rotate : ''}"></div>`
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

  moveObjects(e) {
    const factor = e.gyro ? 700 : 300; // more = slower

    let xPos, yPos;

    if (e.gyro) {
      this.figures.forEach(fig => {
        xPos = -e.clientX * fig.speed / factor;
        yPos = -e.clientY * fig.speed / factor;
      });
    }
    else {
      if (!this.x && !this.y) {
        this.x = e.clientX;
        this.y = e.clientY;
        return;
      }

      this.figures.forEach(fig => {
        xPos = (this.x - e.clientX) * fig.speed / factor;
        yPos = (this.y - e.clientY) * fig.speed / factor;
      });
    }

    fig.el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0) rotate(${fig.rotate || 0}deg)`;
  }
}

new Picture(pictureList[0]);
