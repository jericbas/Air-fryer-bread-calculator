// src/utils/calculations.ts
import { Ingredient, Recipe } from '../types';

/**
 * @description Calculates the total required ingredients for a recipe profile, applying substitution rules where necessary.
 * @param recipe The recipe object defining the desired bread profile.
 * @param substitutions A map of substituted ingredients (e.g., {'flour': 'almond_flour'}).
 * @returns An object containing calculated ingredient amounts and any warnings.
 */
export const calculateIngredientsForProfile = (recipe: Recipe, substitutions: Record<string, string>) => {
    let totalIngredients: Map<string, number> = new Map();
    let warnings: string[] = [];

    // 1. Initial pass: Sum all primary ingredients
    for (const ingredient of recipe.ingredients) {
        totalIngredients.set(ingredient.name, (totalIngredients.get(ingredient.name) || 0) + ingredient.amount);
    }

    // 2. Substitution pass: Check for substitutions and adjust totals
        // 2. Substitution pass: Check for substitutions and adjust totals
        const substitutionRules = {
            'wheat_flour': { substitute: 'almond_flour', ratio: 0.95 }, // 1:0.95 volume/mass swap
            // Future additions can go here (e.g., 'gluten': { substitute: 'rice_flour', ratio: 1.0 })
        };

        for (const [originalIngredientName, substituteRule] of Object.entries(substitutions)) {
            if (!totalIngredients.has(originalIngredientName)) {
                warnings.push(`Warning: Original ingredient "${originalIngredientName}" not found in the recipe.`);
                continue;
            }

            let originalAmount = totalIngredients.get(originalIngredientName)!;

            const rule = substitutionRules[originalIngredientName];
            if (rule) {
                // Apply substitution based on defined ratio
                totalIngredients.delete(originalIngredientName);
                const newAmount = Math.max(0, originalAmount * rule.ratio); // Ensure non-negative amount
                totalIngredients.set(rule.substitute, newAmount);
                warnings.push(`Substitution applied: ${originalIngredientName} -> ${rule.substitute}. Amount adjusted by a ratio of ${rule.ratio}.`);
            } else {
                // Handle unhandled subs (as before)
                warnings.push(`Unhandled substitution attempt: ${originalIngredientName} to ${substituteName}. Skipping.`);
            }
        }

    return {
        ingredients: Object.fromEntries(totalIngredients),
        warnings: warnings
    };
};

/**
 * @description Performs complex structural calculations based on the overall bread profile parameters (e.g., hydration, rise time).
 * This function is intended to contain advanced chemical/baking science logic for V1.2.
 * @param profile The calculated bread profile object.
 * @returns A detailed analysis of potential baking issues or required adjustments.
 */
export const analyzeProfileForBakingStability = (profile: any): string[] => {
    const issues: string[] = [];
    if (profile.hydration > 0.9) {
        issues.push("High hydration detected (>90%). Consider reducing liquid by 5-10% or extending the bulk fermentation time.");
    }
    // Add more complex logic here...

    return issues;
};