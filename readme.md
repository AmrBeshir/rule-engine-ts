# Simple Rule Engine Using Typescript

## Description

This is a simple rule engine using typescript that can be extended in any to fit the bussiness rules. This Project uses the property of javascript function pointers to divided a rule into a condition and an action.

## Explaining By Example

### Use Case

In this example we consider ourselves a company with 4 Employees, Joe Miller, Adam Willy, Joshua Eliot and their manager Michael Scott.

```typescript
export interface User {
  id: number;
  name: string;
}
const employees: User[] = [
  { id: 1, name: "Joe Miller" },
  { id: 2, name: "Adam Willy" },
  { id: 3, name: "Joshua Eliot" },
  { id: 4, name: "Michael Scott (Regional Manager)" },
];
```

Our company has a website which clients can fill in forms so one of our salesman can reach out to them, the form requires the client to input their name, phone, what are product are they interested in and their budget:

```typescript
export interface Client {
  id: number;
  name: string;
  phone: string;
  pointOfInterest: string;
  budget: number;
}
const client: Client = {
  id: 1,
  name: "John Doe",
  phone: "1234567890",
  pointOfInterest: "Office Funiture",
  budget: 2000,
};
```

The company sells 3 products. Office Furniture, Home Furniture and Plumbing Fixtures. Joe handles Office Furniture sales, Adam works with Home Furniture sales and finally Joshua works with Plumbing fixtures. Michael, their Manager can handle customers that wish to buy any kind of products, but mainly Michaels works with big clients (in this example big client is any client with a budget over 10000 dollars).

so these are our rules:

```typescript
const rules: Rule[] = [
  //Creating a new Rule where the point of interest is Office Furniture then Both Joe Miller(id = 1) and Michael Scott(id = 4) can work with them
  new StringRule("pointOfInterest", "Office Furniture", [1, 4]),
  //Same Point but this time Home Furnture rule (id 2 is Adam Willy).
  new StringRule("pointOfInterest", "Home Furniture", [2, 4]),
  new StringRule("pointOfInterest", "Plumbing Fixtures", [3, 4]),
  // Finally if the client budger it greater than 10000 then only Michael can work with them.
  new NumberRule("budget", 10000, [4], "greater"),
];
```

### Creating a Selection Engine

Now we want to assign our sample client to the most suitable employee, but first we have to explain the selection engine approach. the selection engine works by taking a pool of Employees (this can be changed to whatever suits the use case) and filters out the Employees that do not fit the rules criteria.

```typescript
export class SelectionEngine {
  private rules: Rule[] = [];
  private pool: User[] = [];

  constructor(rules: Rule[], pool: User[]) {
    this.rules = rules;
    this.pool = pool;
  }

  public run(state: any) {
    let result = this.pool;
    for (const rule of this.rules) {
      if (rule.condition(state)) {
        result = rule.action(result);
      }
    }
    return result;
  }
}
```

We consider that we have 2 types of rules, a matching string or a number value:

```typescript
export class StringRule implements Rule {
  propertyName: string;
  propertyValue: string;
  eligibleUsersIds: number[];

  constructor(
    propertyName: string,
    propertyValue: string,
    eligibleUsersIds: number[]
  ) {
    this.propertyName = propertyName;
    this.propertyValue = propertyValue;
    this.eligibleUsersIds = eligibleUsersIds;
  }

  condition: (state: any) => boolean = (state: any) => {
    // returns true if the state property matches the rule's value
    return state[this.propertyName] === this.propertyValue;
  };

  action: (selectionState?: any[]) => any = (selectionState?: any[]) => {
    //returns of the users that fit this rule
    return selectionState?.filter((user) =>
      this.eligibleUsersIds.includes(user.id)
    );
  };
}

export class NumberRule implements Rule {
  propertyName: string;
  propertyValue: number;
  eligibleUsersIds: number[];
  propertyCondition: "greater" | "less" | "equal";

  constructor(
    propertyName: string,
    propertyValue: number,
    eligibleUsersIds: number[],
    propertyCondition?: "greater" | "less" | "equal"
  ) {
    this.propertyName = propertyName;
    this.propertyValue = propertyValue;
    this.eligibleUsersIds = eligibleUsersIds;
    this.propertyCondition = propertyCondition ?? "equal";
  }

  condition: (state: any) => boolean | undefined = (state: any) => {
    //Check for the number rule property condition to find out how we should compare our value and property accordingly
    switch (this.propertyCondition) {
      case "greater":
        return state[this.propertyName] > this.propertyValue;
      case "less":
        return state[this.propertyName] < this.propertyValue;
      case "equal":
        return state[this.propertyName] === this.propertyValue;
      default:
        return state[this.propertyName] === this.propertyValue;
    }
  };

  action: (selectionState?: any[]) => any = (selectionState?: any[]) => {
    return selectionState?.filter((user) =>
      this.eligibleUsersIds.includes(user.id)
    );
  };
}
```

Now we can implement our assgin to employee function:

```typescript
const assignUser = (client: Client) => {
  //initialize our pool of employees
  const pool: User[] = [
    { id: 1, name: "Joe Miller" },
    { id: 2, name: "Adam Willy" },
    { id: 3, name: "Joshua Eliot" },
    { id: 4, name: "Michael Scott (Regional Manager)" },
  ];
  //initialize our rules in an array
  const rules: Rule[] = [
    new StringRule("pointOfInterest", "Office Furniture", [1, 4]),
    new StringRule("pointOfInterest", "Home Furniture", [2, 4]),
    new StringRule("pointOfInterest", "Plumbing Fixtures", [3, 4]),
    new NumberRule("budget", 10000, [4], "greater"),
  ];
  //initialize our engine
  const selectionEngine = new SelectionEngine(rules, pool);
  //our engine returns all ths suitable employees
  const eligibleUsers = selectionEngine.run(client);
  return eligibleUsers;
};

//example client
const client: Client = {
  id: 1,
  name: "John Doe",
  phone: "1234567890",
  pointOfInterest: "Office Furniture",
  budget: 2000,
};

//with the current example client this should return both Joe Miller and Michael Scott
console.log(assignUser(client));
```

PS: you will notice that if none of ours rules fit the engine this will return the whole pool of users even tho none of them is fit for it. this could be changed depending the indented logic but in this use case it fits since every client must assigned to an employee even if does not fit any of their rules.