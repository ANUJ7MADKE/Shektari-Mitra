import { test, expect } from "@playwright/test"
import { initialState, STORAGE_KEY } from "../src/lib/model"

test("pump state survives navigation, enforces power rules and auto-shuts off", async ({
  page,
}) => {
  await page.goto("/farmer/pump")
  await page.getByRole("button", { name: "Start sample pump" }).click()
  await expect(
    page.getByRole("button", { name: "Stop sample pump" }),
  ).toBeVisible()
  await page.getByRole("button", { name: "Home", exact: true }).last().click()
  await expect(page.getByText("ON — Running")).toBeVisible()
  await page.getByText("Sample controls", { exact: true }).click()
  await page.getByRole("slider", { name: "Sample moisture" }).fill("80")
  await expect(page.getByText("OFF — Standby")).toBeVisible()
  await page.getByRole("button", { name: "Pump Control", exact: true }).click()
  await page.getByRole("button", { name: "Start sample pump" }).click()
  await expect(page.getByRole("alert")).toContainText("shutoff limit")
  await page.getByRole("checkbox", { name: "Auto-shutoff at 80%" }).uncheck()
  await page.getByRole("checkbox", { name: "Grid power available" }).uncheck()
  await page.getByRole("button", { name: "Start sample pump" }).click()
  await expect(page.getByRole("alert")).toContainText("unavailable")
  await page.reload()
  await expect(
    page.getByRole("checkbox", { name: "Grid power available" }),
  ).not.toBeChecked()
  await expect(
    page.getByRole("checkbox", { name: "Auto-shutoff at 80%" }),
  ).not.toBeChecked()
  await page.getByRole("checkbox", { name: "Grid power available" }).check()
  await page.getByRole("checkbox", { name: "Sample night slot" }).uncheck()
  await page.getByRole("button", { name: "Start sample pump" }).click()
  await expect(page.getByRole("alert")).toContainText("Night-only")
})

test("pump simulation advances moisture and stops automatically at its threshold", async ({
  page,
}) => {
  await page.clock.install()
  await page.goto("/farmer/pump")
  await page.getByRole("button", { name: "Start sample pump" }).click()
  await page.clock.runFor(21000)
  await expect(page.getByText("Current moisture: 80%")).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Start sample pump" }),
  ).toBeVisible()
})

test("officer advice, filters and visits share local state with farmer", async ({
  page,
}) => {
  await page.goto("/officer")
  await page.getByRole("button", { name: "View details for P-102" }).click()
  await expect(
    page.getByRole("heading", { name: "Field Diagnostic: Sunita More" }),
  ).toBeVisible()
  await page.getByLabel("Selected plot").selectOption("P-101")
  await page
    .getByLabel("Officer advice")
    .fill("Check drainage before the next irrigation.")
  await page.getByLabel("Auto-shutoff threshold (%)").fill("75")
  await page
    .getByRole("button", { name: "Log Advice & Save Threshold" })
    .click()
  await page.goto("/farmer")
  await expect(
    page.getByText("Check drainage before the next irrigation."),
  ).toBeVisible()
  await expect(page.getByText("Safe range: 60–75%")).toBeVisible()
  await page.goto("/officer/filter")
  await page
    .getByRole("checkbox", { name: "Select P-101", exact: true })
    .check()
  await page.getByLabel("Visit notes").fill("Drainage review")
  await page
    .getByRole("button", { name: "Schedule Field Visits", exact: true })
    .click()
  await page.reload()
  await expect(page.getByText("Drainage review")).toBeVisible()
  await page.getByRole("button", { name: "Mark complete" }).click()
  await expect(page.getByText(/P-101 · completed/)).toBeVisible()
  await page.getByLabel("Soil Type").selectOption("Red Soil")
  await expect(
    page.getByRole("heading", { name: "Matching Plots (0)" }),
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Schedule Field Visits", exact: true }),
  ).toBeDisabled()
})

