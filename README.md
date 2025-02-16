# Node.js URL Shortener (Without Express)
A simple URL Shortener built using Node.js core modules (without Express). It generates short URLs and redirects users to the original URLs.

## Features
- 🚀 Built using pure Node.js (no frameworks).
- 🔗 Shortens long URLs and saves them in a JSON file.
- 🔄 Redirects users when they visit a short URL.
- 📂 Simple file-based storage instead of a database.

## Installation
1. Clone this repository:
```sh
git clone https://github.com/shahzodjon-jumakulov/url-shortener.git
cd url-shortener
```
2. Install dependencies:
```sh
npm install
```
3. Start the server:
```sh
npm start
```
4. The server runs on `http://localhost:5000` or PORT you set in `.env`

## How It Works
### 1. Shorten a URL
Send a POST request to `/shorten` with a JSON body:
```json
{
  "url": "https://www.google.com"
}
```
The server responds with:
```json
{
  "shortUrl": "http://localhost:5000/abc123"
}
```

### 2. Redirect to the Original URL
When a user visits `http://localhost:5000/abc123`, the server looks up the original URL and redirects them.

### 3. Storage
The URLs are stored in `data.json` in this format:
```json
{
  "abc123": "https://www.google.com"
}
```

## API Endpoints
`POST`	`/shorten`	Shorten a long URL (JSON body).  
`GET`	`/:shortUrl`	Redirect to the original URL.
