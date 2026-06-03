import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { PNG } from "pngjs";

const width = 1100;
const height = 700;
const margin = { top: 60, right: 50, bottom: 120, left: 90 };

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
      runs.set(row.run_id, row);
    }
  }

  return [...runs.values()];
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

function line(image, x0, y0, x1, y1, color) {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  let x = Math.round(x0);
  let y = Math.round(y0);

  while (true) {
    rect(image, x - 1, y - 1, 3, 3, color);

    if (x === Math.round(x1) && y === Math.round(y1)) {
      break;
    }

    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
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

function newCanvas() {
  const image = new PNG({ width, height });
  rect(image, 0, 0, width, height, [255, 255, 255, 255]);
  rect(image, margin.left, margin.top, 2, height - margin.top - margin.bottom, [40, 48, 60, 255]);
  rect(image, margin.left, height - margin.bottom, width - margin.left - margin.right, 2, [40, 48, 60, 255]);
  return image;
}

function save(image, path) {
  writeFileSync(path, PNG.sync.write(image));
  console.log(`Wrote ${path}`);
}

function scaleY(value, max) {
  const chartHeight = height - margin.top - margin.bottom;
  return height - margin.bottom - (value / Math.max(max, 1)) * chartHeight;
}

function chartWorkflowDuration(runs) {
  const image = newCanvas();
  const max = Math.max(...runs.map((run) => Number(run.workflow_duration)), 1);
  const chartWidth = width - margin.left - margin.right;
  const step = chartWidth / Math.max(runs.length - 1, 1);
  const points = runs.map((run, index) => ({
    x: margin.left + index * step,
    y: scaleY(Number(run.workflow_duration), max)
  }));

  for (let index = 1; index < points.length; index += 1) {
    line(image, points[index - 1].x, points[index - 1].y, points[index].x, points[index].y, [36, 99, 235, 255]);
  }

  for (const point of points) {
    circle(image, point.x, point.y, 6, [20, 70, 180, 255]);
  }

  return image;
}

function chartJobDuration(rows) {
  const image = newCanvas();
  const jobs = new Map();

  for (const row of rows) {
    const current = jobs.get(row.job_name) ?? [];
    current.push(Number(row.job_duration));
    jobs.set(row.job_name, current);
  }

  const averages = [...jobs.entries()].map(([job, values]) => ({
    job,
    value: values.reduce((total, value) => total + value, 0) / values.length
  }));
  const max = Math.max(...averages.map((entry) => entry.value), 1);
  const chartWidth = width - margin.left - margin.right;
  const barWidth = chartWidth / Math.max(averages.length, 1) - 30;

  averages.forEach((entry, index) => {
    const x = margin.left + 20 + index * (barWidth + 30);
    const y = scaleY(entry.value, max);
    rect(image, x, y, barWidth, height - margin.bottom - y, [38, 166, 154, 255]);
  });

  return image;
}

function chartSuccessFailure(runs) {
  const image = newCanvas();
  const success = runs.filter((run) => run.status === "success").length;
  const failure = runs.length - success;
  const total = Math.max(runs.length, 1);
  const successHeight = ((height - margin.top - margin.bottom) * success) / total;
  const failureHeight = ((height - margin.top - margin.bottom) * failure) / total;

  rect(image, margin.left + 180, height - margin.bottom - successHeight, 180, successHeight, [48, 160, 88, 255]);
  rect(image, margin.left + 500, height - margin.bottom - failureHeight, 180, failureHeight, [215, 72, 72, 255]);
  return image;
}

function chartTestsVsDuration(runs) {
  const image = newCanvas();
  const maxTests = Math.max(...runs.map((run) => Number(run.test_count)), 1);
  const maxDuration = Math.max(...runs.map((run) => Number(run.workflow_duration)), 1);
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  for (const run of runs) {
    const x = margin.left + (Number(run.test_count) / maxTests) * chartWidth;
    const y = height - margin.bottom - (Number(run.workflow_duration) / maxDuration) * chartHeight;
    const color = run.status === "success" ? [36, 99, 235, 255] : [215, 72, 72, 255];
    circle(image, x, y, 7, color);
  }

  return image;
}

mkdirSync("reports/charts", { recursive: true });
const rows = readMetrics();
const runs = uniqueRuns(rows);

save(chartWorkflowDuration(runs), "reports/charts/workflow-duration.png");
save(chartJobDuration(rows), "reports/charts/job-duration.png");
save(chartSuccessFailure(runs), "reports/charts/success-failure-rate.png");
save(chartTestsVsDuration(runs), "reports/charts/tests-vs-duration.png");

