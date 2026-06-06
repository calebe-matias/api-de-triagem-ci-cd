import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { PNG } from "pngjs";

const width = 1400;
const height = 900;
const margin = { top: 165, right: 80, bottom: 190, left: 130 };
const colors = {
  background: [255, 255, 255, 255],
  axis: [30, 41, 59, 255],
  grid: [226, 232, 240, 255],
  text: [15, 23, 42, 255],
  muted: [100, 116, 139, 255],
  blue: [37, 99, 235, 255],
  teal: [13, 148, 136, 255],
  green: [22, 163, 74, 255],
  red: [220, 38, 38, 255],
  orange: [234, 88, 12, 255],
  purple: [124, 58, 237, 255]
};

const font = {
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
  "!": ["00100", "00100", "00100", "00100", "00100", "00000", "00100"],
  "#": ["01010", "01010", "11111", "01010", "11111", "01010", "01010"],
  "%": ["11001", "11010", "00100", "01000", "10110", "00110", "00000"],
  "(": ["00010", "00100", "01000", "01000", "01000", "00100", "00010"],
  ")": ["01000", "00100", "00010", "00010", "00010", "00100", "01000"],
  "+": ["00000", "00100", "00100", "11111", "00100", "00100", "00000"],
  ",": ["00000", "00000", "00000", "00000", "00110", "00100", "01000"],
  "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
  ".": ["00000", "00000", "00000", "00000", "00000", "00110", "00110"],
  "/": ["00001", "00010", "00100", "01000", "10000", "00000", "00000"],
  ":": ["00000", "00110", "00110", "00000", "00110", "00110", "00000"],
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
  "A": ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  "B": ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  "C": ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  "D": ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  "E": ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  "F": ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  "G": ["01111", "10000", "10000", "10111", "10001", "10001", "01110"],
  "H": ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  "I": ["01110", "00100", "00100", "00100", "00100", "00100", "01110"],
  "J": ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
  "K": ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  "L": ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  "M": ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  "N": ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  "O": ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  "P": ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  "Q": ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  "R": ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  "S": ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  "T": ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  "U": ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  "V": ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  "W": ["10001", "10001", "10001", "10101", "10101", "10101", "01010"],
  "X": ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  "Y": ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  "Z": ["11111", "00001", "00010", "00100", "01000", "10000", "11111"]
};

function readMetrics() {
  if (!existsSync("metrics/runs.json")) {
    throw new Error("metrics/runs.json not found. Run npm run metrics:collect first.");
  }

  return JSON.parse(readFileSync("metrics/runs.json", "utf8"));
}

function uniqueRuns(rows) {
  const runs = new Map();

  for (const row of rows) {
    if (!runs.has(row.run_id)) {
      runs.set(row.run_id, {
        ...row,
        exp: row.commit_message.split(":")[0].toUpperCase()
      });
    }
  }

  return [...runs.values()];
}

function uniqueJobs(rows) {
  const jobs = new Map();

  for (const row of rows) {
    const key = `${row.run_id}|${row.job_name}`;
    if (!jobs.has(key)) {
      jobs.set(key, row);
    }
  }

  return [...jobs.values()];
}

function setPixel(image, x, y, color) {
  if (x < 0 || y < 0 || x >= image.width || y >= image.height) {
    return;
  }

  const index = (Math.round(y) * image.width + Math.round(x)) * 4;
  image.data[index] = color[0];
  image.data[index + 1] = color[1];
  image.data[index + 2] = color[2];
  image.data[index + 3] = color[3] ?? 255;
}

function rect(image, x, y, w, h, color) {
  for (let yy = Math.max(0, Math.round(y)); yy < Math.min(image.height, Math.round(y + h)); yy += 1) {
    for (let xx = Math.max(0, Math.round(x)); xx < Math.min(image.width, Math.round(x + w)); xx += 1) {
      setPixel(image, xx, yy, color);
    }
  }
}

function line(image, x0, y0, x1, y1, color, thickness = 2) {
  const steps = Math.max(Math.abs(Math.round(x1 - x0)), Math.abs(Math.round(y1 - y0)), 1);

  for (let step = 0; step <= steps; step += 1) {
    const ratio = step / steps;
    const x = x0 + (x1 - x0) * ratio;
    const y = y0 + (y1 - y0) * ratio;
    rect(image, x - thickness / 2, y - thickness / 2, thickness, thickness, color);
  }
}

function circle(image, cx, cy, radius, color) {
  for (let y = -radius; y <= radius; y += 1) {
    for (let x = -radius; x <= radius; x += 1) {
      if (x * x + y * y <= radius * radius) {
        setPixel(image, cx + x, cy + y, color);
      }
    }
  }
}

function textWidth(text, size = 3) {
  return text.toUpperCase().length * 6 * size;
}

