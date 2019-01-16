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
const resetBtn = document.getElementsByClassName('reset')[0];
const checkbox = document.getElementById('mode');
const superModeToggle = document.getElementById('super');

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
    this.perspective = 1000;
    this.x = 0;
    this.y = 0;

    this.drawPicture(pic);

    this.picture = document.getElementById(pic.id);

    this.deviceMotion = this.deviceMotion.bind(this);
    this.parallax = this.parallax.bind(this);
    this.tiltPicture = this.tiltPicture.bind(this);
    this.parallaxAndTilt = this.parallaxAndTilt.bind(this);
    this.setMode = this.setMode.bind(this);
    this.onSuperModeToggle = this.onSuperModeToggle.bind(this);
    this.reset = this.reset.bind(this);

    superModeToggle.checked
      ? this.setMode({ super: 'on' })
      : this.setMode({ target: { checked: checkbox.checked } });

    // Mode change
    checkbox.addEventListener('change', this.setMode);

    // Super mode toggle
    superModeToggle.addEventListener('change', this.onSuperModeToggle);

    // Reset button handler
    resetBtn.addEventListener('click', this.reset);
  }

  onSuperModeToggle(e) {
    if (e.target.checked) {
      checkbox.disabled = true;
      this.setMode({ super: 'on' });
    }
    else {
      checkbox.disabled = false;
      this.setMode({ super: 'off' });
    }
  }

  parallaxAndTilt(e) {
    const { clientX, clientY } = e;
    const factor = 75; // more = slower
    const multiplier = 15;

    if (!this.x && !this.y) {
      this.x = clientX;
      this.y = clientY;
      return;
    }

    this.figures.forEach(fig => {
      const { xPos, yPos } = this.findCoordinates(fig, e, factor);
      const zIndex = Math.ceil(fig.speed / 2);
      fig.el.style.transform = `translate3d(${xPos}px, ${yPos}px, ${50 + zIndex}px)`;
    });

    const [cx, cy] = this.findCenterCoordinates();

    const xRot = -(cy - clientY) / multiplier;
    const yRot = (cx - clientX) / multiplier;

    this.picture.style.transform = `perspective(1000px) rotateX(${xRot}deg) rotateY(${yRot}deg)`;
  }

  setMode(e) {
    if (e.super === 'on') {
      if (checkbox.checked) {
        this.picture.removeEventListener('mousemove', this.tiltPicture);
      }
      else {
        this.picture.classList.add('tilt');
        window.removeEventListener('mousemove', this.parallax);
      }
      this.picture.addEventListener('mousemove', this.parallaxAndTilt);
    }
    else if (e.super === 'off') {
      if (checkbox.checked) {
        window.removeEventListener('mousemove', this.parallax);
        this.picture.addEventListener('mousemove', this.tiltPicture, { passive: true });
      }
      else {
        this.picture.classList.remove('tilt');
        this.picture.removeEventListener('mousemove', this.tiltPicture);
        window.addEventListener('mousemove', this.parallax);
      }
      this.picture.removeEventListener('mousemove', this.parallaxAndTilt);
    }
    else if (e.target.checked) {
      this.picture.classList.add('tilt');

      window.removeEventListener('mousemove', this.parallax);
      this.picture.addEventListener('mousemove', this.tiltPicture, { passive: true });
    }
    else {
      this.picture.classList.remove('tilt');

      this.picture.removeEventListener('mousemove', this.tiltPicture);
      window.addEventListener('mousemove', this.parallax, { passive: true });

      if (window.DeviceMotionEvent) window.addEventListener('devicemotion', this.deviceMotion, { passive: true });
    }
  }

  deviceMotion(e) {
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
            `<div class="fig${index} figure"></div>`
          ))}
        </div>
      </li>
    `;

    pic.figures.forEach((fig, index) => {
      const el = document.getElementsByClassName(`fig${index}`)[0];

      this.figures[index] = {
        el,
        speed: fig.speed,
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

  findCenterCoordinates() {
    let cx = this.picture.offsetLeft + this.picture.offsetWidth / 2;
    let cy = this.picture.offsetTop + this.picture.offsetHeight / 2;
    return [cx, cy];
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

    const multiplier = 15;

    const [cx, cy] = this.findCenterCoordinates();

    const xRot = -(cy - clientY) / multiplier;
    const yRot = (cx - clientX) / multiplier;

    this.figures.forEach(fig => {
      fig.el.style.transform = `translateZ(${fig.speed * 3}px)`;
    });

    this.picture.style.transform = `
      perspective(${this.perspective}px) rotateX(${xRot}deg) rotateY(${yRot}deg)
    `;
  }

  reset() {
    this.picture.style.transform =
      this.picture.style.transform.indexOf('scale(0.7)') !== 1
        ? `perspective(${this.perspective}px) scale(0.7)`
        : `perspective(${this.perspective}px)`;
    this.figures.forEach(fig => fig.el.style.transform = 'null');
    this.x = this.y = 0;
  }
}

// Default init with first picture
new Picture(pictureList[0]);
