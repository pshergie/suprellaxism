const pictureList = [
  {
    id: 'id0',
    author: 'Kazimir Malevich',
    date: '1915',
    name: 'Red square and black square',
    figures: [
      { speed: 10 }, { speed: 20 },
    ],
  },
  {
    id: 'id1',
    author: 'Nadezhda Udaltsova',
    date: '1916',
    name: 'Unnamed',
    figures: [
      { speed: 10 }, { speed: 25 }, { speed: 25 }, { speed: 15 }, { speed: 10 },
    ],
  },
  {
    id: 'id2',
    author: 'Nikolai Suetin',
    date: '1915',
    name: 'Suprematism',
    figures: [
      { speed: 10 }, { speed: 15 }, { speed: 20 }, { speed: 25 }, { speed: 30 },
      { speed: 20 }, { speed: 25 }, { speed: 30 }, { speed: 10 }, { speed: 15 },
      { speed: 20 }, { speed: 20 }, { speed: 10 }, { speed: 30 }, { speed: 25 },
    ]
  },
  {
    id: 'id3',
    author: 'El Lissitzky',
    date: '1924',
    name: 'Kestnermappe Proun, Rob. Levnis and Chapman GmbH Hannover #5',
    figures: [
      { speed: 10 }, { speed: 35 }, { speed: 30 }, { speed: 25 },
      { speed: 20 }, { speed: 25 }, { speed: 30 }, { speed: 30 },
      { speed: 35 }, { speed: 45 }, { speed: 30 }, { speed: 35 },
    ]
  }
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
    window.scrollTo(0, offsetTop - 22);
  }
});

