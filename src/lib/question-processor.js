// Natural language question processing
export function processQuestion(question) {
  const lowerQuestion = question.toLowerCase();
  
  // BTC/Crypto questions
  if (lowerQuestion.includes('btc') || lowerQuestion.includes('bitcoin')) {
    if (lowerQuestion.includes('latest') || lowerQuestion.includes('current') || lowerQuestion.includes('last')) {
      return {
        tool: 'find',
        params: {
          database: 'agentic_capital_markets',
          collection: 'binanceCryptoData',
          filter: { symbol: 'BTC' },
          projection: { symbol: 1, close: 1, timestamp: 1, _id: 0 },
          sort: { timestamp: -1 },
          limit: 1
        },
        response: 'Finding the latest BTC price from the database...'
      };
    }
    
    if (lowerQuestion.includes('daily') || lowerQuestion.includes('average') || lowerQuestion.includes('stats')) {
      return {
        tool: 'aggregate',
        params: {
          database: 'agentic_capital_markets',
          collection: 'binanceCryptoData',
          pipeline: [
            { $match: { symbol: 'BTC' } },
            { $group: { _id: null, avgClose: { $avg: '$close' }, minClose: { $min: '$close' }, maxClose: { $max: '$close' }, count: { $sum: 1 } } }
          ]
        },
        response: 'Calculating daily BTC statistics...'
      };
    }
  }

  // ETH questions
  if (lowerQuestion.includes('eth') || lowerQuestion.includes('ethereum')) {
    if (lowerQuestion.includes('latest') || lowerQuestion.includes('current') || lowerQuestion.includes('last')) {
      return {
        tool: 'find',
        params: {
          database: 'agentic_capital_markets',
          collection: 'binanceCryptoData',
          filter: { symbol: 'ETH' },
          projection: { symbol: 1, close: 1, timestamp: 1, _id: 0 },
          sort: { timestamp: -1 },
          limit: 1
        },
        response: 'Finding the latest ETH price from the database...'
      };
    }

    if (lowerQuestion.includes('trend') || lowerQuestion.includes('history') || lowerQuestion.includes('last')) {
      return {
        tool: 'find',
        params: {
          database: 'agentic_capital_markets',
          collection: 'binanceCryptoData',
          filter: { symbol: 'ETH' },
          projection: { symbol: 1, close: 1, timestamp: 1, _id: 0 },
          sort: { timestamp: -1 },
          limit: 10
        },
        response: 'Finding recent ETH price history...'
      };
    }
  }
  
  // Stock questions (EEM, AAPL, etc.)
  if (lowerQuestion.includes('eem') || lowerQuestion.includes('aapl') || lowerQuestion.includes('stock')) {
    let symbol = 'AAPL'; // default
    if (lowerQuestion.includes('eem')) symbol = 'EEM';
    if (lowerQuestion.includes('aapl')) symbol = 'AAPL';
    
    return {
      tool: 'find',
      params: {
        database: 'agentic_capital_markets',
        collection: 'yfinanceMarketData',
        filter: { symbol: symbol },
        projection: { symbol: 1, close: 1, timestamp: 1, _id: 0 },
        sort: { timestamp: -1 },
        limit: 1
      },
      response: `Finding the latest ${symbol} stock price...`
    };
  }
  
  // General database questions
  if (lowerQuestion.includes('collections') || lowerQuestion.includes('tables') || lowerQuestion.includes('available')) {
    return {
      tool: 'list-collections',
      params: { database: 'agentic_capital_markets' },
      response: 'Listing available collections in the database...'
    };
  }

  // Database schema or structure
  if (lowerQuestion.includes('schema') || lowerQuestion.includes('structure') || lowerQuestion.includes('fields')) {
    return {
      tool: 'find',
      params: {
        database: 'agentic_capital_markets',
        collection: 'binanceCryptoData',
        filter: {},
        projection: {},
        limit: 1
      },
      response: 'Showing database schema and structure...'
    };
  }
  
  return {
    tool: null,
    params: null,
    response: 'I can help you with questions about cryptocurrency (BTC, ETH), stocks (EEM, AAPL), and database information. Try asking about "latest BTC price" or "EEM stock price".'
  };
}