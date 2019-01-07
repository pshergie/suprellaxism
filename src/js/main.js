// class Picture {
//   constructor(picture) {
//     this.ctx = cvs.getContext('2d');
//     this.figures = [];
//     this.x = null;
//     this.y = null;
//     this.beta = null;
//     this.alpha = null;
//     this.xPoint = document.getElementById('xPoint');
//     this.yPoint = document.getElementById('yPoint');

//     cvs.style.backgroundColor = picture.backgorundColor;
//     cvs.width = picture.width;
//     cvs.height = picture.height;

//     resize();

//     if (picture.rectangles) {
//       this.drawRectangles(picture.rectangles);
//     }

//     // event listener
//     document.addEventListener('mousemove', (e) => {
//       this.moveObjects(e);
//     }, { passive: true });

      // if (window.DeviceMotionEvent) {
      //   window.addEventListener('devicemotion', (e) => {
      //     // const x = e.accelerationIncludingGravity.x.toPrecision(3);
      //     // const y = e.accelerationIncludingGravity.y.toPrecision(3);

      //     const x = e.acceleration.x.toPrecision(3);
      //     const y = e.acceleration.y.toPrecision(3);

      //     const beta = e.rotationRate.beta.toPrecision(2)
      //     const alpha = e.rotationRate.alpha.toPrecision(2);

      //     if (!this.beta && !this.alpha) {
      //       this.beta = beta;
      //       this.alpha = alpha;
      //       return;
      //     }

      //     const acc = 2;

      //     const xDiff = Math.abs(this.beta - beta).toPrecision(2);
      //     const yDiff = Math.abs(this.alpha - alpha).toPrecision(2)

      //     this.xPoint.innerHTML = beta;
      //     this.yPoint.innerHTML = alpha;

      //     // if (xDiff < acc || yDiff < acc) return;

      //     const clientX = beta;
      //     const clientY = alpha;

      //     this.moveObjects({
      //       clientX,
      //       clientY,
      //       gyro: true,
      //     });
      //   }, { passive: true });
      // }
//   }

//   drawRectangles(rectangles) {
//     rectangles.forEach(rect => {
//       this.figures.push(rect);
//       this.drawRectangle(rect);
//     });
//   }

//   drawRectangle(rect) {
//     this.ctx.fillStyle = rect.fillColor;

//     if (rect.rotate) {
//       this.ctx.save();
//       this.ctx.translate(rect.x + rect.width / 2, rect.y + rect.height / 2);
//       this.ctx.rotate(rect.rotate * Math.PI / 180);
//       this.ctx.fillRect(-rect.width / 2, -rect.height / 2, rect.width, rect.height);
//       this.ctx.restore();
//     }
//     else this.ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
//   }

//   moveObjects(e) {
//     if (!this.x && !this.y) {
//       this.x = e.clientX;
//       this.y = e.clientY;
//       return;
//     }

//     const factor = e.gyro ? 15 : 100;

//     if (e.gyro) {
//       this.figures = this.figures.map(figure => ({
//         x: figure.x + (this.beta - e.clientX) * figure.speed / factor,
//         y: figure.y + (this.alpha - e.clientY) * figure.speed / factor,
//         width: figure.width,
//         height: figure.height,
//         fillColor: figure.fillColor,
//         rotate: figure.rotate ? figure.rotate : null,
//         speed: figure.speed,
//       }));

//       this.beta = e.clientX;
//       this.alpha = e.clientY;
//     }
//     else {
//       this.figures = this.figures.map(figure => ({
//         x: figure.x + (this.x - e.clientX) * figure.speed / factor,
//         y: figure.y + (this.y - e.clientY) * figure.speed / factor,
//         width: figure.width,
//         height: figure.height,
//         fillColor: figure.fillColor,
//         rotate: figure.rotate ? figure.rotate : null,
//         speed: figure.speed,
//       }));

//       this.x = e.clientX;
//       this.y = e.clientY;
//     }

//     requestAnimationFrame(() => this.redraw());
//   }

//   redraw() {
//     this.ctx.clearRect(0, 0, cvs.width, cvs.height);

//     this.figures.forEach(rect => this.drawRectangle(rect));
//   }
// }

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
        rotate: '-12deg',
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
    this.x = null;
    this.y = null;
    this.beta = null;
    this.alpha = null;

    this.xPoint = document.getElementById('xPoint');
    this.yPoint = document.getElementById('yPoint');

    this.drawPicture(pic);

    // event listener
    window.addEventListener('mousemove', (e) => {
      requestAnimationFrame(() =>this.moveObjects(e));
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

        // this.xPoint.innerHTML = beta;
        // this.yPoint.innerHTML = alpha;

        // if (xDiff < acc || yDiff < acc) return;

        const clientX = beta;
        const clientY = alpha;

        requestAnimationFrame(() => this.moveObjects({
          clientX,
          clientY,
          gyro: true,
        }));
      }, { passive: true });
    }
  }

  drawPicture(pic) {
    // this.canvas.innerHTML = `
    //   <li class="pictureContainer">
    //     <div class="description">
    //       <p class="name">«${pic.description}»</p>
    //       <p class="author">${pic.author}, ${pic.date}</p>
    //     </div>
    //     <div id="${pic.id}" class="picture">
    //       ${pic.figures.map((fig, index) => (
    //         `<div class="fig${index} figure" data-speed="${fig.speed}" data-rotate="${fig.rotate ? fig.rotate : ''}"></div>`
    //       ))}
    //     </div>
    //   </li>
    // `;

    // Mobile version
    this.canvas.innerHTML = `
      <li class="pictureContainer">
        <div id="${pic.id}" class="picture">
          ${pic.figures.map((fig, index) => (
      `<div class="fig${index} figure" data-speed="${fig.speed}" data-rotate="${fig.rotate ? fig.rotate : ''}"></div>`
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
    const factor = e.gyro ? 50 : 50;

    if (e.gyro) {
      this.figures.forEach(fig => {
        const xPos = (this.beta - e.clientX) * fig.speed / factor;
        const yPos = (this.alpha - e.clientY) * fig.speed / factor;

        // alert('lkaj');

        this.xPoint.innerHTML = `${this.beta}, ${e.clientX}`;
        this.yPoint.innerHTML = `${this.alpha}, ${e.clientY}`;


        fig.el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)${fig.rotate ? ` rotate(-12deg)` : ''}`;
      });

      this.beta = e.clientX;
      this.alpha = e.clientY;
    }
    else {
      if (!this.x && !this.y) {
        this.x = e.clientX;
        this.y = e.clientY;
        return;
      }

      this.figures.forEach(fig => {
        const xPos = (this.x - e.clientX) * fig.speed / factor;
        const yPos = (this.y - e.clientY) * fig.speed / factor;

        fig.el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)${fig.rotate ? ` rotate(-12deg)` : ''}`;
      });

      this.x = e.clientX;
      this.y = e.clientY;
    }
  }
}

new Picture(pictureList[0]);