class Picture {
  constructor(pic) {
    this.figures = new Array(pic.figures.length);
    this.perspective = 1000;
    this.maxTilt = { beta: 3000, alpha: 3000 };
    this.x = 0;
    this.y = 0;

    this.drawPicture(pic);

    this.picture = document.getElementById(pic.id);

    this.deviceParallax = this.deviceParallax.bind(this);
    this.deviceTilt = this.deviceTilt.bind(this);
    this.deviceParallaxAndTilt = this.deviceParallaxAndTilt.bind(this);
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

  setMode(e) {
    if (e.super === 'on') {
      if (checkbox.checked) {
        this.picture.removeEventListener('mousemove', this.tiltPicture);
      }
      else {
        this.picture.classList.add('tilt');
        window.removeEventListener('mousemove', this.parallax);
      }

      this.picture.addEventListener('mousemove', this.parallaxAndTilt, { passive: true });

      if (window.DeviceMotionEvent) {
        if (typeof DeviceMotionEvent.requestPermission === 'function') {
          DeviceMotionEvent.requestPermission().then((permissionState) => {
            if (permissionState === 'granted') {
              window.addEventListener('devicemotion', this.deviceParallaxAndTilt, { passive: true });
            }
          }).catch(console.error);
        } else {
          window.addEventListener('devicemotion', this.deviceParallaxAndTilt, { passive: true });
        }
      }
    }
    else if (e.super === 'off') {
      if (checkbox.checked) {
        this.picture.classList.add('tilt');
        window.removeEventListener('mousemove', this.parallax);
        this.picture.addEventListener('mousemove', this.tiltPicture, { passive: true });
        this.picture.addEventListener('mouseleave', this.reset);
      }
      else {
        this.picture.classList.remove('tilt');
        this.picture.removeEventListener('mousemove', this.tiltPicture);
        window.addEventListener('mousemove', this.parallax);
      }

      this.picture.removeEventListener('mousemove', this.parallaxAndTilt);

      if (window.DeviceMotionEvent) {
        window.removeEventListener('mousemove', this.deviceParallaxAndTilt);
      }
    }
    else if (e.target.checked) {
      this.picture.classList.add('tilt');
      window.removeEventListener('mousemove', this.parallax);
      this.picture.addEventListener('mousemove', this.tiltPicture, { passive: true });
      this.picture.addEventListener('mouseleave', this.reset);

      if (window.DeviceMotionEvent) {
        window.removeEventListener('devicemotion', this.deviceParallax);
        window.addEventListener('devicemotion', this.deviceTilt, { passive: true });
      }
    }
    else {
      this.picture.classList.remove('tilt');

      this.picture.removeEventListener('mousemove', this.tiltPicture);
      window.addEventListener('mousemove', this.parallax, { passive: true });

      if (window.DeviceMotionEvent) {
        window.removeEventListener('devicemotion', this.deviceTilt);
        window.addEventListener('devicemotion', this.deviceParallax, { passive: true });
      }
    }
  }

  deviceParallax(e) {
    const [clientX, clientY] = this.processGyro(e);

    requestAnimationFrame(() => this.moveObjects({
      clientX,
      clientY,
      isGyro: true,
    }));
  }

  deviceTilt(e) {
    const [clientX, clientY] = this.processGyro(e);

    requestAnimationFrame(() => this.tiltPicture({
      clientX,
      clientY,
      isGyro: true,
    }));
  }

  deviceParallaxAndTilt(e) {
    const [clientX, clientY] = this.processGyro(e);

    requestAnimationFrame(() => this.parallaxAndTilt({
      clientX,
      clientY,
      isGyro: true,
    }));
  }

  processGyro(e) {
    const beta = e.rotationRate.beta.toPrecision(2)
    const alpha = e.rotationRate.alpha.toPrecision(2);
    const { maxTilt } = this;

    this.y += parseFloat(alpha);
    this.x += parseFloat(beta)

    const clientX = Math.abs(this.x) < maxTilt.beta
      ? this.x
      : this.x < 0 ? -maxTilt.beta : maxTilt.beta;
    const clientY = Math.abs(this.y) < maxTilt.alpha
      ? this.y
      : this.y < 0 ? -maxTilt.alpha : maxTilt.alpha;

    return [clientX, clientY];
  }

  drawPicture(pic) {
    canvas.innerHTML = `
      <li class="pictureContainer">
        <div class="description">
          <p class="name">«${pic.name}»</p>
          <p class="author">${pic.author}, ${pic.date}</p>
        </div>
        <div id="${pic.id}" class="picture">
          ${pic.figures.map((fig, index) => (
            `<div class="fig${index} figure"></div>`
          )).join('')}
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
    this.setTransform(e);

    this.figures.forEach(fig => {
      fig.el.style.transform = `translateZ(${fig.speed * 3}px)`;
    });
  }

  parallaxAndTilt(e) {
    const { clientX, clientY } = e;

    if (!this.x && !this.y) {
      this.x = clientX;
      this.y = clientY;
      return;
    }

    const [cx, cy] = this.findCenterCoordinates();

    this.setTransform(e);
    const divider = e.isGyro ? 50 : 8; // more = slower

    this.figures.forEach(fig => {
      let xPos = -(cx - clientX) / divider;
      let yPos = -(cy - clientY) / divider;

      if (e.isGyro) {
        yPos = -yPos;
      }

      fig.el.style.transform = `
        translate3d(${xPos}px, ${yPos}px, ${fig.speed * 3}px)
      `;
    });
  }

  setTransform(e) {
    const { clientX, clientY } = e;

    const divider = e.isGyro ? 100 : 15; // more = slower

    const [cx, cy] = this.findCenterCoordinates();

    let xRot = -(cy - clientY) / divider;
    const yRot = (cx - clientX) / divider;

    if (e.isGyro) xRot = -xRot;

    const picture = document.getElementById(this.picture.id);
    const isScaled = window.getComputedStyle(picture, null).getPropertyValue('direction') === 'rtl';

    this.picture.style.transform = isScaled
      ? `perspective(${this.perspective}px) rotateX(${xRot}deg) rotateY(${yRot}deg) scale(0.7)`
      : `perspective(${this.perspective}px) rotateX(${xRot}deg) rotateY(${yRot}deg)`;
  }

  reset() {
    this.picture.style.transform =
      this.picture.style.transform.indexOf('scale(0.7)') >= 0
        ? `perspective(${this.perspective}px) scale(0.7)`
        : `perspective(${this.perspective}px)`;

    this.figures.forEach(fig => fig.el.style.transform = 'null');
    this.x = this.y = 0;
  }
}

// Default init with first picture
new Picture(pictureList[0]);
