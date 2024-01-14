import { NumberRule, Rule, SelectionEngine, StringRule } from "./src/engine";
import { Client, User } from "./src/state";

const assignUser = (client: Client) => {
  // assign employees to client
  const pool: User[] = [
    { id: 1, name: "Joe Miller" },
    { id: 2, name: "Adam Willy" },
    { id: 3, name: "Joshua Eliot" },
    { id: 4, name: "Michael Scott (Regional Manager)" },
  ];
  const rules: Rule[] = [
    new StringRule("pointOfInterest", "Office Furniture", [1,4]),
    new StringRule("pointOfInterest", "Home Furniture", [2,4]),
    new StringRule("pointOfInterest", "Plumbing Fixtures", [3,4]),
    new NumberRule("budget", 10000, [4], "greater")
  ];
  const selectionEngine = new SelectionEngine(rules, pool);
  const eligibleUsers = selectionEngine.runIfAny(client);
  return eligibleUsers;
};

const client: Client = {
  id: 1,
  name: "John Doe",
  phone: "1234567890",
  pointOfInterest: "Office Furniture",
  budget: 2000,
};

console.log(assignUser(client));


