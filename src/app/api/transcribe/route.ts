import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getWhisperPrompt, correctTranscription } from '@/lib/skt-dictionary';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const speaker = formData.get('speaker') as string || 'unknown';

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    // OpenAI API로 음성을 텍스트로 변환
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'gpt-4o-transcribe',
      language: 'ko',
      response_format: 'json',
      prompt: getWhisperPrompt(),
    });

    // 딕셔너리 기반 후보정 (오인식 상품명 교정)
    const correctedText = correctTranscription(transcription.text);

    return NextResponse.json({
      text: correctedText,
      speaker,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Transcription error:', error);

    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: `OpenAI API Error: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}
