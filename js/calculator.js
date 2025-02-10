// calculator.js

function calculateOdds(config) {
  const cardTypes = config.deck;
  const handSize = config.handSize;
  let totalWays = 0;
  let successWays = 0;
  const binomCache = {};
  let sampleDraws = [];
  let sampleSet = new Set();

  function binom(n, k) {
    const key = n + ',' + k;
    if (binomCache[key] !== undefined) return binomCache[key];
    if (k > n) return 0;
    if (k === 0 || k === n) return 1;
    let result = 1;
    for (let i = 1; i <= k; i++) {
      result = result * (n - i + 1) / i;
    }
    binomCache[key] = result;
    return result;
  }

  function evaluateSuccess(drawnDistribution) {
    const conditions = config.successConditions;
    const nConditions = conditions.length;
    let conditionResults = new Array(nConditions).fill(0);
    let bonusValues = new Array(nConditions).fill(0);

    // 1. Base count from non-searcher cards.
    for (let i = 0; i < nConditions; i++) {
      const cond = conditions[i];
      if (cond.unique) {
        let names = new Set();
        for (let j = 0; j < cardTypes.length; j++) {
          const card = cardTypes[j];
          if (!card.isSearcher && card.conditionIndex === i && drawnDistribution[j] > 0) {
            names.add(card.name);
          }
        }
        conditionResults[i] = names.size;
      } else {
        let sum = 0;
        for (let j = 0; j < cardTypes.length; j++) {
          const card = cardTypes[j];
          if (!card.isSearcher && card.conditionIndex === i) {
            sum += drawnDistribution[j];
          }
        }
        conditionResults[i] = sum;
      }
    }

    // 2. Bonus for conditions with engines.
    for (let i = 0; i < nConditions; i++) {
      const cond = conditions[i];
      if (cond.engines && cond.engines.length > 0) {
        let searcherSum = 0;
        for (let j = 0; j < cardTypes.length; j++) {
          const card = cardTypes[j];
          if (card.isSearcher) {
            let se = (card.searchForEngines || "").split(',').map(s => s.trim()).filter(s => s);
            if (se.some(e => cond.engines.includes(e))) {
              searcherSum += drawnDistribution[j];
            }
          }
        }
        bonusValues[i] = (searcherSum > 0 ? 1 : 0);
      } else {
        bonusValues[i] = 0;
      }
    }

    // 3. Effective count = base + bonus.
    for (let i = 0; i < nConditions; i++) {
      const effective = conditionResults[i] + bonusValues[i];
      const cond = conditions[i];
      if (cond.operator === 'exactly' && effective !== cond.desiredAmount) return false;
      if (cond.operator === 'more or equal' && effective < cond.desiredAmount) return false;
      if (cond.operator === 'less or equal' && effective > cond.desiredAmount) return false;
    }
    return true;
  }

  function recordSample(drawnDistribution) {
    let sample = [];
    for (let i = 0; i < cardTypes.length; i++) {
      if (drawnDistribution[i] > 0) {
        let name = cardTypes[i].name.trim() || "[Generic]";
        for (let k = 0; k < drawnDistribution[i]; k++) {
          sample.push(name);
        }
      }
    }
    const rep = sample.join(" - ");
    if (!sampleSet.has(rep)) {
      sampleSet.add(rep);
      sampleDraws.push(sample);
    }
  }

  function rec(index, remaining, ways, drawnDistribution) {
    if (index === cardTypes.length) {
      if (remaining === 0) {
        totalWays += ways;
        if (evaluateSuccess(drawnDistribution)) {
          successWays += ways;
          recordSample(drawnDistribution);
        }
      }
      return;
    }
    const card = cardTypes[index];
    const maxDraw = Math.min(card.count, remaining);
    for (let count = 0; count <= maxDraw; count++) {
      const waysForThisCount = binom(card.count, count);
      drawnDistribution[index] = count;
      rec(index + 1, remaining - count, ways * waysForThisCount, drawnDistribution);
    }
  }

  rec(0, handSize, 1, new Array(cardTypes.length).fill(0));
  const probability = successWays / totalWays;
  return { successWays, totalWays, probability, sampleDraws };
}

