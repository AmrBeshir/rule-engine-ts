import { Client, User } from "./state";

export interface Rule {
  condition: (state: any) => boolean | Promise<boolean> | undefined;
  action: (state?: any) => any | Promise<any> | void;
}

export class Engine {
  private rules: Rule[] = [];

  constructor(rules: Rule[]) {
    this.rules = rules;
  }

  public execute(state: any) {
    for (const rule of this.rules) {
      if (rule.condition(state)) {
        return rule.action(state);
      }
    }
  }

  public async executeAsync(state: any) {
    for (const rule of this.rules) {
      if (await rule.condition(state)) {
        return await rule.action(state);
      }
    }
  }

  public executeAll(state: any) {
    for (const rule of this.rules) {
      if (rule.condition(state)) {
        rule.action(state);
      }
    }
  }
}

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
    return state[this.propertyName] === this.propertyValue;
  };

  action: (selectionState?: any[]) => any = (selectionState?: any[]) => {
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
    if (this.propertyCondition === "greater") {
      return state[this.propertyName] > this.propertyValue;
    }
    if (this.propertyCondition === "less") {
      return state[this.propertyName] < this.propertyValue;
    }
    if (this.propertyCondition === "equal") {
      return state[this.propertyName] === this.propertyValue;
    }
  };

  action: (selectionState?: any[]) => any = (selectionState?: any[]) => {
    return selectionState?.filter((user) =>
      this.eligibleUsersIds.includes(user.id)
    );
  };
}

export class SelectionEngine {
  private rules: Rule[] = [];
  private pool: User[] = [];

  constructor(rules: Rule[], pool: User[]) {
    this.rules = rules;
    this.pool = pool;
  }

  public runIfAll(state: any) {
    let result = this.pool;
    for (const rule of this.rules) {
      if (rule.condition(state)) {
        result = rule.action(result);
      }
    }
    return result;
  }

  public runIfAny(state: any) {
    let result: User[] = [];
    for (const rule of this.rules) {
      if (rule.condition(state)) {
        result = [...result, ...rule.action(this.pool)];
      }
    }
    return Array.from(new Set(result));
  }
}
