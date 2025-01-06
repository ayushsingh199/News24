const API_KEY = import.meta.env.VITE_NEWS_API;
const url = "https://newsapi.org/v2/everything?q=";

function analyzeSentiment(text) {
  const positiveWords = new Set([
    "good",
    "great",
    "awesome",
    "excellent",
    "happy",
    "positive",
    "success",
    "breakthrough",
    "win",
    "winning",
    "progress",
    "achieve",
    "achievement",
    "improve",
    "improvement",
    "benefit",
    "innovative",
    "innovation",
  ]);

  const negativeWords = new Set([
    "bad",
    "terrible",
    "awful",
    "poor",
    "negative",
    "fail",
    "failure",
    "crisis",
    "problem",
    "disaster",
    "conflict",
    "decline",
    "crash",
    "risk",
    "threat",
    "warning",
    "danger",
    "dangerous",
  ]);

  // Convert text to lowercase for comparison
  const lowercaseText = text.toLowerCase();
  const words = lowercaseText.match(/\b\w+\b/g) || [];

  // Count positive and negative words
  let positiveCount = 0;
  let negativeCount = 0;

  words.forEach((word) => {
    if (positiveWords.has(word)) positiveCount++;
    if (negativeWords.has(word)) negativeCount++;
  });

  // Determine sentiment
  if (positiveCount > negativeCount) {
    return "positive";
  } else if (negativeCount > positiveCount) {
    return "negative";
  } else {
    return "neutral";
  }
}

function getSentimentIcon(sentiment) {
  switch (sentiment) {
    case "positive":
      return "fa-solid fa-smile";
    case "negative":
      return "fa-solid fa-frown";
    default:
      return "fa-solid fa-meh";
  }
}

window.addEventListener("load", () => fetchNews("India"));

function reload() {
  window.location.reload();
}

async function fetchNews(query) {
  const res = await fetch(`${url}${query}&apiKey=${API_KEY}`);
  const data = await res.json();
  bindData(data.articles);
}

function bindData(articles) {
  const cardsContainer = document.getElementById("cards-container");
  const newsCardTemplate = document.getElementById("template-news-card");

  cardsContainer.innerHTML = "";

  articles.forEach((article) => {
    if (!article.urlToImage) return;
    const cardClone = newsCardTemplate.content.cloneNode(true);
    fillDataInCard(cardClone, article);
    cardsContainer.appendChild(cardClone);
  });
}

function fillDataInCard(cardClone, article) {
  const newsImg = cardClone.querySelector("#news-img");
  const newsTitle = cardClone.querySelector("#news-title");
  const newsSource = cardClone.querySelector("#news-source");
  const newsDesc = cardClone.querySelector("#news-desc");

  // Analyze sentiment from title and description
  const combinedText = `${article.title} ${article.description}`;
  const sentiment = analyzeSentiment(combinedText);

  // Update sentiment indicator
  const sentimentIcon = cardClone.querySelector(".sentiment-icon");
  const sentimentLabel = cardClone.querySelector(".sentiment-label");

  sentimentIcon.className = `sentiment-icon ${getSentimentIcon(
    sentiment
  )} sentiment-${sentiment}`;
  sentimentLabel.textContent =
    sentiment.charAt(0).toUpperCase() + sentiment.slice(1);
  sentimentLabel.className = `sentiment-label sentiment-${sentiment}`;

  newsImg.src = article.urlToImage;
  newsTitle.innerHTML = article.title;
  newsDesc.innerHTML = article.description;

  const date = new Date(article.publishedAt).toLocaleString("en-US", {
    timeZone: "Asia/Jakarta",
  });

  newsSource.innerHTML = `${article.source.name} · ${date}`;

  cardClone.firstElementChild.addEventListener("click", () => {
    window.open(article.url, "_blank");
  });
}

let curSelectedNav = null;
function onNavItemClick(id) {
  fetchNews(id);
  const navItem = document.getElementById(id);
  curSelectedNav?.classList.remove("active");
  curSelectedNav = navItem;
  curSelectedNav.classList.add("active");
}

const searchButton = document.getElementById("search-button");
const searchText = document.getElementById("search-text");

searchButton.addEventListener("click", () => {
  const query = searchText.value;
  if (!query) return;
  fetchNews(query);
  curSelectedNav?.classList.remove("active");
  curSelectedNav = null;
});
