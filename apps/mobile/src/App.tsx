import type { ExpenseCategory } from "@smart-scanner/shared";

const categories: ExpenseCategory[] = [
  "Food",
  "Transport",
  "Health",
  "Education",
  "Home",
  "Business"
];

export default function App() {
  return categories.length ? null : null;
}

