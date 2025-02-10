# Odds Calculator

Odds Calculator is a web-based tool that helps you simulate the odds of drawing specific card combinations from your deck. Whether you’re fine-tuning your deck or just curious about your drawing probabilities, this tool provides a flexible, responsive interface that works seamlessly on desktop and mobile devices.

## Features

- **Deck Configuration:**  
  Easily specify the total number of cards in your deck and the number of cards you plan to draw.

- **Card Groups (Linked Cards):**  
  Organize cards into groups with individual names, amounts, and conditions. Each group supports multiple linked cards (for example, different card variants) with an option to count only unique cards.

- **Searchers:**  
  Configure searcher cards that can be used to fetch cards from your deck. (The searchers section is placed below the card groups.)

- **Combinatorial Analysis:**  
  Uses a recursive combinatorial algorithm to determine the total number of drawing combinations, the number of successful combinations (meeting your criteria), and calculates the probability.

- **Sample Draws:**  
  Displays up to five sample successful draws so you can see what your ideal hand might look like.

- **Import/Export Configuration:**  
  Save your current configuration as a JSON file and load configurations from file for quick testing.

- **Responsive & Mobile-Ready:**  
  Optimized for both desktop and mobile views. On mobile, inputs and card layouts adjust to be easy to use and read.

- **Dark/Light Theme Toggle:**  
  Switch between dark and light modes to suit your preference.

## Installation

Simply clone the repository and open the `index.html` file in your favorite browser. No build tools or servers are required.

```bash
git clone https://github.com/JSilva6/ygoOdds.git
cd ygoOdds

