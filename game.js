const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const entities = [];
const systems = [];

//images
const coinImage = document.querySelector(".coin");
const chestImage = document.querySelector(".chest");
const chestOpenImage = document.querySelector(".chest-open");
const background = document.querySelector(".background");

function Position(x, y) {
  return { x, y };
}

function Velocity(speedX, speedY) {
  return { speedX, speedY };
}

function Coin() {
  return {};
}

function Player() {
  return { score: 0, falls: 0, image: chestImage, isOpen: false };
}

function renderingSystem(entities) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  entities.forEach((entity) => {
    if (entity.position && entity.coin) {
      ctx.drawImage(
        coinImage,
        entity.position.x - 15,
        entity.position.y - 15,
        40,
        30
      );
    } else if (entity.position && entity.player) {
      ctx.drawImage(
        entity.player.image,
        entity.position.x - 15,
        entity.position.y - 15,
        70,
        50
      );
    }
  });
}

const statsSystem = (entities) => {
  entities.map((entity) => {
    if (entity.position && entity.player) {
      ctx.font = "20px Arial";
      ctx.fillStyle = "white";
      ctx.fillText(`Score: ${entity.player.score}`, 10, 20);
      ctx.fillText(`Falls: ${entity.player.falls}`, 10, 40);
    }
  });
};

function movementSystem(entities, deltaTime) {
  entities.forEach((entity) => {
    if (entity.position && entity.velocity) {
      entity.position.x += entity.velocity.speedX * deltaTime;
      entity.position.y += entity.velocity.speedY * deltaTime;

      if (entity.position.y > canvas.height) {
        entity.position.y = 0;
        entity.position.x = Math.random() * canvas.width;
        entities[0].player.falls++;
      }
    }

    if (entity.velocity && entity.coin) {
      entity.velocity.speedY = 300;
    }

    if (Math.random() < 0.005 * deltaTime) {
      const newCoinEntity = {
        position: Position(Math.random() * canvas.width, 0),
        velocity: Velocity(0, 300),
        coin: Coin(),
      };
      entities.push(newCoinEntity);
    }
  });
}

const gameOverSystem = (entities) => {
  entities.map((entity) => {
    if (entities[0].player.falls >= 4) {
      //   alert(`Game Over! Your score is: ${entities[0].player.score}`);
      //   entities[0].player.falls = 0;
      //   entities[0].player.score = 0;

      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = "bold 36px Arial";
      ctx.fillStyle = "red";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 50);

      ctx.font = "24px Arial";
      ctx.fillStyle = "white";
      ctx.fillText(
        `Your final score is: ${entities[0].player.score}`,
        canvas.width / 2,
        canvas.height / 2
      );

      let message = "Well done!";
      if (entities[0].player.score < 10) {
        message = "Better luck next time.";
      } else if (entities[0].player.score < 20) {
        message = "Great job!";
      } else if (entities[0].player.score > 50) {
        message = "IMPOSSIBLE !";
      }

      ctx.fillText(message, canvas.width / 2, canvas.height / 2 + 50);

      const playAgainButton = document.getElementById("playAgainButton");
      playAgainButton.style.display = "block";
      playAgainButton.style.position = "absolute";
      playAgainButton.style.left =
        canvas.width / 2 - playAgainButton.offsetWidth / 2 + 550 + "px";
      playAgainButton.style.top = canvas.height / 2 + 300 + "px";
      return;
    }
  });
};

function collisionSystem(entities) {
  const player = entities.find((entity) => entity.player);
  const coins = entities.filter((entity) => entity.coin);

  coins.forEach((coin) => {
    if (
      player.position.x < coin.position.x + 15 &&
      player.position.x + 70 > coin.position.x &&
      player.position.y < coin.position.y + 15 &&
      player.position.y + 20 > coin.position.y
    ) {
      coin.position.y = 0;
      coin.position.x = Math.random() * canvas.width;
      if (entities[0].player.isOpen) {
        entities[0].player.score++;
      } else {
        entities[0].player.falls++;
        // if (entities[0].player.falls > 4) {
        //   alert(`Game Over! Your score is: ${entities[0].player.score}`);
        // }
      }
    }
  });

  return entities.map((entity) => {
    if (entity.player) {
      return { ...entity, player: { ...player } };
    }
    return entity;
  });
}

const playerEntity = {
  position: Position(canvas.width / 2, canvas.height - 30),
  player: Player(),
};

const coinEntity = {
  position: Position(Math.random() * canvas.width, 0),
  velocity: Velocity(0, 200),
  coin: Coin(),
};

entities.push(playerEntity, coinEntity);

systems.push(
  movementSystem,
  collisionSystem,
  renderingSystem,
  statsSystem,
  gameOverSystem
);

let lastFrameTime = performance.now();

function gameLoop() {
  const currentTime = performance.now();
  const deltaTime = (currentTime - lastFrameTime) / 1000;
  lastFrameTime = currentTime;

  systems.forEach((system) => system(entities, deltaTime));

  requestAnimationFrame(gameLoop);
}

gameLoop();

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" && playerEntity.position.x > 50) {
    playerEntity.position.x -= 55;
    playerEntity.player.image = chestImage;
  } else if (
    e.key === "ArrowRight" &&
    playerEntity.position.x < canvas.width - 70
  ) {
    playerEntity.player.image = chestImage;
    playerEntity.position.x += 55;
  } else if (e.key === "Enter") {
    playerEntity.player.image = chestOpenImage;
    playerEntity.player.isOpen = true;
  }
});

window.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    playerEntity.player.image = chestImage;
    playerEntity.player.isOpen = false;
  }
});

function resetGame() {
  entities.length = 0;

  playerEntity.player.score = 0;
  playerEntity.player.falls = 0;

  entities.push(playerEntity, coinEntity);
}

document.getElementById("playAgainButton").addEventListener("click", () => {
  resetGame();
  document.getElementById("playAgainButton").style.display = "none";
});
