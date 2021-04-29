const readline = require("readline");
const idle = require("desktop-idle");
const play = require('audio-play');
const load = require('audio-loader');

const IDLE_THRESHOLD = 300;

/**
 * check the idle time every 100ms
 * @return {Promise} the promise will resolve if the idle time exceed IDLE_THRESHOLD
 */
const idleCheck = async () => new Promise(resolve => {
  const ildeCheckInterval = setInterval(() => {
    const idleTime = idle.getIdleTime();
    process.stdout.write("Idle time: " + idleTime + "\r");

    if (idleTime > IDLE_THRESHOLD) {
      console.log("\nSleeping");
      clearInterval(ildeCheckInterval);
      resolve();
    }
  }, 100);
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Prompt a random equation
 * @return {Promise} resolve to true if the input result is correct, otherwise false
 */
const askEquation = async () => new Promise((resolve, reject) => {
  const a = Math.round(Math.random() * 50);
  const b = Math.round(Math.random() * 50);
  const c = Math.round(Math.random() * 50);
  const d = a * b * c;

  rl.question(`${a} * ${b} * ${c} = `, result => {
    result = parseInt(result, 10);
    if (d === result) {
      resolve(true);
    } else {
      resolve(false);
    }
  });
});

/**
 * prompt the math equation repeatedly until user make the correct answer
 * @return {Promise} resolve when the user make a correct answer
 */
const askMath = async () => {
  let done = false;

  console.log("Solve the following equation: ");

  while (!(await askEquation())) {
    console.log("Wrong answer");
  }

  console.log("Correct! Back to idle check, don't fall asleep this time");
}

/**
 * The main function
 */
const main = async () => {
  const alarmBuffer = await load("alarm-sound.mp3");
  const playback = play(alarmBuffer, {
    start: 0,
    loop: true,
    volume: 1,
    autoplay: false
  });

  // run until user stop
  while (true) {
    // first check the ilde time, the promise will resolve if the idle time exceed the IDLE_THRESHOLD
    await idleCheck();

    // user is sleeping, play alarm now
    // this use the same thread, so be careful
    playback.play();

    // spawn the math problem for dismiss
    await askMath();

    // user pass the math test
    playback.pause();
  }
}

main();