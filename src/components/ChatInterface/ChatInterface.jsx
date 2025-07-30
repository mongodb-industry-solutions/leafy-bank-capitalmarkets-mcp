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
    const [mcpLoading, setMcpLoading] = useState(true); // Start with loading true
    const [mcpServerReady, setMcpServerReady] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);

    const suggestions = [
        "What is the latest BTC price?",
        "Show me ETH price trend",
        "What are BTC daily statistics?",
        "Show me the latest AAPL stock price",
        "What collections are available in the database?"
    ];

    const [suggestionIndex, setSuggestionIndex] = useState(0);

    useEffect(() => {
        // Generate a fresh threadId on component mount
        setThreadId(generateThreadId());
        
        // Load initial MCP data (server will provide fresh state)
        loadMCPData();
    }, []);

    // Load initial MCP data only once
    useEffect(() => {
        // Initial load only - no periodic refresh
        loadMCPData();
    }, []);

    const handleChange = (event) => {
        setQuery(event.target.value);
    };

    const handleSuggestionClick = (suggestion) => {
        setQuery(suggestion);
        setSuggestionIndex((prevIndex) => Math.min(prevIndex + 1, suggestions.length - 1));
    };

    // MCP Demo functions
    

    const loadMCPData = async () => {
        try {
            setMcpLoading(true);
            const response = await axios.get('/api/mcp/status');
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
            const response = await axios.post('/api/mcp/ask', { question: query });
            const data = response.data;
            
            const { answer, toolUsed, data: resultData, status } = data;
            console.log('📥 Received response with status:', !!status);

            setMessages((prevMessages) => [
                ...prevMessages,
                { text: query, isUser: true },
                { 
                    text: answer, 
                    isUser: false, 
                    toolUsed: toolUsed,
                    data: resultData
                }
            ]);

            setQuery("");
            
            // Update MCP data from the response if available
            if (status) {
                console.log('📊 Updating MCP data from response:', status);
                console.log('📊 Tool calls:', status.toolCalls.totalCalls);
                console.log('📊 Console logs:', status.consoleLogs.totalLogs);
                console.log('📊 Available tools:', status.availableTools.length);
                
                setMcpToolCalls(status.toolCalls);
                setMcpConsoleLogs(status.consoleLogs);
                setMcpAvailableTools(status.availableTools);
                setMcpHealthStatus(status.health);
                
                console.log('✅ MCP data updated from response');
            } else {
                // Fallback to loading MCP data separately
                console.log('🔄 No status data in response, loading separately...');
                loadMCPData();
            }
        } catch (error) {
            console.error("Error:", error);
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: query, isUser: true },
                { text: "Sorry, I encountered an error processing your request.", isUser: false }
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
                            <H1 className={styles.title}>MongoDB MCP Server Demo</H1>
                            <Body className={styles.subtitle}>Ask questions about stocks and crypto using MongoDB MCP Server</Body>
                        </div>
                        <div className={styles.headerRight}>
                            <Badge variant="green">Live Demo</Badge>
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
                            <Body>
                                {mcpLoading ? (
                                    <>
                                        🔄 <strong>MongoDB MCP Server is loading...</strong>
                                        <br /><br />
                                        Initializing connection to MongoDB Atlas and loading available tools.
                                        <br /><br />
                                        <div className={styles.loadingSpinner}></div>
                                    </>
                                ) : mcpServerReady ? (
                                    <>
                                        ✅ <strong>MongoDB MCP Server is ready!</strong>
                                        <br /><br />
                                        <div className={styles.demoNotice}>
                                            <strong>📝 Demo Notice:</strong> This is a live demo that resets on every page reload. 
                                            Each time you refresh the page, the MCP Server starts fresh with no previous tool calls or history.
                                        </div>
                                        <br /><br />
                                        <div className={styles.securityNotice}>
                                            <strong>🔒 Security Notice:</strong> This demo operates in <strong>read-only mode</strong> for security reasons. 
                                            While MCP supports create, update, and delete operations, we have intentionally restricted access to 
                                            list, find, and aggregate operations only. This prevents any unintended changes to our database 
                                            and ensures a safe demo environment.
                                        </div>
                                        <br /><br />
                                        Hi there! 👋 I am connected to MongoDB through the MCP Server in <strong>read-only mode</strong>. I can perform basic operations like:
                                        <br /><br />
                                        • <strong>Find</strong> - Query documents from collections<br />
                                        • <strong>Aggregate</strong> - Run complex data pipelines<br />
                                        • <strong>List</strong> - Show databases, collections, and indexes<br />
                                        • <strong>Count</strong> - Get document counts
                                        <br /><br />
                                        Ask me about:
                                        <br /><br />
                                        • <strong>Cryptocurrency prices</strong> - What is the latest BTC price?<br />
                                        • <strong>Stock information</strong> - Show me Apple stock price<br />
                                        • <strong>Daily statistics</strong> - BTC daily stats<br />
                                        • <strong>Database info</strong> - What collections are available?
                                    </>
                                ) : (
                                    <>
                                        ❌ <strong>MongoDB MCP Server is unavailable</strong>
                                        <br /><br />
                                        Unable to connect to the MCP Server. Please try refreshing the page.
                                    </>
                                )}
                            </Body>
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
                                                <Subtitle className={styles.agentPrefix}>MCP Response:</Subtitle>
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
                                            <Body className={styles.link}>MCP Tool Used: {message.toolUsed}</Body>
                                        </div>
                                        {message.data && (
                                            <div className={styles.toolResult}>
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
                            <div className={styles.thinkingMessage}>Processing your request...</div>
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
                            {isAsking ? "Asking..." : mcpServerReady ? "Send" : "Loading..."}
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
                                {mcpToolCalls.recentCalls.map((call, index) => (
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
                                    Tool calls will appear here as you interact with the MCP Server. 
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
                                {mcpConsoleLogs.logs.slice(-10).map((log, index) => {
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
                                    Console logs will appear here as the MCP Server processes requests. 
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
                    <H3>About MongoDB MCP Server</H3>
                    <Body>
                        This demo showcases the MongoDB MCP (Model Context Protocol) Server, which provides a standardized way for AI applications to interact with MongoDB databases.
                    </Body>

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
                            <strong>Key Features:</strong>
                            <ul>
                                <li>Direct database queries through MCP protocol</li>
                                <li>Real-time tool call tracking</li>
                                <li>Complete transparency into database operations</li>
                                <li>Support for find, aggregate, and list operations</li>
                                <li>Secure, read-only access to data</li>
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
                                <li><code>count</code> - Get document counts</li>
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
                                <li>What are BTC daily statistics?</li>
                                <li>Show me the latest AAPL stock price</li>
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