export interface SouthIndianRecipe {
  name: string;
  image: string;
  instructions: string;
  category: string;
  area: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealTypes: string[];
}

export const SOUTH_INDIAN_RECIPES: SouthIndianRecipe[] = [
  {
    name: "Puttu & Kadala Curry",
    calories: 450,
    protein: 14,
    carbs: 72,
    fat: 12,
    instructions: "Layer ground rice and grated coconut in a cylindrical steamer (puttukutty) and steam. Serve alongside spicy black chickpea (kadala) curry cooked in coconut milk and spices.",
    mealTypes: ["BREAKFAST"],
    image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=600&auto=format&fit=crop&q=60",
    category: "Breakfast",
    area: "Kerala"
  },
  {
    name: "Appam & Vegetable Stew",
    calories: 380,
    protein: 8,
    carbs: 65,
    fat: 10,
    instructions: "Prepare a fermented batter of rice, coconut, and yeast. Cook in an appachatti to get paper-thin crispy edges and a soft fluffy center. Serve with mixed vegetables simmered in rich coconut milk and mild spices.",
    mealTypes: ["BREAKFAST"],
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&auto=format&fit=crop&q=60",
    category: "Breakfast",
    area: "Kerala"
  },
  {
    name: "Masala Dosa",
    calories: 411,
    protein: 9,
    carbs: 60,
    fat: 12,
    instructions: "Spread fermented rice-lentil batter thinly on a hot griddle, drizzle with ghee until golden-crisp. Stuff with a spiced potato mash (masala) and serve hot with sambar and coconut chutney.",
    mealTypes: ["BREAKFAST", "DINNER"],
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=60",
    category: "Breakfast",
    area: "South India"
  },
  {
    name: "Idli & Sambar",
    calories: 300,
    protein: 10,
    carbs: 58,
    fat: 2,
    instructions: "Steam fermented black lentil (urad dal) and rice batter in round molds. Serve these pillowy-soft steamed cakes hot with vegetable-infused pigeon pea stew (sambar) and chutneys.",
    mealTypes: ["BREAKFAST"],
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=60", // using dosa/south indian placeholder or general photo
    category: "Breakfast",
    area: "South India"
  },
  {
    name: "Kerala Parotta",
    calories: 320,
    protein: 6,
    carbs: 50,
    fat: 11,
    instructions: "Knead refined flour with oil and water, roll out, pleat, coil, and flatten into layered disks. Fry on a tawa until flaky and golden brown.",
    mealTypes: ["LUNCH", "DINNER"],
    image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=600&auto=format&fit=crop&q=60",
    category: "Bread",
    area: "Kerala"
  },
  {
    name: "Beef Ularthiyathu (Kerala Beef Fry)",
    calories: 420,
    protein: 28,
    carbs: 8,
    fat: 30,
    instructions: "Pressure cook beef chunks with ginger, garlic, and home-ground spices, then slow-roast with sliced shallots, curry leaves, and fried coconut shards (thengakkothu) until dry and dark brown.",
    mealTypes: ["LUNCH", "DINNER"],
    image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=600&auto=format&fit=crop&q=60",
    category: "Curry",
    area: "Kerala"
  },
  {
    name: "Kerala Fish Curry (Kudampuli)",
    calories: 290,
    protein: 22,
    carbs: 6,
    fat: 18,
    instructions: "Simmer firm fish chunks in an earthen clay pot (meen chatti) with ginger, garlic, shallots, fiery red chili powder, turmeric, and dried Malabar tamarind (kudampuli) water.",
    mealTypes: ["LUNCH", "DINNER"],
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=60",
    category: "Curry",
    area: "Kerala"
  },
  {
    name: "Avial",
    calories: 210,
    protein: 4,
    carbs: 15,
    fat: 14,
    instructions: "Cook a mix of native vegetables (yam, drumstick, plantain, carrot, beans) with minimal water, then fold in a thick coarse paste of grated coconut, green chilies, and cumin. Finish with curd and raw coconut oil.",
    mealTypes: ["LUNCH", "DINNER"],
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=60",
    category: "Vegetarian",
    area: "Kerala"
  },
  {
    name: "Malabar Chicken Biryani",
    calories: 680,
    protein: 34,
    carbs: 85,
    fat: 22,
    instructions: "Cook fragrant short-grain Kaima rice and spicy chicken masala separately, then layer them in a pot with ghee, fried onions, cashews, and raisins. Seal and cook on dum.",
    mealTypes: ["LUNCH", "DINNER"],
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=60",
    category: "Rice",
    area: "Kerala"
  },
  {
    name: "Idiyappam",
    calories: 180,
    protein: 4,
    carbs: 40,
    fat: 1,
    instructions: "Make a soft dough of roasted rice flour and hot water. Press through an idiyappam mould onto steamer plates, sprinkle with grated coconut, and steam until soft.",
    mealTypes: ["BREAKFAST", "DINNER"],
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&auto=format&fit=crop&q=60",
    category: "Breakfast",
    area: "Kerala"
  },
  {
    name: "Egg Roast",
    calories: 220,
    protein: 13,
    carbs: 8,
    fat: 15,
    instructions: "Sauté sliced onions, green chilies, ginger, and garlic in coconut oil until caramelised. Add spice powders, tomatoes, and boil down to a thick gravy. Fold in hard-boiled eggs.",
    mealTypes: ["BREAKFAST", "DINNER"],
    image: "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=600&auto=format&fit=crop&q=60",
    category: "Curry",
    area: "Kerala"
  },
  {
    name: "Chapati",
    calories: 120,
    protein: 3,
    carbs: 24,
    fat: 2,
    instructions: "Knead whole wheat flour (atta) with water and salt. Roll into thin circular discs and cook on a dry tawa until puffed and cooked on both sides.",
    mealTypes: ["LUNCH", "DINNER"],
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=60",
    category: "Bread",
    area: "India"
  },
  {
    name: "Dal Fry",
    calories: 180,
    protein: 10,
    carbs: 28,
    fat: 4,
    instructions: "Pressure cook yellow lentils (toor dal) with turmeric. Temper in a pan with cumin seeds, garlic, onions, tomatoes, and green chilies in ghee.",
    mealTypes: ["LUNCH", "DINNER"],
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=60",
    category: "Curry",
    area: "India"
  },
  {
    name: "Sambaram (Kerala Spiced Buttermilk)",
    calories: 45,
    protein: 2,
    carbs: 4,
    fat: 2,
    instructions: "Whisk fresh yogurt with water to a thin consistency. Infuse with crushed bird's eye chilies (kanthari), ginger, curry leaves, shallots, and salt. Serve chilled.",
    mealTypes: ["BREAKFAST", "LUNCH", "DINNER"],
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=60",
    category: "Drink",
    area: "Kerala"
  }
];
