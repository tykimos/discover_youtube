Skip to main content
🚀 GLM Coding Plan — built for devs: 3× usage, 1/7 cost • Limited-Time Offer ➞

Overview - Z.AI DEVELOPER DOCUMENT home pagedark logo

English

Search...
⌘K

Ask AI
API Keys
Payment Method

Guides
API Reference
Scenario Example
Coding Plan
Released Notes
Terms and Policy
Help Center
Get Started
Quick Start
Overview
Pricing
Core Parameters

SDKs Guide
Migrate to GLM-4.7
Language Models
GLM-4.7
GLM-4.6
GLM-4.5
GLM-4-32B-0414-128K
Vision Language Models
GLM-4.6V
AutoGLM-Phone-Multilingual
GLM-4.5V
Image Generation Models
CogView-4
Video Generation Models
CogVideoX-3
Vidu Q1
Vidu 2
Image Generation Models
CogView-4
Audio Models
GLM-ASR-2512
Capabilities
Thinking Mode
Deep Thinking
Streaming Messages
Tool Streaming Output
Function Calling
Context Caching
Structured Output
Tools
Web Search
Stream Tool Call
Agents
GLM Slide/Poster Agent(beta)
Translation Agent
Video Effect Template Agent

On this page
Overview
Capability
Usage
Introducing GLM-4.7
Resources
Quick Start
Language Models
GLM-4.7

Copy page

​
   Overview
The GLM Coding Plan is a subscription package designed specifically for AI-powered coding. GLM-4.7 is now available in top coding tools, starting at just $3/month — powering Claude Code, Cline, OpenCode, Roo Code and more. The package is designed to make coding faster, smarter, and more reliable.
GLM-4.7 is Z.AI’s latest flagship model, featuring upgrades in two key areas: enhanced programming capabilities and more stable multi-step reasoning/execution. It demonstrates significant improvements in executing complex agent tasks while delivering more natural conversational experiences and superior front-end aesthetics.
Input Modalities
Text
Output Modalitie
Text
Context Length
200K
Maximum Output Tokens
128K
​
   Capability
Thinking Mode
Offering multiple thinking modes for different scenarios
Streaming Output
Support real-time streaming responses to enhance user interaction experience
Function Call
Powerful tool invocation capabilities, enabling integration with various external toolsets
Context Caching
Intelligent caching mechanism to optimize performance in long conversations
Structured Output
Support for structured output formats like JSON, facilitating system integration
​
   Usage
Agentic Coding

Multimodal Interaction and Real-Time Application Development

Web UI Generation and Visual Aesthetic Optimization

High-Quality Dialogue and Complex Problem Collaboration

Immersive Writing & Character-Driven Creation

Professional-Grade PPT/Poster Generation

Intelligent Search and Deep Research

​
   Introducing GLM-4.7
1
Comprehensive Coding Capability Enhancement
GLM-4.7 achieves significant breakthroughs across three dimensions: programming, reasoning, and agent capabilities:
Enhanced Programming Capabilities: Substantially improves model performance in multi-language coding and terminal agent applications; GLM-4.7 now implements a “think before acting” mechanism within programming frameworks like Claude Code, Kilo Code, TRAE, Cline, and Roo Code, delivering more stable performance on complex tasks.
Enhanced Frontend Aesthetics: GLM-4.7 shows marked progress in frontend generation quality, producing visually superior webpages, PPTs, and posters.
Enhanced Tool Invocation Capabilities: GLM-4.7 demonstrates improved tool invocation skills, scoring 67 points on the BrowseComp web task evaluation and achieving an open-source SOTA of 84.7 points on the τ²-Bench interactive tool invocation benchmark, surpassing Claude Sonnet 4.5
Enhanced reasoning capabilities: Significantly improved mathematical and reasoning skills, achieving 42.8% on the HLE (“Human Last Exam”) benchmark—a 41% increase over GLM-4.6 and surpassing GPT-5.1
Enhanced General Capabilities: GLM-4.7 delivers more concise, intelligent, and empathetic conversations, with more eloquent and immersive writing and role-playing
DescriptionCode Arena: A professional coding evaluation system with millions of global users participating in blind tests. GLM-4.7 ranks first among open-source models and domestic models, outperforming GPT-5.2
In mainstream benchmark performance, GLM-4.7’s coding capabilities align with Claude Sonnet 4.5: Achieved top open-source ranking on SWE-bench-Verified; Reached an open-source SOTA score of 84.9 on LiveCodeBench V6, surpassing Claude Sonnet 4.5; Achieved 73.8% on SWE-bench Verified (a 5.8% improvement over GLM-4.6), 66.7% on SWE-bench Multilingual (a 12.9% improvement), and 41% on Terminal Bench 2.0 (a 16.5% improvement).
Description
2
Perceived Improvement in Real Programming Scenarios
Performance on Real Programming Tasks
Controlled Evolution of Reasoning Capabilities
Comprehensive Task Execution Capabilities
Frontend Aesthetic Enhancement
In the Claude Code environment, we tested 100 real programming tasks covering core capabilities like frontend, backend, and instruction following. Results show GLM-4.7 demonstrates significant improvements over GLM-4.6 in both stability and deliverability.DescriptionWith enhanced programming capabilities, developers can more naturally organize their development workflow around “task delivery,” forming an end-to-end closed loop from requirement understanding to implementation.
​
   Resources
API Documentation: Learn how to call the API.
​
    Quick Start
The following is a full sample code to help you onboard GLM-4.7 with ease.
cURL
Official Python SDK
Official Java SDK
OpenAI Python SDK
Basic Call
curl -X POST "https://api.z.ai/api/paas/v4/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "model": "glm-4.7",
    "messages": [
      {
        "role": "user",
        "content": "As a marketing expert, please create an attractive slogan for my product."
      },
      {
        "role": "assistant",
        "content": "Sure, to craft a compelling slogan, please tell me more about your product."
      },
      {
        "role": "user",
        "content": "Z.AI Open Platform"
      }
    ],
    "thinking": {
      "type": "enabled"
    },
    "max_tokens": 4096,
    "temperature": 1.0
  }'
Streaming Call
curl -X POST "https://api.z.ai/api/paas/v4/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "model": "glm-4.7",
    "messages": [
      {
        "role": "user",
        "content": "As a marketing expert, please create an attractive slogan for my product."
      },
      {
        "role": "assistant",
        "content": "Sure, to craft a compelling slogan, please tell me more about your product."
      },
      {
        "role": "user",
        "content": "Z.AI Open Platform"
      }
    ],
    "thinking": {
      "type": "enabled"
    },
    "stream": true,
    "max_tokens": 4096,
    "temperature": 1.0
  }'
Was this page helpful?


Yes

No
Migrate to GLM-4.7
GLM-4.6
Ask a question...

x
github
discord
linkedin
