import confetti from 'https://cdn.skypack.dev/canvas-confetti';
const startButton = document.getElementById('start');
const flame = document.getElementById('flame');
const candle = document.querySelector('.candle');

let audioContext;
let stream;
let source;

async function getMedia() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    source = audioContext.createMediaStreamSource(stream);

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    source.connect(analyser);

    console.log('Microphone is streaming!');

    let isTalking = false;

    function detectSpeech() {
      analyser.getByteTimeDomainData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const value = (dataArray[i] - 128) / 128;
        sum += value * value;
      }
      const volume = Math.sqrt(sum / dataArray.length);

      const threshold = 0.05; // Adjust if needed

      if (volume > threshold) {
        if (!isTalking) {
          console.log('User started speaking');
          isTalking = true;
        }
      } else {
        if (isTalking) {
          console.log('User stopped speaking');
          isTalking = false;
          flame.style.display = 'none';
          candle.classList.add('hidden');
        }
      }

      requestAnimationFrame(detectSpeech);
    }

    detectSpeech();
  } catch (err) {
    console.log(err);
  }
}

function stopMedia() {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    console.log('Microphone stopped!');
  }
  if (audioContext) {
    audioContext.close();
    console.log('AudioContext closed!');
  }
}

function onHold() {
  let holdTimer;

  startButton.addEventListener('mousedown', () => {
    getMedia();
    holdTimer = setTimeout(() => {
      console.log('Button held for 1 second!');
    }, 1000); // 1 second
  });

  startButton.addEventListener('mouseup', () => {
    clearTimeout(holdTimer);
    stopMedia();

    confetti();
    confetti();
  });

  // Optional: stop when mouse leaves button
  startButton.addEventListener('mouseleave', () => {
    clearTimeout(holdTimer);
    stopMedia();
  });
}

onHold();