function drawText(image, text, x, y, size = 3, color = colors.text, align = "left") {
  const normalized = text.toUpperCase();
  let cursorX = align === "center" ? x - textWidth(normalized, size) / 2 : x;

  if (align === "right") {
    cursorX = x - textWidth(normalized, size);
  }

  for (const char of normalized) {
    const glyph = font[char] ?? font[" "];
    glyph.forEach((row, rowIndex) => {
      [...row].forEach((pixel, colIndex) => {
        if (pixel === "1") {
          rect(image, cursorX + colIndex * size, y + rowIndex * size, size, size, color);
        }
      });
    });
    cursorX += 6 * size;
  }
}

function newCanvas(title, subtitle) {
  const image = new PNG({ width, height });
  rect(image, 0, 0, width, height, colors.background);
  drawText(image, title, margin.left, 34, 5, colors.text);
  drawText(image, subtitle, margin.left, 82, 3, colors.muted);
  return image;
}

function save(image, path) {
  writeFileSync(path, PNG.sync.write(image));
  console.log(`Wrote ${path}`);
}

function chartBounds() {
  return {
    left: margin.left,
    right: width - margin.right,
    top: margin.top,
    bottom: height - margin.bottom,
    chartWidth: width - margin.left - margin.right,
    chartHeight: height - margin.top - margin.bottom
  };
}

function yScale(value, max) {
  const bounds = chartBounds();
  return bounds.bottom - (value / Math.max(max, 1)) * bounds.chartHeight;
}

function drawAxes(image, maxY, yLabel, xLabel) {
  const bounds = chartBounds();
  line(image, bounds.left, bounds.top, bounds.left, bounds.bottom, colors.axis, 3);
  line(image, bounds.left, bounds.bottom, bounds.right, bounds.bottom, colors.axis, 3);

  for (let index = 0; index <= 5; index += 1) {
    const value = Math.round((maxY / 5) * index);
    const y = yScale(value, maxY);
    line(image, bounds.left, y, bounds.right, y, colors.grid, 1);
    drawText(image, String(value), bounds.left - 18, y - 10, 3, colors.muted, "right");
  }

  drawText(image, yLabel, 28, bounds.top + 170, 3, colors.muted);
  drawText(image, xLabel, bounds.left + bounds.chartWidth / 2, height - 55, 3, colors.muted, "center");
}

function drawLegend(image, entries, x, y) {
  let cursorX = x;

  for (const entry of entries) {
    rect(image, cursorX, y + 4, 18, 18, entry.color);
    drawText(image, entry.label, cursorX + 28, y, 3, colors.muted);
    cursorX += 28 + textWidth(entry.label, 3) + 30;
  }
}

function niceMax(values, minMax = 10) {
  const max = Math.max(...values, minMax);
  return Math.ceil((max * 1.12) / 10) * 10;
}

function chartWorkflowDuration(runs) {
  const image = newCanvas("Workflow duration by run", "Total GitHub Actions time in seconds for each experiment run");
  const maxY = niceMax(runs.map((run) => Number(run.workflow_duration)));
  const bounds = chartBounds();
  const slot = bounds.chartWidth / runs.length;
  const barWidth = Math.min(62, slot * 0.58);

  drawAxes(image, maxY, "SECONDS", "EXPERIMENT RUN");
  drawLegend(
    image,
    [
      { label: "SUCCESS", color: colors.blue },
      { label: "FAILURE", color: colors.red }
    ],
    bounds.left,
    120
  );

  runs.forEach((run, index) => {
    const value = Number(run.workflow_duration);
    const x = bounds.left + index * slot + slot / 2 - barWidth / 2;
    const y = yScale(value, maxY);
    const color = run.status === "success" ? colors.blue : colors.red;
    rect(image, x, y, barWidth, bounds.bottom - y, color);
    drawText(image, `${value}S`, x + barWidth / 2, y - 28, 3, colors.text, "center");
    drawText(image, run.exp, x + barWidth / 2, bounds.bottom + 18, 3, colors.muted, "center");
    drawText(image, run.status === "success" ? "OK" : "FAIL", x + barWidth / 2, bounds.bottom + 48, 2, color, "center");
  });

  return image;
}

function chartJobDuration(rows) {
  const image = newCanvas("Average duration by job", "Mean job duration across the 12 measured workflow runs");
  const jobs = uniqueJobs(rows);
  const averages = [...new Set(jobs.map((job) => job.job_name))].map((name) => {
    const values = jobs.filter((job) => job.job_name === name).map((job) => Number(job.job_duration));
    return {
      name,
      value: values.reduce((total, value) => total + value, 0) / values.length
    };
  });
  const maxY = niceMax(averages.map((entry) => entry.value));
  const bounds = chartBounds();
  const slot = bounds.chartWidth / averages.length;
  const barWidth = Math.min(190, slot * 0.55);
  const palette = [colors.teal, colors.purple, colors.orange];

  drawAxes(image, maxY, "SECONDS", "PIPELINE JOB");

  averages.forEach((entry, index) => {
    const x = bounds.left + index * slot + slot / 2 - barWidth / 2;
    const y = yScale(entry.value, maxY);
    rect(image, x, y, barWidth, bounds.bottom - y, palette[index % palette.length]);
    drawText(image, `${entry.value.toFixed(1)}S`, x + barWidth / 2, y - 32, 4, colors.text, "center");
    drawText(image, entry.name.replace(" dependencies", ""), x + barWidth / 2, bounds.bottom + 22, 3, colors.muted, "center");
  });

  drawText(image, "INSTALL IS REPEATED PER JOB TO KEEP JOBS ISOLATED", bounds.left, height - 95, 3, colors.muted);
  return image;
}

