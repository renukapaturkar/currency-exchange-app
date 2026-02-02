# Currency Exchange App

A full-stack currency conversion application that lets users convert amounts between different currencies using live exchange rates.

This project includes both a **frontend** and a **backend** — making it suitable as a portfolio piece or demo project for full-stack development.  

# USER RESEARCH AND OTHER RESEARCH DOCUMENT : THE QUESTIONS ASKED IN THE ASSESSMENT CAN BE FOUND HERE: 
https://docs.google.com/document/d/1ZLhN0QnooNK1uTv89aDlebk2dfEtRLQeahOTBL_OpzI/edit?usp=sharing

---

## Demo

> A live demo may be available at:  
> https://currency-exchange-app-zeta.vercel.app

---

## Features

The Currency Exchange App provides:

- Convert a currency amount from one currency to another
- Fetches live exchange rates from a public API
- Full-stack implementation with a separate backend API
- Ready for deployment

---

## Project Structure

currency-exchange-app/
├── backend/ # Server API for exchange rates
├── frontend/ # Web app (UI) consuming the backend
├── .gitignore
├── decisions.md # Architecture / design decisions
├── vercel.json # Deployment config

## Tech Stack

**Frontend**  
-ReactJS, TailwindCSS

**Backend**  
- Node.js
- API logic to fetch live exchange rates
- Environment variables for configuration

**APIs & Services**  
- Uses a public exchange rate API ( ExchangeRate-API, Open Exchange Rates, Fixer.io)API are used in given order for the fallback mechanism.

## improvements in Progress

The following areas are currently being worked on and need further refinement:

- **UI Bug**: The quick swap button to swap the source and target currencies is not working 
- **API Caching Issue**: [resolved]
- **UI Enhancement**: Add a historical exchange rate chart to help users visualize currency trends over time. []
- **Deploymentissue**: Deployment is not working, currently the issue is being looked into.  [resolved] single deployment of both frontend and backend was causing issue, now it is fixed. 




