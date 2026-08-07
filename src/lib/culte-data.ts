export type CulteType = "dim" | "mer";

export type CulteVisitor = {
  name: string;
  registeredBy: string;
};

export type CulteDayReport = {
  date: string;
  type: CulteType;
  visitors: CulteVisitor[];
};
