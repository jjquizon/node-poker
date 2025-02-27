
// Gets the hands, doesn't compare ranks (e.g. if two players different straights, will just return the hand value and not compare which straight is better)
class PokerHandEvaluator {
    const getCombinations = (arr, k) => {
        const result = [];
        const helper = (start, combo) => {
            if (combo.length === k) {
                result.push([...combo]);
                return;
            }
            for (let i = start; i < arr.length; i++) {
                combo.push(arr[i]);
                helper(i + 1, combo);
                combo.pop();
            }
        };
        helper(0, []);
        return result;
    };

    static evaluate(cards) {
        if (cards.length < 5) return { rank: "Invalid", value: -1 };

        const suits = {};
        const values = {};
        let sortedValues = [];

        // Count occurrences of each suit & value
        cards.forEach(({ suit, value }) => {
            suits[suit] = (suits[suit] || 0) + 1;
            values[value] = (values[value] || 0) + 1;
        });

        // Convert face cards to numerical values for easier sorting
        const cardOrder = { "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10, "J": 11, "Q": 12, "K": 13, "A": 14 };
        sortedValues = Object.keys(values).map(v => cardOrder[v]).sort((a, b) => b - a);

        // Check for Flush
        const isFlush = Object.values(suits).some(count => count >= 5);

        // Check for Straight
        const isStraight = (values) => {
            const sorted = [...new Set(values)].sort((a, b) => b - a); // Remove duplicates & sort descending
            for (let i = 0; i <= sorted.length - 5; i++) {
                if (sorted[i] - sorted[i + 4] === 4) return true; // Check if 5 numbers are consecutive
            }
            return sorted.includes(14) && sorted.slice(-4).join(",") === "5,4,3,2"; // Special case: A-5 straight
        };

        const findBestStraight = (cards) => {
            const values = cards.map(card => cardOrder[card.value]); // Convert to numbers
            const combinations = getCombinations(values, 5); // Generate all 5-card combinations

            for (let combo of combinations) {
                if (isStraight(combo)) return combo.sort((a, b) => b - a); // Return highest straight
            }
            return null; // No straight found
        };

        // Royal Flush
        if (isFlush && isStraight && sortedValues.includes(14) && sortedValues.includes(10)) return { rank: "Royal Flush", value: 10 };

        // Straight Flush
        if (isFlush && isStraight) return { rank: "Straight Flush", value: 9 };

        // Four of a Kind
        if (Object.values(values).includes(4)) return { rank: "Four of a Kind", value: 8 };

        // Full House
        if (Object.values(values).includes(3) && Object.values(values).includes(2)) return { rank: "Full House", value: 7 };

        // Flush
        if (isFlush) return { rank: "Flush", value: 6 };

        // Straight
        if (isStraight) return { rank: "Straight", value: 5 };

        // Three of a Kind
        if (Object.values(values).includes(3)) return { rank: "Three of a Kind", value: 4 };

        // Two Pair
        const pairs = Object.values(values).filter(count => count === 2).length;
        if (pairs === 2) return { rank: "Two Pair", value: 3 };

        // One Pair
        if (pairs === 1) return { rank: "One Pair", value: 2 };

        // High Card
        return { rank: "High Card", value: 1, highCard: sortedValues[0] };
    }
}

module.exports = PokerHandEvaluator;