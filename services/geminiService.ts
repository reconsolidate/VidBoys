
import { GoogleGenAI, Type } from "@google/genai";
import { VidBuddyConfig, VidBuddyOutput } from "../types";

export class GeminiService {
  // Removed persistent property and constructor to comply with "Create instance right before use" rule.

  // Use a text agent to process the "Director Logic"
  async processDirectorAgent(prompt: string, config: VidBuddyConfig): Promise<VidBuddyOutput> {
    // Instantiate GoogleGenAI right before use to ensure the latest API key is used.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `You are the VidBuddy Core Director. Parse this user request: "${prompt}".
      Output the breakdown in JSON format.
      Config: Resolution=${config.resolution}, Aspect=${config.aspectRatio}, MotionBucket=${config.motionBucket}.
      Follow the System Manifest Response Protocol: 
      1. Physics Engine state
      2. Audio Sync state
      3. Scene Description (Detailed for a video model)
      4. Audio Prompt`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            physicsEngine: { type: Type.STRING },
            audioSync: { type: Type.STRING },
            sceneDescription: { type: Type.STRING },
            audioPrompt: { type: Type.STRING },
            directorMemory: { type: Type.STRING }
          },
          required: ["physicsEngine", "audioSync", "sceneDescription", "audioPrompt", "directorMemory"]
        }
      }
    });

    const data = JSON.parse(response.text);
    return {
      status: {
        physicsEngine: data.physicsEngine as any,
        audioSync: data.audioSync as any,
        directorMemory: data.directorMemory
      },
      visualOutput: data.sceneDescription,
      audioOutput: data.audioPrompt
    };
  }

  async generateVideo(prompt: string, config: VidBuddyConfig, onProgress?: (msg: string) => void): Promise<string> {
    // Instantiate GoogleGenAI right before use to ensure the latest API key is used.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    onProgress?.("Initializing Veo Engine...");
    
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: config.resolution,
        aspectRatio: config.aspectRatio
      }
    });

    onProgress?.("Rendering Diffusion Transformer...");

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      onProgress?.(`Processing frames... ${(Math.random() * 100).toFixed(0)}% simulated`);
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video generation failed");

    // Must fetch using API key as per guidelines
    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await videoResponse.blob();
    return URL.createObjectURL(blob);
  }

  async generateVideoI2V(imageB64: string, prompt: string, config: VidBuddyConfig, onProgress?: (msg: string) => void): Promise<string> {
    // Instantiate GoogleGenAI right before use to ensure the latest API key is used.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    onProgress?.("Parsing Image Metadata...");

    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      image: {
        imageBytes: imageB64,
        mimeType: 'image/png'
      },
      config: {
        numberOfVideos: 1,
        resolution: config.resolution,
        aspectRatio: config.aspectRatio
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      onProgress?.("Interpolating motion vectors...");
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await videoResponse.blob();
    return URL.createObjectURL(blob);
  }
}

export const geminiService = new GeminiService();
