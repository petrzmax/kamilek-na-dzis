(function () {
  'use strict';

  const quoteEl = document.getElementById('quote');
  const btn = document.getElementById('btn');

  let quotes = [];

  // Load quotes from txt file (one per line)
  async function loadQuotes() {
    const res = await fetch('quotes.txt');
    const text = await res.text();
    quotes = text
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);
  }

  function randomQuote(exclude) {
    if (quotes.length <= 1) return quotes[0] || '';
    let pick;
    do {
      pick = quotes[Math.floor(Math.random() * quotes.length)];
    } while (pick === exclude);
    return pick;
  }

  // Lottery-style shuffle: starts fast, eases out, lands on final quote
  function shuffle() {
    btn.disabled = true;
    quoteEl.classList.remove('landed');
    quoteEl.classList.add('shuffling');

    const totalSteps = 18;          // how many text swaps
    const minDelay = 40;             // fastest interval (ms)
    const maxDelay = 260;            // slowest interval just before landing
    const finalQuote = randomQuote(quoteEl.textContent);

    let step = 0;

    function tick() {
      if (step < totalSteps) {
        quoteEl.textContent = randomQuote(quoteEl.textContent);

        // Ease-out timing: delay grows quadratically
        const t = step / totalSteps;
        const delay = minDelay + (maxDelay - minDelay) * (t * t);

        step++;
        setTimeout(tick, delay);
      } else {
        // Land on the chosen quote
        quoteEl.textContent = finalQuote;
        quoteEl.classList.remove('shuffling');
        quoteEl.classList.add('landed');
        btn.disabled = false;
      }
    }

    tick();
  }

  btn.addEventListener('click', () => {
    if (quotes.length === 0) return;
    shuffle();
  });

  // Init
  loadQuotes().catch(() => {
    quoteEl.textContent = 'Nie udało się załadować cytatów :(';
  });
})();
