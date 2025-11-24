class Car {
  #brand;
  #model;
  speed = 0;
  isTunkOpen = false;
  constructor(carDetails) {
    this.#brand = carDetails.brand;
    this.#model = carDetails.model;
  }

  display() {
    console.log(`${this.#brand}  ${this.#model} Speed: ${this.speed} km/h`)
  }

  go() {
    if (this.isTunkOpen === true) {
      console.log('sorry you cannot move coz trunk is open');
    } else {
      if (this.speed + 5 > 200) {
        console.log('Speed Limit Reached');
      }
      else {
        this.speed += 5;
      }
    }
  }

  break() {
    if (this.speed - 5 < 0) {
      console.log('sorry car already stopped');
    }
    else {
      this.speed -= 5;
    }
  }


  openTrunk() {
    this.isTunkOpen = true;
  }
  closeTrunk() {
    this.isTunkOpen = false;
  }
}

class RaceCar extends Car {
  acceleration;
  constructor(carDetails) {
    super(carDetails);
    this.acceleration = carDetails.acceleration;
  }

  openTrunk() {
    this.isTunkOpen = false
  }

  closeTrunk() {
    this.isTunkOpen = false
  }

  go() {
    if (this.speed + this.acceleration > 300) {
      console.log('Speed Limit Reached of 300');
    }
    else {
      this.speed += this.acceleration;
    }
  }
}

const car1 = new Car({ brand: 'Toyota', model: 'Corolla' },
);


car1.go();
car1.go();
car1.go();
car1.break();
car1.break();
car1.openTrunk();
car1.closeTrunk();
car1.display();


const car2 = new RaceCar({ brand: 'McLaren', model: 'F1', acceleration: 100 }
);

car2.display();
car2.go();
car2.go();
car2.go();
car2.go();
car2.display();

car1.brand = 'tata';
car1.model = 'ds';
car1.display();