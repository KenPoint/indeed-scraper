// 📦 Установи Playwright:
// npm install express playwright

const express = require("express");
const { chromium } = require("playwright");
const app = express();

app.use(express.json());

app.post("/scrape", async (req, res) => {
  const jobUrl = req.body.url;
  if (!jobUrl) {
    return res.status(400).json({ error: "Missing 'url' in request body" });
  }

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(jobUrl, { waitUntil: "domcontentloaded", timeout: 30000 });

    const jobTitle = await page.locator("h1").first().innerText().catch(() => "");
    const description = await page
      .locator(".jobsearch-jobDescriptionText")
      .first()
      .innerText()
      .catch(() => "");

    res.json({
      success: true,
      url: jobUrl,
      job_title: jobTitle,
      description: description.slice(0, 3000),
    });
  } catch (err) {
    console.error("Scraping error:", err);
    res.status(500).json({ error: "Failed to scrape job page", details: err.message });
  } finally {
    if (browser) await browser.close();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Scraper API listening on port ${PORT}`);
});
