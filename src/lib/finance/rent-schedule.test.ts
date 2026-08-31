import { describe, expect, it } from "vitest";

import { computeRentScheduleStatus } from "./rent-schedule";

const today = new Date("2026-09-15");

describe("computeRentScheduleStatus", () => {
  it("est PAYÉ quand le montant payé couvre le dû", () => {
    expect(
      computeRentScheduleStatus({
        dueDate: new Date("2026-09-05"),
        totalDue: 1_100,
        totalPaid: 1_100,
        today,
      })
    ).toBe("paid");
  });

  it("est PAYÉ même en cas de trop-perçu", () => {
    expect(
      computeRentScheduleStatus({
        dueDate: new Date("2026-09-05"),
        totalDue: 1_100,
        totalPaid: 1_200,
        today,
      })
    ).toBe("paid");
  });

  it("est PARTIELLEMENT PAYÉ quand une partie seulement est réglée", () => {
    expect(
      computeRentScheduleStatus({
        dueDate: new Date("2026-09-05"),
        totalDue: 1_100,
        totalPaid: 500,
        today,
      })
    ).toBe("partial");
  });

  it("est EN RETARD quand la date est dépassée et rien n'est payé", () => {
    expect(
      computeRentScheduleStatus({
        dueDate: new Date("2026-09-05"),
        totalDue: 1_100,
        totalPaid: 0,
        today,
      })
    ).toBe("late");
  });

  it("est EN ATTENTE pour une échéance future non payée", () => {
    expect(
      computeRentScheduleStatus({
        dueDate: new Date("2026-10-05"),
        totalDue: 1_100,
        totalPaid: 0,
        today,
      })
    ).toBe("pending");
  });
});
