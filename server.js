import http from "http";
import fs from "fs/promises";
import { isValidURL } from "./utils.js";
import { nanoid } from "nanoid";
const PORT = process.env.PORT || 5000;

const urls = [];

const methodNotAllowed = (req, res) => {
  res.statusCode = 405;
  res.write(
    JSON.stringify({
      error: "Method Not Allowed",
      message: `${req.method} is not allowed for ${req.url}.`,
      status: 405,
    })
  );
  res.end();
};

const writeFile = async (url) => {
  let shortUrl;
  await fs
    .readFile("./data.json", "utf-8")
    .then((data) => {
      const body = JSON.parse(data);
      shortUrl = nanoid(4);
      if (body[shortUrl] === undefined) body[shortUrl] = url;
      fs.writeFile("./data.json", JSON.stringify(body));
    })
    .catch((err) => {
      const body = {};
      body[nanoid(4)] = url;
      fs.writeFile("./data.json", JSON.stringify(body));
    });
  return shortUrl;
};

const createShortUrl = (req, res) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", async () => {
    if (!body) {
      res.statusCode = 400;
      res.write(
        JSON.stringify({
          error: "Bad request",
          message:
            "The request body cannot be empty. Please provide the required data.",
          status: 400,
        })
      );
      res.end();
      return;
    }
    try {
      const reqBody = JSON.parse(body);
      const url = reqBody.url;
      if (!url) {
        res.writeHead(400, { "content-type": "application/json" });
        res.end(
          JSON.stringify({
            error: "Bad request",
            message: "Missing required field: 'url'.",
            status: 400,
          })
        );
      } else if (!isValidURL(url)) {
        res.writeHead(400, { "content-type": "application/json" });
        res.end(
          JSON.stringify({
            error: "Bad request",
            message: "Invalid URL format.",
            status: 400,
          })
        );
      } else {
        const shortUrl = await writeFile(url);
        res.writeHead(201, { "content-type": "application/json" });
        res.end(
          JSON.stringify({
            message: "URL shortened successfully",
            data: { url, shortUrl: `http://localhost:${PORT}/${shortUrl}` },
            status: 201,
          })
        );
      }
    } catch (error) {
      res.writeHead(400, { "content-type": "application/json" });
      res.end(
        JSON.stringify({
          error: "Bad request",
          message: "Invalid JSON format in request body.",
          status: 400,
        })
      );
    }
  });
};

const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");

  // Home page '/'
  if (req.url === "/") {
    res.statusCode = 200;
    res.write(JSON.stringify({ data: "API is working" }));
    res.end();
  }

  // POST to '/shorten'
  else if (req.url === "/shorten") {
    if (req.method === "POST") {
      createShortUrl(req, res);
    } else {
      methodNotAllowed(req, res);
    }
  }

  // GET short url
  else if (req.url.length === 5) {
    if (req.method !== "GET") {
      methodNotAllowed(req, res);
    } else {
      const shortUrl = req.url.slice(1);
      fs.readFile("./data.json", "utf-8").then((data) => {
        const body = JSON.parse(data);
        if (body[shortUrl] === undefined) {
          res.statusCode = 404;
          res.write(
            JSON.stringify({
              error: "URL not found",
              message: `Short URL is not found from database.`,
              status: 404,
            })
          );
          res.end();
        } else {
          res.statusCode = 302;
          res.setHeader("Location", body[shortUrl]);
          res.end();
        }
      });
    }
  }

  // Route not found
  else {
    res.statusCode = 404;
    res.write(
      JSON.stringify({
        message: "Route Not Found",
        status: 404,
      })
    );
    res.end();
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