function chartSuccessFailure(runs) {
  const image = newCanvas("Workflow status rate", "Successful and failed executions in the controlled experiment");
  const success = runs.filter((run) => run.status === "success").length;
  const failure = runs.length - success;
  const total = runs.length;
  const values = [
    { label: "SUCCESS", value: success, color: colors.green },
    { label: "FAILURE", value: failure, color: colors.red }
  ];
  const bounds = chartBounds();
  const maxY = total;
  const slot = bounds.chartWidth / values.length;
  const barWidth = 240;

  drawAxes(image, maxY, "RUNS", "WORKFLOW CONCLUSION");

  values.forEach((entry, index) => {
    const x = bounds.left + index * slot + slot / 2 - barWidth / 2;
    const y = yScale(entry.value, maxY);
    const percentage = Math.round((entry.value / total) * 100);
    rect(image, x, y, barWidth, bounds.bottom - y, entry.color);
    drawText(image, `${entry.value}/${total}`, x + barWidth / 2, y - 68, 5, colors.text, "center");
    drawText(image, `${percentage}%`, x + barWidth / 2, y - 24, 3, colors.muted, "center");
    drawText(image, entry.label, x + barWidth / 2, bounds.bottom + 24, 4, colors.muted, "center");
  });

  drawText(image, "FAILURES WERE PLANNED: EXP04 TEST FAILURE AND EXP11 LINT FAILURE", bounds.left, height - 95, 3, colors.muted);
  return image;
}

function chartTestsVsDuration(runs) {
  const image = newCanvas("Test count and workflow duration", "Duration bars and test line by run");
  const maxDuration = niceMax(runs.map((run) => Number(run.workflow_duration)));
  const maxTests = niceMax(runs.map((run) => Number(run.test_count)), 20);
  const bounds = chartBounds();
  const slot = bounds.chartWidth / runs.length;
  const barWidth = Math.min(58, slot * 0.5);
  const testPoints = [];

  drawAxes(image, maxDuration, "SECONDS", "EXPERIMENT RUN");
  line(image, bounds.right, bounds.top, bounds.right, bounds.bottom, colors.axis, 3);
  drawLegend(
    image,
    [
      { label: "DURATION", color: colors.blue },
      { label: "TESTS", color: colors.orange },
      { label: "FAILED RUN", color: colors.red }
    ],
    bounds.left,
    120
  );

  for (let index = 0; index <= 5; index += 1) {
    const value = Math.round((maxTests / 5) * index);
    const y = bounds.bottom - (value / maxTests) * bounds.chartHeight;
    drawText(image, String(value), bounds.right + 18, y - 10, 3, colors.orange);
  }
  drawText(image, "TESTS", bounds.right - 50, bounds.top - 35, 3, colors.orange);

  runs.forEach((run, index) => {
    const duration = Number(run.workflow_duration);
    const testCount = Number(run.test_count);
    const centerX = bounds.left + index * slot + slot / 2;
    const barX = centerX - barWidth / 2;
    const barY = yScale(duration, maxDuration);
    const barColor = run.status === "success" ? colors.blue : colors.red;
    const testY = bounds.bottom - (testCount / maxTests) * bounds.chartHeight;

    rect(image, barX, barY, barWidth, bounds.bottom - barY, barColor);
    drawText(image, `${duration}S`, centerX, barY - 24, 2, colors.text, "center");
    drawText(image, run.exp, centerX, bounds.bottom + 18, 3, colors.muted, "center");
    drawText(image, run.status === "success" ? "OK" : "FAIL", centerX, bounds.bottom + 48, 2, barColor, "center");
    testPoints.push({ x: centerX, y: testY, tests: testCount });
  });

  for (let index = 1; index < testPoints.length; index += 1) {
    line(image, testPoints[index - 1].x, testPoints[index - 1].y, testPoints[index].x, testPoints[index].y, colors.orange, 4);
  }

  for (const point of testPoints) {
    circle(image, point.x, point.y, 8, colors.orange);
    drawText(image, `${point.tests}T`, point.x, point.y - 28, 2, colors.orange, "center");
  }

  drawText(image, "EXP11 HAS ZERO TESTS BECAUSE LINT FAILED BEFORE THE TEST JOB", bounds.left, height - 95, 3, colors.muted);
  return image;
}

mkdirSync("reports/charts", { recursive: true });
const rows = readMetrics();
const runs = uniqueRuns(rows);

save(chartWorkflowDuration(runs), "reports/charts/workflow-duration.png");
save(chartJobDuration(rows), "reports/charts/job-duration.png");
save(chartSuccessFailure(runs), "reports/charts/success-failure-rate.png");
save(chartTestsVsDuration(runs), "reports/charts/tests-vs-duration.png");
