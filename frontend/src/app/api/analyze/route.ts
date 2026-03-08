import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import * as cheerio from 'cheerio';
import { z } from 'zod';
// Load from the .env.local file
const openAIProvider = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

const slideSchema = z.object({
  slides: z.array(
    z.object({
      type: z.enum(['hero', 'stat', 'grid', 'insight', 'action']),
      id: z.string(),
      title: z.string().nullable().describe('Title for hero, grid, or action slides (e.g., "Systemic Shockwaves" or "Recommendations")'),
      subtitle: z.string().nullable().describe('A brief, 1-2 sentence summary for hero slides'),
      value: z.string().nullable().describe('A massive number or metric for stat slide, e.g., "$2.4B", "+14%"'),
      label: z.string().nullable().describe('A short uppercase label for stat slide, e.g., "DEFICIT"'),
      description: z.string().nullable().describe('An explanation for stat slide or grid slide'),
      gradient: z.enum([
        'from-red-500 to-orange-400',
        'from-blue-500 to-cyan-400',
        'from-emerald-500 to-teal-400',
        'from-purple-500 to-indigo-400',
        'from-pink-500 to-rose-400'
      ]).nullable().describe('Select a suitable gradient color theme for stat slide'),
      stats: z.array(
        z.object({
          label: z.string().describe('Short label for grid item'),
          value: z.string().describe('Short value for grid item'),
        })
      ).nullable().describe('Exactly 3 secondary metrics for grid slide'),
      content: z.string().nullable().describe('A powerful quote or inference for insight slide'),
      author: z.string().nullable().describe('Who said it for insight slide'),
      options: z.array(z.string()).nullable().describe('Exactly 3 actionable recommendations for action slide'),
    })
  )
});

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // 1. Fetch and parse the article text
    let textContent = '';
    try {
      // Create a more robust fetch request, bypassing some simple blocks
      const response = await fetch(url, { 
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      const html = await response.text();
      const $ = cheerio.load(html);
      
      // Remove unwanted elements
      $('script, style, nav, footer, iframe, img, svg, noscript, header').remove();
      
      // Extract main text (try article tag first, then fallback to body text)
      const articleText = $('article').text().trim();
      textContent = articleText ? articleText : $('body').text().trim();
      
      // Clean up whitespace
      textContent = textContent.replace(/\s+/g, ' ').substring(0, 15000); // Send max ~15k chars to LLM
    } catch (e) {
      console.error('Failed to fetch article text directly:', e);
      try {
        console.log('Attempting fallback fetch via public proxy API...');
        // Fallback to a proxy to bypass simple IP/Connection blocks (ECONNRESET)
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
        const fbRes = await fetch(proxyUrl);
        const fbDataText = await fbRes.text();
        
        let fbData;
        try {
          fbData = JSON.parse(fbDataText);
        } catch (parseErr) {
          console.error('Failed to parse fallback proxy response:', fbDataText.substring(0, 200));
          throw new Error("Proxy returned HTML instead of JSON.");
        }
        
        if (fbData.contents) {
          const $ = cheerio.load(fbData.contents);
          $('script, style, nav, footer, iframe, img, svg, noscript, header').remove();
          const articleText = $('article').text().trim();
          textContent = articleText ? articleText : $('body').text().trim();
          textContent = textContent.replace(/\s+/g, ' ').substring(0, 15000);
        } else {
           throw new Error("No contents in fallback proxy.");
        }
      } catch (fallbackError) {
         console.error('Fallback fetch also failed:', fallbackError);
         return NextResponse.json({ error: 'Failed to access the provided URL completely.' }, { status: 400 });
      }
    }

    if (!textContent || textContent.length < 100) {
      return NextResponse.json({ error: 'Not enough text content found at URL' }, { status: 400 });
    }

    // 2. Pass the text to OpenAI via the AI SDK
    const { object } = await generateObject({
      model: openAIProvider('gpt-4o-mini'),
      schema: slideSchema,
      prompt: `Analyze the following article text and create an engaging 5-slide presentation.
      
      The presentation must follow this exact sequence:
      1. A "hero" slide introducing the topic.
      2. A "stat" slide highlighting the single most dramatic/important metric from the text.
      3. A "grid" slide detailing exactly 3 secondary ripple effects or stats.
      4. An "insight" slide with a powerful profound quote or inference from the text.
      5. An "action" slide with exactly 3 strategic, actionable recommendations for a business reading this news.
      
      Keep the tone professional, analytical, and highly engaging.
      
      Article Text:
      ${textContent}`,
    });

    return NextResponse.json({ slides: object.slides });
  } catch (error: any) {
    console.error('Error generating slides:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
