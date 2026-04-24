(function () {
  'use strict';

  const quoteEl = document.getElementById('quote');
  const btn = document.getElementById('btn');

  let quotes = [];
  let deck = [];       // shuffled deck we deal from
  let deckIndex = 0;   // next card to deal

  // Load quotes from txt file (one per line)
  async function loadQuotes() {
    const res = await fetch('quotes.txt');
    const text = await res.text();
    quotes = text
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);
    reshuffleDeck();
  }

  // Fisher-Yates shuffle — creates a new deck from all quotes
  function reshuffleDeck(lastQuote) {
    deck = quotes.slice();
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    // If the first card in the new deck matches the last shown quote, swap it away
    if (lastQuote && deck.length > 1 && deck[0] === lastQuote) {
      const swapIdx = 1 + Math.floor(Math.random() * (deck.length - 1));
      [deck[0], deck[swapIdx]] = [deck[swapIdx], deck[0]];
    }
    deckIndex = 0;
  }

  // Deal the next quote; reshuffle when the deck runs out
  function nextQuote() {
    if (deckIndex >= deck.length) {
      reshuffleDeck(deck[deck.length - 1]);
    }
    return deck[deckIndex++];
  }

  // Pick a random quote for the animation flicker (visual only)
  function randomFlicker(exclude) {
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
    const finalQuote = nextQuote();
    const bare = (s) => s.replace(/^[\u201E]|[\u201D]$/g, '');

    let step = 0;

    function tick() {
      if (step < totalSteps) {
        quoteEl.textContent = '\u201E' + randomFlicker(bare(quoteEl.textContent)) + '\u201D';

        // Ease-out timing: delay grows quadratically
        const t = step / totalSteps;
        const delay = minDelay + (maxDelay - minDelay) * (t * t);

        step++;
        setTimeout(tick, delay);
      } else {
        // Land on the chosen quote
        quoteEl.textContent = '\u201E' + finalQuote + '\u201D';
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
