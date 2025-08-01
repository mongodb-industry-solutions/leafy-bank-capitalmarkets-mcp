"use client";

import { useState, useEffect } from "react";
import styles from "./ChatInterface.module.css";
import { Subtitle, Body, H3, H1 } from "@leafygreen-ui/typography";
import IconButton from "@leafygreen-ui/icon-button";
import Icon from "@leafygreen-ui/icon";
import Badge from "@leafygreen-ui/badge";
import Button from "@leafygreen-ui/button";
import TextInput from "@leafygreen-ui/text-input";
import Card from "@leafygreen-ui/card";
import Modal from "@leafygreen-ui/modal";
import { Skeleton } from "@leafygreen-ui/skeleton-loader";
import Typewriter from "./Typewriter";
import axios from "axios";

function generateThreadId() {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');
    return `thread_${year}${month}${day}_${hours}${minutes}${seconds}`;
}

const ChatInterface = () => {
    const [query, setQuery] = useState("");
    const [messages, setMessages] = useState([]);
    const [isAsking, setIsAsking] = useState(false);
    const [completedMessages, setCompletedMessages] = useState({});
    const [threadId, setThreadId] = useState(null);
    const [mcpToolCalls, setMcpToolCalls] = useState(null);
    const [mcpConsoleLogs, setMcpConsoleLogs] = useState(null);
    const [mcpAvailableTools, setMcpAvailableTools] = useState(null);
    const [mcpHealthStatus, setMcpHealthStatus] = useState(null);
    const [mcpLoading, setMcpLoading] = useState(true);
    const [mcpServerReady, setMcpServerReady] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);

    const suggestions = [
        "List collections in the database",
        "What is the latest available BTC close price?",
        "What are the average trading volumes for SPY on the last 7 days?",
        "Calculate volatility for ETH over the last week",
        "Compare BTC and ETH performance over the last week",
        "Show me price trends for GLD",
        "What is the current price of SPY?"
    ];

    const [suggestionIndex, setSuggestionIndex] = useState(0);

    useEffect(() => {
        // Generate a fresh threadId on component mount
        setThreadId(generateThreadId());
        
        // Check if this is a page refresh or new session
        const sessionId = sessionStorage.getItem('mcpSessionId');
        const currentSessionId = generateThreadId();
        
        if (!sessionId) {
            // New session - reset MCP Server for fresh demo
            console.log('🔄 New session detected - resetting MCP Server for fresh demo');
            sessionStorage.setItem('mcpSessionId', currentSessionId);
            loadMCPData(true);
        } else {
            // Existing session - load current state without reset
            console.log('📊 Continuing existing session - loading current MCP state');
            loadMCPData(false);
        }
    }, []);

    const handleChange = (event) => {
        setQuery(event.target.value);
    };

    const handleSuggestionClick = (suggestion) => {
        setQuery(suggestion);
        setSuggestionIndex((prevIndex) => Math.min(prevIndex + 1, suggestions.length - 1));
    };

    const loadMCPData = async (reset = false) => {
        try {
            setMcpLoading(true);
            // Only reset if explicitly requested
            const url = reset ? '/api/mcp/status?reset=true' : '/api/mcp/status';
            const response = await axios.get(url);
            const data = response.data;

            // Update with fresh data from server
            if (data.health && data.health.status !== 'unavailable') {
                console.log('📊 Loading fresh MCP data from server:', data);
                setMcpToolCalls(data.toolCalls);
                setMcpConsoleLogs(data.consoleLogs);
                setMcpAvailableTools(data.availableTools);
                setMcpHealthStatus(data.health);
                setMcpServerReady(true);
            }
        } catch (error) {
            console.error("Error loading MCP data:", error);
        } finally {
            setMcpLoading(false);
        }
    };

    const handleAsk = async () => {
        setIsAsking(true);
        try {
            // Use React Agent
            const response = await axios.post('/api/mcp/react-agent', { question: query });
            const data = response.data;
            
            console.log('🤖 React Agent response:', data);
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to process question');
            }
            
            // Format the response for display
            let answerText = data.finalAnswer || "No answer provided by the agent.";
            
            // Don't append tool results to the main answer text since we'll display them separately
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: query, isUser: true },
                { 
                    text: answerText, 
                    isUser: false, 
                    toolUsed: 'React Agent',
                    data: data.toolResults,
                    toolCalls: data.toolCalls,
                    isReactAgent: true
                }
            ]);
            
            // Update MCP data from the response if available
            if (data.status) {
                console.log('📊 Updating MCP data from response:', data.status);
                console.log('📊 Tool calls:', data.status.toolCalls.totalCalls);
                console.log('📊 Console logs:', data.status.consoleLogs.totalLogs);
                console.log('📊 Available tools:', data.status.availableTools.length);
                
                setMcpToolCalls(data.status.toolCalls);
                setMcpConsoleLogs(data.status.consoleLogs);
                setMcpAvailableTools(data.status.availableTools);
                setMcpHealthStatus(data.status.health);
                
                console.log('✅ MCP data updated from response');
            } else {
                // Fallback to loading MCP data separately
                console.log('🔄 No status data in response, loading separately...');
                loadMCPData();
            }

            setQuery("");
        } catch (error) {
            console.error("Error:", error);
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: query, isUser: true },
                { text: `Sorry, I encountered an error processing your request: ${error.message}`, isUser: false }
            ]);
        } finally {
            setIsAsking(false);
        }
    };

    const markCompleted = (messageId) => {
        setCompletedMessages((prev) => ({ ...prev, [messageId]: true }));
    };

    return (
        <div className={styles.container}>
            {/* Main Chat Panel */}
            <div className={styles.chatPanel}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        <div className={styles.headerLeft}>
                            <H1 className={styles.title}>📊 Financial Data Analysis - MongoDB MCP Server Demo</H1>
                            <Body className={styles.subtitle}>AI-powered financial insights using MongoDB MCP Server with ReAct Agent</Body>
                        </div>
                        <div className={styles.headerRight}>
                            <Badge variant="green">ReAct Agent</Badge>
                            <Badge variant="blue">Live Demo</Badge>
                            <IconButton 
                                aria-label="Info"
                                onClick={() => setShowInfoModal(true)}
                                size="large"
                            >
                                <Icon glyph="InfoWithCircle" />
                            </IconButton>
                        </div>
                    </div>
                </div>

                {/* Chat Messages */}
                <div className={styles.chatMessages}>
                    {/* Initial message */}
                    <div className={styles.chatMessage}>
                        <div className={`${styles.speechBubble} ${styles.answerBubble}`}>
                            <div className={styles.agentHeader}>
                                <Icon glyph="Laptop" className={styles.agentIcon} />
                                <Subtitle className={styles.agentPrefix}>MCP Assistant:</Subtitle>
                            </div>
                            <div>
                                {mcpLoading ? (
                                    <>
                                        <Body>
                                            🔄 <strong>MongoDB MCP Server is loading...</strong>
                                            <br /><br />
                                            Initializing connection to MongoDB Atlas and loading available tools.
                                        </Body>
                                        <div className={styles.loadingSpinner}></div>
                                    </>
                                ) : mcpServerReady ? (
                                    <>
                                        <Body>
                                            ✅ <strong>MongoDB MCP Server is ready!</strong>
                                        </Body>
                                        <div className={styles.demoNotice}>
                                            <Body>
                                                <strong>📝 Demo Notice:</strong> This is a live demo that resets on every page reload. 
                                                Each time you refresh the page, the MCP Server starts fresh with no previous tool calls or history.
                                            </Body>
                                        </div>
                                        <div className={styles.securityNotice}>
                                            <Body>
                                                <strong>🔒 Security Notice:</strong> This demo operates in <strong>read-only mode</strong> for security reasons. 
                                                While MCP supports create, update, and delete operations, we have intentionally restricted access to 
                                                list, find, and aggregate operations only. This prevents any unintended changes to our database 
                                                and ensures a safe demo environment.
                                            </Body>
                                        </div>
                                        <Body>
                                            Hi there! 👋 I am connected to MongoDB through the MCP Server in <strong>read-only mode</strong>. I use an AI-powered ReAct Agent that can understand natural language queries and automatically choose the right MCP tools.
                                        </Body>
                                        <div className={styles.demoRestrictions}>
                                            <Body>
                                                <strong>🎯 Demo Focus:</strong> This demo is specifically configured to showcase MongoDB MCP Server capabilities for <strong>financial time series data</strong>:
                                                <br /><br />
                                                • <strong>Cryptocurrencies:</strong> BTC, ETH, XRP, SOL, DOGE, ADA<br />
                                                • <strong>Stocks/ETFs:</strong> HYG, LQD, TLT, GLD, USO, EEM, QQQ, SPY, XLE, VNQ<br />
                                                • <strong>Collections:</strong> binanceCryptoData (crypto) and yfinanceMarketData (stocks)
                                            </Body>
                                        </div>
                                        <Body>
                                            <strong>🤖 ReAct Agent Capabilities:</strong> I can handle complex questions about:
                                            <br /><br />
                                            • <strong>Database exploration</strong> - List collections in the database<br />
                                            • <strong>Latest prices</strong> - What is the latest available BTC close price?<br />
                                            • <strong>Volume analysis</strong> - What are the average trading volumes for SPY on the last 7 days?<br />
                                            • <strong>Volatility calculations</strong> - Calculate volatility for ETH over the last week<br />
                                            • <strong>Performance comparisons</strong> - Compare BTC and ETH performance over the last week<br />
                                            • <strong>Price trends</strong> - Show me price trends for GLD<br />
                                            • <strong>Current prices</strong> - What is the current price of SPY?
                                        </Body>
                                        <Body>
                                            <strong>🔧 Available MCP Tools:</strong>
                                            <br /><br />
                                            • <strong>Find</strong> - Query documents from collections<br />
                                            • <strong>Aggregate</strong> - Run complex data pipelines<br />
                                            • <strong>List</strong> - Show databases, collections, and indexes
                                        </Body>
                                    </>
                                ) : (
                                    <Body>
                                        ❌ <strong>MongoDB MCP Server is unavailable</strong>
                                        <br /><br />
                                        Unable to connect to the MCP Server. Please try refreshing the page.
                                    </Body>
                                )}
                            </div>
                        </div>
                    </div>

                    {messages.map((message, index) => {
                        const isUserMessage = message.isUser;
                        return (
                            <div key={index} className={styles.chatMessage}>
                                <div className={`${styles.speechBubble} ${isUserMessage ? styles.userBubble : styles.answerBubble}`}>
                                    {isUserMessage ? (
                                        <Body>{message.text}</Body>
                                    ) : (
                                        <>
                                            <div className={styles.agentHeader}>
                                                <Icon glyph="Laptop" className={styles.agentIcon} />
                                                <Subtitle className={styles.agentPrefix}>ReAct Agent Response:</Subtitle>
                                            </div>
                                            <Body>
                                                <Typewriter
                                                    text={message.text}
                                                    messageId={index}
                                                    completedMessages={completedMessages}
                                                    markCompleted={markCompleted}
                                                />
                                            </Body>
                                        </>
                                    )}
                                </div>

                                {!isUserMessage && message.toolUsed && completedMessages[index] && (
                                    <div className={styles.toolCallsContainer}>
                                        <div className={styles.behindTheScenesLink}>
                                            <Icon className={styles.linkIcon} glyph="Wrench" />
                                            <Body className={styles.link}>
                                                ReAct Agent Tools Used:
                                            </Body>
                                        </div>
                                        {message.toolCalls && message.toolCalls.length > 0 && (
                                            <div className={styles.toolResult}>
                                                <pre className={styles.toolResultContent}>
                                                    {JSON.stringify(message.toolCalls, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                        {message.data && message.data.length > 0 && (
                                            <div className={styles.toolResult}>
                                                <Body className={styles.toolResultLabel}>Tool Results:</Body>
                                                <pre className={styles.toolResultContent}>
                                                    {JSON.stringify(message.data, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {isAsking && (
                        <div className={styles.thinkingSection}>
                            <Skeleton />
                            <div className={styles.thinkingMessage}>Processing your request with ReAct Agent...</div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className={styles.inputArea}>
                    <div className={styles.suggestions}>
                        <Body className={styles.suggestionsLabel}>Suggestions:</Body>
                        <div className={styles.suggestionChips}>
                            {suggestions.slice(suggestionIndex, suggestionIndex + 3).map((suggestion, idx) => (
                                <button
                                    key={idx}
                                    className={styles.suggestionChip}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    disabled={!mcpServerReady}
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className={styles.inputContainer}>
                        <TextInput
                            value={query}
                            onChange={handleChange}
                            placeholder={mcpServerReady ? "Ask me about BTC, stocks, or financial data..." : "MCP Server is loading..."}
                            size="large"
                            className={styles.chatInput}
                            disabled={!mcpServerReady}
                            label="Chat Input"
                            aria-label="Chat input field"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && !isAsking && query && mcpServerReady) {
                                    handleAsk();
                                }
                            }}
                        />
                        <Button 
                            onClick={handleAsk} 
                            variant="primary" 
                            size="large"
                            disabled={!query || isAsking || !mcpServerReady}
                        >
                            {isAsking ? "Processing..." : mcpServerReady ? "Send" : "Loading..."}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Side Panels */}
            <div className={styles.sidePanels}>
                {/* MCP Health Status */}
                {mcpHealthStatus && (
                    <Card className={styles.statusCard}>
                        <div className={styles.cardHeader}>
                            <H3>MCP Server Status</H3>
                            <Badge variant={mcpHealthStatus.status === 'healthy' ? 'green' : 'red'}>
                                {mcpHealthStatus.status}
                            </Badge>
                        </div>
                        <div className={styles.statusNote}>
                            <Body className={styles.statusNoteText}>
                                Demo mode: Resets on page reload • Read-only operations only
                            </Body>
                        </div>
                    </Card>
                )}

                {/* MCP Tool Calls */}
                <Card className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <H3>MCP Tool Calls</H3>
                        {mcpToolCalls && (
                            <Badge variant="darkgray">{mcpToolCalls.totalCalls}</Badge>
                        )}
                    </div>
                    <div className={styles.panelContent}>
                        {mcpLoading ? (
                            <div className={styles.loadingContainer}>
                                <Skeleton />
                            </div>
                        ) : mcpToolCalls && mcpToolCalls.recentCalls.length > 0 ? (
                            <div className={styles.toolCallsList}>
                                {mcpToolCalls.recentCalls
                                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                                    .map((call, index) => (
                                    <div key={index} className={styles.toolCall}>
                                        <div className={styles.toolCallHeader}>
                                            <Body weight="medium">#{call.id} {call.tool}</Body>
                                            <Badge 
                                                variant={call.status === 'completed' ? 'green' : call.status === 'error' ? 'red' : 'yellow'}
                                            >
                                                {call.status.toUpperCase()}
                                            </Badge>
                                        </div>
                                        <Body className={styles.toolCallTime}>
                                            {new Date(call.timestamp).toLocaleTimeString()}
                                        </Body>
                                        {call.params && Object.keys(call.params).length > 0 && (
                                            <pre className={styles.toolParams}>
                                                {JSON.stringify(call.params, null, 2)}
                                            </pre>
                                        )}
                                        {call.completedAt && (
                                            <Body className={styles.toolCallCompleted}>
                                                Completed: {new Date(call.completedAt).toLocaleTimeString()}
                                            </Body>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.emptyState}>
                                <Body>No tool calls yet</Body>
                                <Body className={styles.emptyStateNote}>
                                    Tool calls will appear here as you interact with the ReAct Agent. 
                                    The history resets on page reload for demo purposes.
                                </Body>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Console Logs */}
                <Card className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <H3>Console Logs</H3>
                        {mcpConsoleLogs && (
                            <Badge variant="darkgray">{mcpConsoleLogs.totalLogs}</Badge>
                        )}
                    </div>
                    <div className={styles.panelContent}>
                        {mcpLoading ? (
                            <div className={styles.loadingContainer}>
                                <Skeleton />
                            </div>
                        ) : mcpConsoleLogs && mcpConsoleLogs.logs.length > 0 ? (
                            <div className={styles.consoleLogsList}>
                                {mcpConsoleLogs.logs
                                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                                    .slice(0, 10)
                                    .map((log, index) => {
                                    let logType = 'info';
                                    if (log.message.includes('📢')) logType = 'notification';
                                    else if (log.message.includes('❌') || log.message.includes('⚠️')) logType = 'error';
                                    else if (log.message.includes('✅')) logType = 'success';
                                    
                                    // Format the message to show full content
                                    let displayMessage = log.message;
                                    if (log.data) {
                                        if (typeof log.data === 'object') {
                                            displayMessage += ' ' + JSON.stringify(log.data, null, 2);
                                        } else {
                                            displayMessage += ' ' + String(log.data);
                                        }
                                    }
                                    
                                    return (
                                        <div key={index} className={`${styles.consoleLog} ${styles[logType]}`}>
                                            <Body className={styles.logTime}>
                                                {new Date(log.timestamp).toLocaleTimeString()}
                                            </Body>
                                            <Body className={styles.logMessage}>{displayMessage}</Body>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className={styles.emptyState}>
                                <Body>No logs yet</Body>
                                <Body className={styles.emptyStateNote}>
                                    Console logs will appear here as the ReAct Agent processes requests. 
                                    The log history resets on page reload for demo purposes.
                                </Body>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Info Modal */}
            <Modal open={showInfoModal} setOpen={setShowInfoModal} size="large">
                <div className={styles.modalContent}>
                    <H3>About Financial Data Analysis - MongoDB MCP Server Demo</H3>
                    <Body>
                        This demo showcases the MongoDB MCP (Model Context Protocol) Server with an AI-powered ReAct Agent, providing intelligent natural language processing for financial data analysis.
                    </Body>

                    <div style={{ marginTop: '1rem' }}>
                        <Body>
                            <strong>ReAct Agent Features:</strong>
                            <ul>
                                <li><strong>Natural Language Understanding</strong> - Ask questions in plain English</li>
                                <li><strong>Intelligent Tool Selection</strong> - Automatically chooses the right MCP tools</li>
                                <li><strong>Complex Query Handling</strong> - Can combine multiple tools for comprehensive answers</li>
                                <li><strong>AWS Bedrock Integration</strong> - Powered by Claude models via SSO authentication</li>
                                <li><strong>Real-time Tool Tracking</strong> - See exactly which tools are used for each query</li>
                            </ul>
                        </Body>
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                        <Body>
                            <strong>Available Financial Data:</strong>
                            <ul>
                                <li><strong>Cryptocurrencies:</strong> BTC, ETH, XRP, SOL, DOGE, ADA</li>
                                <li><strong>Stocks/ETFs:</strong> HYG, LQD, TLT, GLD, USO, EEM, QQQ, SPY, XLE, VNQ</li>
                                <li><strong>Data Collections:</strong> binanceCryptoData, yfinanceMarketData</li>
                            </ul>
                        </Body>
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                        <Body>
                            <strong>Security & Demo Restrictions:</strong>
                            <ul>
                                <li>This demo operates in <strong>read-only mode</strong> for security</li>
                                <li>Create, update, and delete operations are intentionally disabled</li>
                                <li>Only list, find, and aggregate operations are permitted</li>
                                <li>This prevents any unintended changes to our database</li>
                                <li>Each page reload starts a fresh demo session</li>
                            </ul>
                        </Body>
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                        <Body>
                            <strong>Available MCP Tools (Read-Only):</strong>
                            <ul>
                                <li><code>find</code> - Query documents from collections</li>
                                <li><code>aggregate</code> - Run aggregation pipelines</li>
                                <li><code>list-collections</code> - List available collections</li>
                                <li><code>list-databases</code> - List available databases</li>
                                <li><code>db-stats</code> - Get database statistics</li>
                            </ul>
                        </Body>
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                        <Body>
                            <strong>Example Queries:</strong>
                            <ul>
                                <li>What is the latest BTC price?</li>
                                <li>Show me ETH price trend</li>
                                <li>Calculate volatility for SPY over the last 30 days</li>
                                <li>What are the average trading volumes for QQQ?</li>
                                <li>Compare BTC and ETH performance over the last week</li>
                                <li>Show me price trends for GLD</li>
                                <li>What collections are available?</li>
                            </ul>
                        </Body>
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                        <Body>
                            <strong>Note:</strong> In a production environment, MCP servers can support full CRUD operations (create, read, update, delete), 
                            but this demo is intentionally restricted to read-only operations for security and demonstration purposes.
                        </Body>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ChatInterface;