test("voice answers from selected field, language and reports persist", async ({
  page,
}) => {
  await page.goto("/farmer")
  await page.getByLabel("Active Field").selectOption("P-107")
  await expect(page.getByRole("meter")).toHaveAttribute("aria-valuenow", "57")
  await page.getByRole("button", { name: "Voice", exact: true }).click()
  await page
    .getByRole("textbox", { name: "Type a question" })
    .fill("What is the soil moisture?")
  await page.getByRole("button", { name: "Send", exact: true }).click()
  await expect(
    page.getByText(/Soil moisture is low at 57%/).last(),
  ).toBeVisible()
  await page.reload()
  await expect(page.getByText("What is the soil moisture?")).toBeVisible()
  await page.getByRole("button", { name: "Reports", exact: true }).click()
  const downloaded = page.waitForEvent("download")
  await page.getByRole("button", { name: "Download Mill Summary PDF" }).click()
  expect((await downloaded).suggestedFilename()).toMatch(/P-107.*\.pdf$/)
  await page.getByLabel("Report period").selectOption({ index: 2 })
  await expect(page.getByText("No readings for this period.")).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Download Mill Summary PDF" }),
  ).toBeDisabled()
  await page.goto("/farmer")
  await page.getByRole("button", { name: "मराठी", exact: true }).click()
  await page.reload()
  await expect(page.getByRole("button", { name: "पंप नियंत्रण" })).toBeVisible()
})

test("backup, reset and corrupt storage recovery preserve feedback separately", async ({
  page,
}) => {
  await page.goto("/data")
  const downloaded = page.waitForEvent("download")
  await page.getByRole("button", { name: "Download backup JSON" }).click()
  expect((await downloaded).suggestedFilename()).toBe(
    "shetkari-mitra-backup.json",
  )
  await page.evaluate(
    (key) => localStorage.setItem(key, "{bad-json"),
    STORAGE_KEY,
  )
  await page.reload()
  await expect(page.getByRole("alert")).toContainText("preserved")
  await page.getByRole("button", { name: "Reset local activity" }).click()
  await page.getByRole("button", { name: "Confirm reset" }).click()
  await expect(page.getByRole("alert")).toHaveCount(0)
  const backup = initialState()
  backup.plots[0].moisture = 66
  await page
    .getByLabel("Restore an activity backup")
    .setInputFiles({
      name: "backup.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(backup)),
    })
  await page
    .getByRole("button", { name: "Restore backup", exact: true })
    .click()
  await page.goto("/farmer")
  await expect(page.getByRole("meter")).toHaveAttribute("aria-valuenow", "66")
})

test("mobile officer and farmer layouts fit the viewport, deep links and back navigation work", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  for (const route of [
    "/farmer",
    "/farmer/pump",
    "/farmer/voice",
    "/farmer/reports",
    "/officer",
    "/officer/filter",
    "/officer/diagnostic/P-102",
    "/officer/millreport",
    "/feedback",
    "/data",
  ]) {
    await page.goto(route)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    if (route === "/farmer" || route === "/officer")
      await page.screenshot({
        path: `playwright-report/${route.slice(1)}-mobile.png`,
        fullPage: true,
      })
  }
  await page.goto("/farmer")
  await page.getByRole("button", { name: "Pump Control", exact: true }).click()
  await page.goBack()
  await expect(page.getByLabel("Active Field")).toBeVisible()
})

test("feedback validation remains usable without submitting test rows to Turso", async ({
  page,
}) => {
  await page.goto("/feedback")
  await page.getByRole("button", { name: "Submit Feedback" }).click()
  await expect(page.getByText("Please enter your name.")).toBeVisible()
  await page.getByPlaceholder("Enter your name").fill("Browser validation")
  await page.getByRole("button", { name: "Submit Feedback" }).click()
  await expect(page.getByText(/Please rate all criteria/)).toBeVisible()
  await page.getByRole("button", { name: "2", exact: true }).first().click()
  await expect(
    page.getByPlaceholder("Describe what went wrong with task completion..."),
  ).toBeVisible()
})
