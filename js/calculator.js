// js/calculator.js

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

  // Modified evaluateSuccess function:
  function evaluateSuccess(drawnDistribution) {
    const conditions = config.successConditions;
    const nConditions = conditions.length;
    let conditionResults = new Array(nConditions).fill(0); // base counts from non-searcher cards
    let bonusValues = new Array(nConditions).fill(0); // bonus per condition

    // 1. Compute base counts from non-searcher cards.
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

    // 2. Compute bonus values with allocation across conditions that share engines.
    // We'll create an object to track which engine tags have already been used.
    let usedEngines = {}; // keys: engine tag, value: true if bonus already allocated

    for (let i = 0; i < nConditions; i++) {
      const cond = conditions[i];
      if (cond.engines && cond.engines.length > 0) {
        // Instead of summing over all searchers, we check if any engine is available.
        let bonusAllocated = false;
        // For each engine tag listed in this condition:
        for (let k = 0; k < cond.engines.length; k++) {
          const engine = cond.engines[k];
          // Only allocate bonus if we haven't already used this engine for a bonus.
          if (!usedEngines[engine]) {
            // Sum the drawn searcher count for this engine:
            let searcherSum = 0;
            for (let j = 0; j < cardTypes.length; j++) {
              const card = cardTypes[j];
              if (card.isSearcher) {
                let se = (card.searchForEngines || "")
                  .split(',')
                  .map(s => s.trim())
                  .filter(s => s);
                // If this searcher qualifies for the engine:
                if (se.includes(engine)) {
                  searcherSum += drawnDistribution[j];
                }
              }
            }
            if (searcherSum > 0) {
              bonusValues[i] = 1; // Award bonus for this condition.
              usedEngines[engine] = true; // Mark this engine as used.
              bonusAllocated = true;
              break; // Stop checking further engines for this condition.
            }
          }
        }
        if (!bonusAllocated) {
          bonusValues[i] = 0;
        }
      } else {
        bonusValues[i] = 0;
      }
    }

    // 3. Compute effective count = base + bonus for each condition and check against condition.
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

